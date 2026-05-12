#!/usr/bin/env bash
#
# Remote deploy template (KEMRI repo): SSH + rsync + docker compose on the SERVER you configure.
# Copy to a private script (e.g. deploy/my-server.sh), chmod +x, set DEPLOY_* below or export them, then run.
#
#   export DEPLOY_HOST=your.host
#   export DEPLOY_USER=deployuser
#   export DEPLOY_PATH=/home/deployuser/dev/kemri
#   ./deploy/remote-deploy.template.sh
#
# Optional: DEPLOY_SYNC_UPLOADS=0  DEPLOY_SYNC_DB=1 DEPLOY_SYNC_DB_CONFIRM=yes  SSH_IDENTITY=~/.ssh/id_rsa
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# No Machakos/production defaults — must be set explicitly.
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_PATH="${DEPLOY_PATH:-}"
SSH_IDENTITY="${SSH_IDENTITY:-}"
DEPLOY_SYNC_UPLOADS="${DEPLOY_SYNC_UPLOADS:-1}"
DEPLOY_SYNC_DB="${DEPLOY_SYNC_DB:-0}"
DEPLOY_SYNC_DB_CONFIRM="${DEPLOY_SYNC_DB_CONFIRM:-}"

if [[ -z "$DEPLOY_HOST" || -z "$DEPLOY_USER" || -z "$DEPLOY_PATH" ]]; then
  echo "Refusing to run: set DEPLOY_HOST, DEPLOY_USER, and DEPLOY_PATH to your KEMRI server paths." >&2
  exit 1
fi

SSH_OPTS=(-o StrictHostKeyChecking=accept-new)
if [[ -n "$SSH_IDENTITY" ]]; then
  SSH_OPTS+=(-i "${SSH_IDENTITY/#\~/$HOME}")
fi

RSYNC_RSH="ssh ${SSH_OPTS[*]}"
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"

echo "==> Syncing repo to ${REMOTE}:${DEPLOY_PATH}"
rsync -avz --no-group --no-owner --delete \
  --rsh="$RSYNC_RSH" \
  --filter='P .pgdata/' \
  --exclude '.git' \
  --exclude '.cursor' \
  --exclude '.pgdata' \
  --exclude 'node_modules' \
  --exclude 'frontend/node_modules' \
  --exclude 'api/node_modules' \
  --exclude 'public-dashboard/node_modules' \
  --exclude '**/dist' \
  --exclude '.env' \
  --exclude 'api/.env' \
  --filter='P deploy/.env.deploy' \
  --exclude 'deploy/.env.deploy' \
  --exclude 'uploads' \
  --exclude 'api/uploads' \
  "$ROOT/" "${REMOTE}:${DEPLOY_PATH}/"

if [[ "$DEPLOY_SYNC_UPLOADS" == "1" ]]; then
  echo "==> Syncing media uploads (uploads/ and api/uploads/) to server"
  mkdir -p "$ROOT/uploads" "$ROOT/api/uploads"
  rsync -avz --no-group --no-owner \
    --rsh="$RSYNC_RSH" \
    "$ROOT/uploads/" "${REMOTE}:${DEPLOY_PATH}/uploads/"
  rsync -avz --no-group --no-owner \
    --rsh="$RSYNC_RSH" \
    "$ROOT/api/uploads/" "${REMOTE}:${DEPLOY_PATH}/api/uploads/"
else
  echo "==> Skipping uploads sync (set DEPLOY_SYNC_UPLOADS=1 to copy media files)"
fi

if [[ "$DEPLOY_SYNC_DB" == "1" ]]; then
  echo "==> Pushing local PostgreSQL to server (DEPLOY_SYNC_DB=1)"
  export KEMRI_REMOTE_DEPLOY_ENABLED=yes
  export DEPLOY_HOST DEPLOY_USER DEPLOY_PATH SSH_IDENTITY DEPLOY_SYNC_DB_CONFIRM DEPLOY_RESTORE_DOCKER_CONTAINER DEPLOY_RESTORE_SUDO_POSTGRES DEPLOY_STRIP_VECTOR_EXTENSION_DDL DEPLOY_PSQL_PATH DEPLOY_PSQL_DOCKER_IMAGE
  "$ROOT/deploy/sync-local-db-to-server.sh"
else
  echo "==> Skipping database push (set DEPLOY_SYNC_DB=1 and DEPLOY_SYNC_DB_CONFIRM=yes to overwrite remote DB)"
fi

echo "==> Rebuilding and restarting stack on server"
ssh "${SSH_OPTS[@]}" "$REMOTE" bash -s <<REMOTE_EOF
set -euo pipefail
cd "${DEPLOY_PATH}"
if [[ ! -f api/.env ]]; then
  echo "WARNING: api/.env missing on server — compose will start, but set DB_* in api/.env for the API." >&2
fi
ENV_FILE_ARGS=()
if [[ -f deploy/.env.deploy ]]; then
  ENV_FILE_ARGS=(--env-file deploy/.env.deploy)
fi
docker compose "\${ENV_FILE_ARGS[@]}" -f docker-compose.server.yml build
docker compose "\${ENV_FILE_ARGS[@]}" -f docker-compose.server.yml up -d
docker compose -f docker-compose.server.yml ps
REMOTE_EOF

echo "==> Done. Verify URLs and ports for YOUR stack (KEMRI uses offset ports vs Machakos — see KEMRI_SETUP.md)."
