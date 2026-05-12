#!/usr/bin/env bash
# Copy remote PostgreSQL into the local database named in api/.env (DB_NAME).
#
# Prerequisites:
#   - Remote Postgres reachable from this machine (firewall allows your IP on 5432), OR use
#     scripts/pull-remote-postgres-for-local.sh when the DB is only reachable via SSH.
#   - pg_dump for the REMOTE must be >= the remote server's major version (script checks this).
#     Install e.g. postgresql-client-16 if the server is PostgreSQL 16 (see PGDG for Ubuntu).
#     Or: export PG_DUMP_REMOTE=/usr/lib/postgresql/16/bin/pg_dump
#   - api/.env.remote with REMOTE_DB_HOST, REMOTE_DB_USER, REMOTE_DB_PASSWORD (and optional
#     REMOTE_DB_PORT, REMOTE_DB_NAME). Copy from api/.env.remote.example.
#   - Remote pg_dump excludes schemas other,beta,huduma by default (see backup_restore_db.sh).
#   - Step 3 needs a role that can DROP the local database, or set LOCAL_DB_ADMIN_USER /
#     LOCAL_DB_ADMIN_PASSWORD (e.g. postgres) in api/.env / api/.env.remote.
#
# Usage:
#   chmod +x scripts/sync-remote-db-to-local.sh
#   ./scripts/sync-remote-db-to-local.sh
#
# New database (keep current DB_NAME; point app at new name after):
#   RESTORE_TARGET_DB=revised_gov_from_remote ./scripts/sync-remote-db-to-local.sh
# Reuse an existing remote .sql without re-dumping:
#   SKIP_LOCAL_BACKUP=1 SKIP_REMOTE_DUMP=1 REMOTE_BACKUP_FILE=db_backups/remote_government_projects_....sql \\
#     RESTORE_TARGET_DB=revised_gov_from_remote ./scripts/sync-remote-db-to-local.sh
# If CREATE DATABASE failed, create DB as OS postgres (sudo -u postgres psql ...), then:
#   RESTORE_ONLY=1 SKIP_LOCAL_BACKUP=1 SKIP_REMOTE_DUMP=1 REMOTE_BACKUP_FILE=.../remote_....sql \\
#     RESTORE_TARGET_DB=revised_gov_from_remote ./scripts/sync-remote-db-to-local.sh
#
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE_ENV="${REPO_ROOT}/api/.env.remote"

if [[ ! -f "$REMOTE_ENV" ]]; then
  echo "Missing ${REMOTE_ENV}" >&2
  echo "Create it: cp ${REPO_ROOT}/api/.env.remote.example ${REMOTE_ENV}" >&2
  echo "Then set REMOTE_DB_HOST, REMOTE_DB_USER, REMOTE_DB_PASSWORD, and REMOTE_DB_NAME." >&2
  exit 1
fi

exec bash "${REPO_ROOT}/backup_restore_db.sh"
