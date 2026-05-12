#!/usr/bin/env bash
# 1) Dump local DB to db_backups/
# 2) Dump remote DB to db_backups/
# 3) Replace local DB with the remote backup
#
# Remote DB: set REMOTE_DB_* env vars, or create api/.env.remote with:
#   REMOTE_DB_HOST=your-remote-host
#   REMOTE_DB_PORT=5432
#   REMOTE_DB_NAME=government_projects
#   REMOTE_DB_USER=your_user
#   REMOTE_DB_PASSWORD=your_password
#
# Remote pg_dump: the client must be >= the server's major version (e.g. PG16 server needs
# pg_dump 16+). Set PG_DUMP_REMOTE to a pg_dump binary, or install postgresql-client-16
# (Ubuntu: apt install postgresql-client-16 from PGDG — see PostgreSQL Linux downloads).
#
# Remote pg_dump and non-superuser roles: by default we exclude schemas that commonly
# require elevated rights (other,beta,huduma). Override with PGDUMP_EXCLUDE_SCHEMAS= or
# PGDUMP_SCHEMAS=public, or disable defaults: PGDUMP_NO_DEFAULT_EXCLUDES=1
#
# Local DROP DATABASE / CREATE DATABASE require the database owner or a superuser. If
# DB_USER cannot drop the DB (must be owner), set in api/.env or api/.env.remote:
#   LOCAL_DB_ADMIN_USER=postgres
#   LOCAL_DB_ADMIN_PASSWORD=...
# Step 3 creates the DB with OWNER DB_USER then restores as DB_USER so objects match app role.
#
# To avoid touching the current DB_NAME (e.g. you forgot postgres password), create a NEW
# database and point the app at it:
#   RESTORE_TARGET_DB=revised_gov_from_remote ./scripts/sync-remote-db-to-local.sh
# Requires DB_USER to have CREATEDB (or use sudo -u postgres create database ... once).
# If postgres created the DB for you, restore only (no DROP/CREATE):
#   RESTORE_ONLY=1 RESTORE_TARGET_DB=... SKIP_REMOTE_DUMP=1 REMOTE_BACKUP_FILE=.../remote_....sql ...
# If "must be owner of schema public", the script tries sudo -u postgres ALTER SCHEMA; or run:
#   sudo -u postgres psql -d YOUR_DB -c 'ALTER SCHEMA public OWNER TO "YOUR_DB_USER"'
#
# If restore fails on CREATE EXTENSION vector (pgvector): install the extension for your
# local server major version, e.g. Ubuntu PGDG: sudo apt install postgresql-14-pgvector
# Or run PostgreSQL 16 locally to match a PG16 remote dump.
# The script pre-creates extensions in PRECREATE_EXTENSIONS (default: vector) as superuser
# (sudo -u postgres or LOCAL_DB_ADMIN_USER), then replays the dump as DB_USER with those
# CREATE EXTENSION lines stripped to avoid duplicate/superuser errors.

set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/db_backups}"
TS=$(date +%Y%m%d_%H%M%S)
API_ENV="${PROJECT_ROOT}/api/.env"
REMOTE_ENV="${PROJECT_ROOT}/api/.env.remote"
mkdir -p "$BACKUP_DIR"

# Load local DB config
if [[ ! -f "$API_ENV" ]]; then
  echo "Missing ${API_ENV}"
  exit 1
fi
source "$API_ENV"
LOCAL_HOST="${DB_HOST:-127.0.0.1}"
LOCAL_PORT="${DB_PORT:-5432}"
LOCAL_USER="${DB_USER}"
LOCAL_PASS="${DB_PASSWORD}"
LOCAL_DB="${DB_NAME}"

# Who can DROP/CREATE database locally (defaults to DB_USER if unset).
LOCAL_ADMIN_USER="${LOCAL_DB_ADMIN_USER:-${DB_USER}}"
LOCAL_ADMIN_PASS="${LOCAL_DB_ADMIN_PASSWORD:-${DB_PASSWORD}}"

# Load remote DB config (api/.env.remote or REMOTE_DB_* env)
if [[ -f "$REMOTE_ENV" ]]; then
  source "$REMOTE_ENV"
fi
REMOTE_HOST="${REMOTE_DB_HOST:?Set REMOTE_DB_HOST or create api/.env.remote}"
REMOTE_PORT="${REMOTE_DB_PORT:-5432}"
REMOTE_USER="${REMOTE_DB_USER:?Set REMOTE_DB_USER}"
REMOTE_PASS="${REMOTE_DB_PASSWORD:?Set REMOTE_DB_PASSWORD}"
REMOTE_DB="${REMOTE_DB_NAME:-government_projects}"

# Optional: restore into this DB name instead of replacing DB_NAME (leaves DB_NAME unchanged).
RESTORE_TARGET_DB="${RESTORE_TARGET_DB:-}"

# pg_dump used only for the remote server (must match or exceed server major version).
resolve_pg_dump_remote() {
  if [[ -n "${PG_DUMP_REMOTE:-}" && -x "${PG_DUMP_REMOTE}" ]]; then
    echo "$PG_DUMP_REMOTE"
    return
  fi
  local v p
  for v in 18 17 16; do
    p="/usr/lib/postgresql/${v}/bin/pg_dump"
    if [[ -x "$p" ]]; then
      echo "$p"
      return
    fi
  done
  echo "pg_dump"
}

PG_DUMP_REMOTE_BIN="$(resolve_pg_dump_remote)"

# After CREATE DATABASE ... OWNER appuser, schema public may still be owned by postgres
# (from template), causing "must be owner of schema public" on psql -f. Superuser must:
#   ALTER SCHEMA public OWNER TO appuser
fix_public_schema_for_app_user() {
  local dbname="$1"
  [[ "${RESTORE_FIX_PUBLIC_SCHEMA:-1}" != "1" ]] && return 0
  echo "    Ensuring schema public is owned by ${LOCAL_USER}..."
  if [[ -n "${LOCAL_DB_ADMIN_USER:-}" && "$LOCAL_DB_ADMIN_USER" != "$LOCAL_USER" ]]; then
    export PGPASSWORD="$LOCAL_ADMIN_PASS"
    if psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_DB_ADMIN_USER" -d "$dbname" -v ON_ERROR_STOP=1 \
      -c "ALTER SCHEMA public OWNER TO \"${LOCAL_USER}\";"; then
      unset PGPASSWORD
      echo "    OK (LOCAL_DB_ADMIN_USER)."
      return 0
    fi
    unset PGPASSWORD
  fi
  # Local socket + peer auth (typical when sudo -u postgres)
  if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
    if sudo -n -u postgres psql -d "$dbname" -v ON_ERROR_STOP=1 \
      -c "ALTER SCHEMA public OWNER TO \"${LOCAL_USER}\";"; then
      echo "    OK (sudo -u postgres, local socket)."
      return 0
    fi
    if sudo -n -u postgres psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -d "$dbname" -v ON_ERROR_STOP=1 \
      -c "ALTER SCHEMA public OWNER TO \"${LOCAL_USER}\";"; then
      echo "    OK (sudo -u postgres, TCP)."
      return 0
    fi
  fi
  echo "ERROR: could not ALTER SCHEMA public OWNER. Run as superuser, then re-run restore:" >&2
  echo "  sudo -u postgres psql -d \"${dbname}\" -c 'ALTER SCHEMA public OWNER TO \"${LOCAL_USER}\"'" >&2
  echo "If restore partially applied, drop the database and create it empty again before RESTORE_ONLY." >&2
  return 1
}

# CREATE EXTENSION ... requires superuser; app user restore fails. Pre-create as postgres, then
# strip matching CREATE EXTENSION lines from the dump so replay does not error (already exists).
# Sets PRECREATED_EXT_<name>=1 for each success (bash variable names: use sanitized ext).
precreate_superuser_extensions() {
  local dbname="$1"
  [[ "${PRECREATE_SUPERUSER_EXTENSIONS:-1}" != "1" ]] && return 0
  local exts="${PRECREATE_EXTENSIONS:-vector}"
  echo "    Pre-creating extensions that require superuser (${exts})..."
  IFS=',' read -ra arr <<< "${exts// /}"
  local ext
  for ext in "${arr[@]}"; do
    [[ -z "$ext" ]] && continue
    local ok=0
    if [[ -n "${LOCAL_DB_ADMIN_USER:-}" && "$LOCAL_DB_ADMIN_USER" != "$LOCAL_USER" ]]; then
      export PGPASSWORD="$LOCAL_ADMIN_PASS"
      if psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_DB_ADMIN_USER" -d "$dbname" -v ON_ERROR_STOP=1 \
        -c "CREATE EXTENSION IF NOT EXISTS \"${ext}\";" 2>/dev/null; then
        unset PGPASSWORD
        echo "    OK: extension ${ext} (LOCAL_DB_ADMIN_USER)"
        ok=1
      else
        unset PGPASSWORD
      fi
    fi
    if [[ "$ok" -eq 0 ]] && command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
      if sudo -n -u postgres psql -d "$dbname" -v ON_ERROR_STOP=1 -c "CREATE EXTENSION IF NOT EXISTS \"${ext}\";" 2>/dev/null; then
        echo "    OK: extension ${ext} (sudo -u postgres)"
        ok=1
      elif sudo -n -u postgres psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -d "$dbname" -v ON_ERROR_STOP=1 \
        -c "CREATE EXTENSION IF NOT EXISTS \"${ext}\";" 2>/dev/null; then
        echo "    OK: extension ${ext} (sudo -u postgres TCP)"
        ok=1
      fi
    fi
    if [[ "$ok" -eq 1 ]]; then
      declare -g "PRECREATED_EXT_${ext}=1"
    else
      echo "WARN: could not pre-create extension \"${ext}\" (install package, e.g. postgresql-14-pgvector, then):" >&2
      echo "  sudo -u postgres psql -d \"${dbname}\" -c 'CREATE EXTENSION IF NOT EXISTS ${ext};'" >&2
    fi
  done
  return 0
}

# Drop CREATE EXTENSION lines for extensions that were pre-created (avoids "already exists").
strip_precrated_extension_lines() {
  local src="$1"
  shift
  local ext current="$src" tmp vn
  for ext in "$@"; do
    [[ -z "$ext" ]] && continue
    vn="PRECREATED_EXT_${ext}"
    if [[ -n "${!vn:-}" ]]; then
      tmp="$(mktemp)"
      grep -Ev "^CREATE EXTENSION[[:space:]]+(IF NOT EXISTS[[:space:]]+)?[\"']?${ext}[\"']?([[:space:]]|;|$)" "$current" > "$tmp" || cp "$current" "$tmp"
      [[ "$current" != "$src" ]] && rm -f "$current"
      current="$tmp"
    fi
  done
  cat "$current"
  [[ "$current" != "$src" ]] && rm -f "$current"
}

run_appuser_sql_restore() {
  local dbname="$1"
  local sqlfile="$2"
  local exts="${PRECREATE_EXTENSIONS:-vector}"
  local tmpf
  tmpf="$(mktemp)"
  IFS=',' read -ra elist <<< "${exts// /}"
  strip_precrated_extension_lines "$sqlfile" "${elist[@]}" > "$tmpf"
  psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$dbname" -v ON_ERROR_STOP=1 -f "$tmpf"
  rm -f "$tmpf"
}

# Extra pg_dump flags for REMOTE only (non-superuser roles cannot LOCK tables in some schemas).
REMOTE_PGDUMP_ARGS=()
if [[ -n "${PGDUMP_SCHEMAS:-}" ]]; then
  IFS=',' read -ra _parts <<< "${PGDUMP_SCHEMAS// /}"
  for s in "${_parts[@]}"; do
    [[ -n "$s" ]] && REMOTE_PGDUMP_ARGS+=(--schema="$s")
  done
else
  _excludes="${PGDUMP_EXCLUDE_SCHEMAS:-}"
  if [[ -z "$_excludes" && "${PGDUMP_NO_DEFAULT_EXCLUDES:-0}" != "1" ]]; then
    _excludes="other,beta,huduma"
  fi
  if [[ -n "$_excludes" ]]; then
    IFS=',' read -ra _parts <<< "${_excludes// /}"
    for s in "${_parts[@]}"; do
      [[ -n "$s" ]] && REMOTE_PGDUMP_ARGS+=(--exclude-schema="$s")
    done
  fi
fi

LOCAL_BACKUP="${BACKUP_DIR}/local_${LOCAL_DB}_${TS}.sql"
REMOTE_BACKUP="${BACKUP_DIR}/remote_${REMOTE_DB}_${TS}.sql"

if [[ "${SKIP_REMOTE_DUMP:-0}" == "1" ]]; then
  REMOTE_BACKUP="${REMOTE_BACKUP_FILE:?Set REMOTE_BACKUP_FILE to an existing .sql when SKIP_REMOTE_DUMP=1}"
  if [[ ! -f "$REMOTE_BACKUP" ]]; then
    echo "ERROR: REMOTE_BACKUP_FILE not found: $REMOTE_BACKUP" >&2
    exit 1
  fi
fi

if [[ "${SKIP_LOCAL_BACKUP:-0}" != "1" ]]; then
  echo "--- 1) Dump local DB to ${LOCAL_BACKUP}"
  export PGPASSWORD="$LOCAL_PASS"
  pg_dump -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" -F p --no-owner --no-acl -f "$LOCAL_BACKUP"
  unset PGPASSWORD
  echo "    Done."
else
  echo "--- 1) Skipped (SKIP_LOCAL_BACKUP=1)"
fi

if [[ "${SKIP_REMOTE_DUMP:-0}" != "1" ]]; then
  echo "--- 2) Dump remote DB to ${REMOTE_BACKUP}"
  export PGPASSWORD="$REMOTE_PASS"
  remote_major="$(
    psql -h "$REMOTE_HOST" -p "$REMOTE_PORT" -U "$REMOTE_USER" -d "$REMOTE_DB" -tAc \
      "SELECT current_setting('server_version_num')::int / 10000;" 2>/dev/null | tr -d '[:space:]'
  )"
  dump_major="$("$PG_DUMP_REMOTE_BIN" --version 2>/dev/null | sed -n 's/.* \([0-9][0-9]*\)\..*/\1/p' | head -1)"
  if [[ -n "$remote_major" && -n "$dump_major" && "$dump_major" -lt "$remote_major" ]]; then
    echo "ERROR: remote PostgreSQL major version is ${remote_major}, but ${PG_DUMP_REMOTE_BIN} is ${dump_major}." >&2
    echo "pg_dump must be >= server major version. Install a matching client, e.g.:" >&2
    echo "  https://www.postgresql.org/download/linux/ubuntu/" >&2
    echo "  sudo apt install postgresql-client-${remote_major}" >&2
    echo "Or set PG_DUMP_REMOTE=/usr/lib/postgresql/${remote_major}/bin/pg_dump" >&2
    unset PGPASSWORD
    exit 1
  fi
  echo "    (remote PG ${remote_major:-?}, using ${PG_DUMP_REMOTE_BIN} = pg_dump ${dump_major:-?})"
  if [[ ${#REMOTE_PGDUMP_ARGS[@]} -gt 0 ]]; then
    echo "    pg_dump extra: ${REMOTE_PGDUMP_ARGS[*]}"
  fi
  "$PG_DUMP_REMOTE_BIN" -h "$REMOTE_HOST" -p "$REMOTE_PORT" -U "$REMOTE_USER" -d "$REMOTE_DB" -F p --no-owner --no-acl \
    "${REMOTE_PGDUMP_ARGS[@]}" -f "$REMOTE_BACKUP"
  unset PGPASSWORD
  echo "    Done."
else
  echo "--- 2) Skipped (SKIP_REMOTE_DUMP=1); using ${REMOTE_BACKUP}"
fi

if [[ -n "$RESTORE_TARGET_DB" && "$RESTORE_TARGET_DB" != "$LOCAL_DB" ]]; then
  if [[ "${RESTORE_ONLY:-0}" == "1" ]]; then
    echo "--- 3) Restore into existing database \"${RESTORE_TARGET_DB}\" (RESTORE_ONLY=1; \"${LOCAL_DB}\" unchanged)"
    fix_public_schema_for_app_user "$RESTORE_TARGET_DB" || exit 1
    precreate_superuser_extensions "$RESTORE_TARGET_DB"
    export PGPASSWORD="$LOCAL_PASS"
    run_appuser_sql_restore "$RESTORE_TARGET_DB" "$REMOTE_BACKUP"
    unset PGPASSWORD
    echo "    Done."
    echo ""
    echo "Next: set your app to use this database, in api/.env:"
    echo "  DB_NAME=${RESTORE_TARGET_DB}"
    echo "Dump used: ${REMOTE_BACKUP}"
    exit 0
  fi

  echo "--- 3) Create database \"${RESTORE_TARGET_DB}\" and restore (unchanged: \"${LOCAL_DB}\")"
  echo "    Using ${LOCAL_USER} only (requires CREATEDB on this role to CREATE DATABASE)."
  export PGPASSWORD="$LOCAL_PASS"
  psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d postgres -v ON_ERROR_STOP=1 -c "
    SELECT pg_terminate_backend(pid) FROM pg_stat_activity
    WHERE datname = '${RESTORE_TARGET_DB}' AND pid <> pg_backend_pid();
  " || true
  psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "DROP DATABASE IF EXISTS \"${RESTORE_TARGET_DB}\";" || {
    echo "ERROR: Could not DROP \"${RESTORE_TARGET_DB}\" (must be owner). Remove it as admin or pick a new RESTORE_TARGET_DB name." >&2
    unset PGPASSWORD
    exit 1
  }
  if ! psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "CREATE DATABASE \"${RESTORE_TARGET_DB}\" OWNER \"${LOCAL_USER}\";"; then
    echo "ERROR: CREATE DATABASE failed — role \"${LOCAL_USER}\" may lack CREATEDB." >&2
    echo "One-time fix (run in a terminal; enter your sudo password if prompted):" >&2
    echo "  sudo -u postgres psql -c \"CREATE DATABASE \\\"${RESTORE_TARGET_DB}\\\" OWNER \\\"${LOCAL_USER}\\\";\"" >&2
    echo "Then load the dump into that database (no CREATE needed):" >&2
    echo "  RESTORE_ONLY=1 SKIP_LOCAL_BACKUP=1 SKIP_REMOTE_DUMP=1 \\" >&2
    echo "    REMOTE_BACKUP_FILE=${REMOTE_BACKUP} RESTORE_TARGET_DB=${RESTORE_TARGET_DB} \\" >&2
    echo "    bash \"${PROJECT_ROOT}/backup_restore_db.sh\"" >&2
    unset PGPASSWORD
    exit 1
  fi
  fix_public_schema_for_app_user "$RESTORE_TARGET_DB" || exit 1
  precreate_superuser_extensions "$RESTORE_TARGET_DB"
  run_appuser_sql_restore "$RESTORE_TARGET_DB" "$REMOTE_BACKUP"
  unset PGPASSWORD
  echo "    Done."
  echo ""
  echo "Next: set your app to use the new database, in api/.env:"
  echo "  DB_NAME=${RESTORE_TARGET_DB}"
  echo "Backups: ${LOCAL_BACKUP:-skipped}, ${REMOTE_BACKUP}"
  exit 0
fi

echo "--- 3) Replace local DB with remote backup"
if [[ "$LOCAL_ADMIN_USER" != "$LOCAL_USER" ]]; then
  echo "    (using LOCAL_DB_ADMIN_USER=${LOCAL_ADMIN_USER} for terminate/drop/create; restore as ${LOCAL_USER})"
fi
export PGPASSWORD="$LOCAL_ADMIN_PASS"
# Terminate existing connections to local DB (connect to 'postgres' to run)
psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "
  SELECT pg_terminate_backend(pid) FROM pg_stat_activity
  WHERE datname = '${LOCAL_DB}' AND pid <> pg_backend_pid();
"
psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"${LOCAL_DB}\";"
if [[ "$LOCAL_ADMIN_USER" != "$LOCAL_USER" ]]; then
  psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${LOCAL_DB}\" OWNER \"${LOCAL_USER}\";"
else
  psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_ADMIN_USER" -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${LOCAL_DB}\";"
fi
unset PGPASSWORD

fix_public_schema_for_app_user "$LOCAL_DB" || exit 1
precreate_superuser_extensions "$LOCAL_DB"
export PGPASSWORD="$LOCAL_PASS"
run_appuser_sql_restore "$LOCAL_DB" "$REMOTE_BACKUP"
unset PGPASSWORD
echo "    Done."
echo "Local DB ${LOCAL_DB} is now a copy of remote ${REMOTE_DB}. Backups: ${LOCAL_BACKUP:-skipped}, ${REMOTE_BACKUP}"
