#!/usr/bin/env bash
#
# Deploy KEMRI / KIMES to kemri.pathwaystechnologies.com (Pathways/ICS server,
# shared with Machakos at /home/kunye/dev/machakos/).
#
# What this does, in order:
#   1. rsync the repo to ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}.
#   2. (Optional) Sync media uploads (uploads/, api/uploads/).
#   3. (Optional) Push the local Postgres DB to the server (drops/recreates
#      content in DB_NAME on the server — destructive; requires confirmation).
#   4. SSH to the server, ensure deploy/.env.deploy is in place (copies from
#      deploy/.env.deploy.production if missing), build & start the compose
#      stack, then print `compose ps`.
#
# What this does NOT do (one-time manual steps — see KEMRI_DEPLOY.md):
#   - Create the kemridb database / role: run deploy/setup-kemridb-on-server.sh
#     once on the server with sudo.
#   - Install the system-nginx vhost and run certbot for TLS: see
#     deploy/snippets/nginx-kemri.pathwaystechnologies.com.conf header.
#   - Create api/.env on the server with DB_*, SMTP, JWT_SECRET, etc.
#
# Usage:
#   ./deploy/deploy-kemri-pathways.sh                          # rsync + compose only
#   DEPLOY_SYNC_UPLOADS=0 ./deploy/deploy-kemri-pathways.sh    # skip media sync
#   DEPLOY_SYNC_DB=1 DEPLOY_SYNC_DB_CONFIRM=yes \
#     ./deploy/deploy-kemri-pathways.sh                        # also push local DB
#
# Override targets (defaults are pre-set for KEMRI/Pathways):
#   DEPLOY_HOST=... DEPLOY_USER=... DEPLOY_PATH=... ./deploy/deploy-kemri-pathways.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# ── Server defaults (Pathways/ICS shared host, matches machakos) ─────────────
DEPLOY_HOST="${DEPLOY_HOST:-165.22.227.234}"
DEPLOY_USER="${DEPLOY_USER:-kunye}"
DEPLOY_PATH="${DEPLOY_PATH:-/home/kunye/dev/kemri}"
SSH_IDENTITY="${SSH_IDENTITY:-}"
DEPLOY_SYNC_UPLOADS="${DEPLOY_SYNC_UPLOADS:-1}"
DEPLOY_SYNC_DB="${DEPLOY_SYNC_DB:-0}"
DEPLOY_SYNC_DB_CONFIRM="${DEPLOY_SYNC_DB_CONFIRM:-}"

SSH_OPTS=(-o StrictHostKeyChecking=accept-new)
if [[ -n "$SSH_IDENTITY" ]]; then
  SSH_OPTS+=(-i "${SSH_IDENTITY/#\~/$HOME}")
fi

RSYNC_RSH="ssh ${SSH_OPTS[*]}"
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"

echo "==> Target: ${REMOTE}:${DEPLOY_PATH}"
echo "==> Public URL: https://kemri.pathwaystechnologies.com  (compose nginx :8184)"

# Make sure the deploy target directory exists before rsync.
ssh "${SSH_OPTS[@]}" "$REMOTE" "mkdir -p '${DEPLOY_PATH}'"

echo "==> Syncing repo to ${REMOTE}:${DEPLOY_PATH}"
# --no-group --no-owner: avoid chgrp/chown failures when the SSH user cannot set
#   ownership on the server.
# Filter rules: preserve any existing api/.env and deploy/.env.deploy on the
# server (do NOT overwrite real production secrets/config from local).
rsync -avz --no-group --no-owner --delete \
  --rsh="$RSYNC_RSH" \
  --filter='P api/.env' \
  --filter='P deploy/.env.deploy' \
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
  --exclude 'deploy/.env.deploy' \
  --exclude 'uploads' \
  --exclude 'api/uploads' \
  --exclude 'db_backups' \
  --exclude 'remote_119db' \
  --exclude '.remote-dumps' \
  --exclude 'frontend/public/gis/kenya' \
  "$ROOT/" "${REMOTE}:${DEPLOY_PATH}/"

if [[ "$DEPLOY_SYNC_UPLOADS" == "1" ]]; then
  echo "==> Syncing media uploads to server (uploads/ and api/uploads/)"
  mkdir -p "$ROOT/uploads" "$ROOT/api/uploads"
  rsync -avz --no-group --no-owner \
    --rsh="$RSYNC_RSH" \
    "$ROOT/uploads/" "${REMOTE}:${DEPLOY_PATH}/uploads/"
  rsync -avz --no-group --no-owner \
    --rsh="$RSYNC_RSH" \
    "$ROOT/api/uploads/" "${REMOTE}:${DEPLOY_PATH}/api/uploads/"
else
  echo "==> Skipping uploads sync (set DEPLOY_SYNC_UPLOADS=1 to copy media)"
fi

if [[ "$DEPLOY_SYNC_DB" == "1" ]]; then
  echo "==> Pushing local PostgreSQL → server (DEPLOY_SYNC_DB=1)"
  export KEMRI_REMOTE_DEPLOY_ENABLED=yes
  export DEPLOY_HOST DEPLOY_USER DEPLOY_PATH SSH_IDENTITY DEPLOY_SYNC_DB_CONFIRM \
    DEPLOY_RESTORE_DOCKER_CONTAINER DEPLOY_RESTORE_SUDO_POSTGRES \
    DEPLOY_STRIP_VECTOR_EXTENSION_DDL DEPLOY_PSQL_PATH DEPLOY_PSQL_DOCKER_IMAGE
  "$ROOT/deploy/sync-local-db-to-server.sh"
else
  echo "==> Skipping DB push (set DEPLOY_SYNC_DB=1 + DEPLOY_SYNC_DB_CONFIRM=yes to push DB)"
fi

echo "==> Building & restarting Docker stack on the server"
ssh "${SSH_OPTS[@]}" "$REMOTE" bash -s <<REMOTE_EOF
set -euo pipefail
cd "${DEPLOY_PATH}"

# Ensure deploy/.env.deploy exists; if not, seed from .env.deploy.production.
if [[ ! -f deploy/.env.deploy && -f deploy/.env.deploy.production ]]; then
  echo "   Bootstrapping deploy/.env.deploy from deploy/.env.deploy.production"
  cp deploy/.env.deploy.production deploy/.env.deploy
fi

# api/.env must already exist on the server (it holds DB credentials, SMTP
# password, JWT secret, etc. — never rsync'd). Warn but continue if missing.
if [[ ! -f api/.env ]]; then
  echo "   WARNING: api/.env is missing on the server. The API container will" >&2
  echo "            start but won't reach Postgres. Create api/.env with DB_*," >&2
  echo "            SMTP_*, JWT_SECRET, etc. before relying on this deploy." >&2
fi

ENV_FILE_ARGS=()
if [[ -f deploy/.env.deploy ]]; then
  ENV_FILE_ARGS=(--env-file deploy/.env.deploy)
fi

docker compose "\${ENV_FILE_ARGS[@]}" -f docker-compose.server.yml build
docker compose "\${ENV_FILE_ARGS[@]}" -f docker-compose.server.yml up -d
docker compose -f docker-compose.server.yml ps
REMOTE_EOF

echo ""
echo "==> Done."
echo "    Direct:  http://${DEPLOY_HOST}:8184    (compose nginx, no TLS)"
echo "    Public:  https://kemri.pathwaystechnologies.com   (system nginx + certbot)"
echo ""
echo "    First-time only — see KEMRI_DEPLOY.md:"
echo "      1) DB bootstrap on server:    sudo bash deploy/setup-kemridb-on-server.sh"
echo "      2) System nginx vhost:        sudo cp deploy/snippets/nginx-kemri.pathwaystechnologies.com.conf /etc/nginx/sites-available/kemri-pathways.conf && sudo ln -sf ../sites-available/kemri-pathways.conf /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"
echo "      3) TLS:                       sudo certbot --nginx -d kemri.pathwaystechnologies.com"
