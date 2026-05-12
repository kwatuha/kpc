#!/usr/bin/env bash
# Clone Machakos Postgres DB into kemridb (same server).
#
# Restores through the OS user `postgres` so you avoid:
#   ERROR: must be owner of schema public
# Then transfers ownership of application objects in `public` from `postgres` to your app role.
# (We do not use REASSIGN OWNED BY postgres — that fails on objects “required by the database system”.)
#
# Usage (from repo root; you will be prompted for sudo):
#   SOURCE_DB=revised_gov_from_remote ./scripts/kemri-clone-postgres.sh
#
# Optional:
#   TARGET_DB=kemridb  KEMRI_RESTORE_USE_SUDO_POSTGRES=no   # rare: restore as DB_USER only (may fail on public schema)
#
# If restore already finished but REASSIGN OWNED failed, fix ownership only:
#   ONLY_TRANSFER_OWNERSHIP=yes ./scripts/kemri-clone-postgres.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT}/api/.env"
TARGET_DB="${TARGET_DB:-kemridb}"
USE_SUDO_POSTGRES="${KEMRI_RESTORE_USE_SUDO_POSTGRES:-yes}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "${line// }" ]] && continue
  if [[ "$line" =~ ^(DB_[A-Z_]+)=(.*)$ ]]; then
    k="${BASH_REMATCH[1]}"
    v="${BASH_REMATCH[2]}"
    v="${v%\"}"
    v="${v#\"}"
    v="${v%\'}"
    v="${v#\'}"
    export "$k=$v"
  fi
done < "$ENV_FILE"

: "${DB_HOST:=127.0.0.1}"
: "${DB_PORT:=5432}"
: "${DB_USER:?Set DB_USER in api/.env}"
: "${DB_PASSWORD:?Set DB_PASSWORD in api/.env}"
export PGHOST="$DB_HOST"
export PGPORT="$DB_PORT"

if [[ ! "$DB_USER" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
  echo "DB_USER must be a simple PostgreSQL identifier (letters, digits, underscore)." >&2
  exit 1
fi

export PGUSER="$DB_USER"
export PGPASSWORD="$DB_PASSWORD"

# Transfer ownership of user objects in public from postgres → app role (skips system-owned objects).
transfer_public_ownership() {
  local role="$1"
  sudo -u postgres psql -d "$TARGET_DB" -v ON_ERROR_STOP=1 <<EOSQL
DO \$\$
DECLARE
  r RECORD;
  role_name constant text := '$role';
BEGIN
  FOR r IN
    SELECT c.relname, c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles ro ON ro.oid = c.relowner
    WHERE n.nspname = 'public'
      AND ro.rolname = 'postgres'
      AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO %I', r.relname, role_name);
  END LOOP;

  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles ro ON ro.oid = c.relowner
    WHERE n.nspname = 'public'
      AND ro.rolname = 'postgres'
      AND c.relkind = 'S'
  LOOP
    EXECUTE format('ALTER SEQUENCE public.%I OWNER TO %I', r.relname, role_name);
  END LOOP;

  FOR r IN
    SELECT c.relname, c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles ro ON ro.oid = c.relowner
    WHERE n.nspname = 'public'
      AND ro.rolname = 'postgres'
      AND c.relkind = 'I'
  LOOP
    EXECUTE format('ALTER INDEX public.%I OWNER TO %I', r.relname, role_name);
  END LOOP;

  FOR r IN
    SELECT c.relname, c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles ro ON ro.oid = c.relowner
    WHERE n.nspname = 'public'
      AND ro.rolname = 'postgres'
      AND c.relkind IN ('v', 'm')
  LOOP
    IF r.relkind = 'v' THEN
      EXECUTE format('ALTER VIEW public.%I OWNER TO %I', r.relname, role_name);
    ELSE
      EXECUTE format('ALTER MATERIALIZED VIEW public.%I OWNER TO %I', r.relname, role_name);
    END IF;
  END LOOP;

  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_roles ro ON ro.oid = c.relowner
    WHERE n.nspname = 'public'
      AND ro.rolname = 'postgres'
      AND c.relkind = 'f'
  LOOP
    EXECUTE format('ALTER FOREIGN TABLE public.%I OWNER TO %I', r.relname, role_name);
  END LOOP;

  FOR r IN
    SELECT p.oid::regprocedure AS pname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_roles ro ON ro.oid = p.proowner
    WHERE n.nspname = 'public'
      AND ro.rolname = 'postgres'
  LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO %I', r.pname::text, role_name);
  END LOOP;

  BEGIN
    EXECUTE format('ALTER SCHEMA public OWNER TO %I', role_name);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not ALTER SCHEMA public OWNER (safe to ignore on some installs): %', SQLERRM;
  END;
END
\$\$;
EOSQL
}

if [[ "${ONLY_TRANSFER_OWNERSHIP:-}" == "yes" ]]; then
  if ! command -v sudo >/dev/null 2>&1; then
    echo "sudo required for ONLY_TRANSFER_OWNERSHIP." >&2
    exit 1
  fi
  echo "==> ONLY_TRANSFER_OWNERSHIP: public schema objects postgres → $DB_USER on database $TARGET_DB"
  transfer_public_ownership "$DB_USER"
  echo "Done."
  exit 0
fi

: "${SOURCE_DB:?Set SOURCE_DB to the Machakos DB name to copy from (e.g. revised_gov_from_remote)}"
if [[ "$SOURCE_DB" == "$TARGET_DB" ]]; then
  echo "SOURCE_DB must differ from TARGET_DB ($TARGET_DB)."
  exit 1
fi

echo "Dumping $SOURCE_DB → $TARGET_DB on $PGHOST:$PGPORT (app role: $DB_USER)"

dump_restore_sudo_postgres() {
  sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$TARGET_DB' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
  sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$TARGET_DB\";"
  sudo -u postgres psql -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$TARGET_DB\" OWNER \"$DB_USER\";"
  echo "==> Restoring dump as postgres OS user (avoids public schema ownership errors)..."
  pg_dump "$SOURCE_DB" --no-owner --no-acl -F p | sudo -u postgres psql -d "$TARGET_DB" -v ON_ERROR_STOP=1
  echo "==> Transferring ownership of public schema objects postgres → $DB_USER (no REASSIGN OWNED)"
  transfer_public_ownership "$DB_USER"
}

dump_restore_app_user() {
  echo "==> Restoring as $DB_USER (if this fails with 'must be owner of schema public', use default sudo-based restore)." >&2
  psql -d postgres -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$TARGET_DB\";" || true
  psql -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"$TARGET_DB\" OWNER \"$DB_USER\";"
  pg_dump "$SOURCE_DB" --no-owner --no-acl -F p | psql -d "$TARGET_DB" -v ON_ERROR_STOP=1
}

if [[ "$USE_SUDO_POSTGRES" == "yes" ]]; then
  if ! command -v sudo >/dev/null 2>&1; then
    echo "sudo not found; set KEMRI_RESTORE_USE_SUDO_POSTGRES=no and fix schema ownership manually." >&2
    exit 1
  fi
  dump_restore_sudo_postgres
else
  dump_restore_app_user
fi

echo "Done. Restart the KEMRI API container/process. DB_NAME should be $TARGET_DB in api/.env."
