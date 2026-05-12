#!/usr/bin/env bash
#
# KEMRI: This entrypoint is intentionally disabled so a mistaken run cannot rsync to another product's server.
#
# For a real remote deploy:
#   1. Copy deploy/remote-deploy.template.sh to something private (e.g. deploy/local-only-my-server.sh), chmod +x.
#   2. Export DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH for your KEMRI host, then run that script.
#
# Database push helper: deploy/sync-local-db-to-server.sh — also requires explicit DEPLOY_* and
# KEMRI_REMOTE_DEPLOY_ENABLED=yes (see that script).
#
set -euo pipefail
cat <<'EOF' >&2
deploy/deploy-to-server.sh is disabled in the KEMRI tree.

Use:  cp deploy/remote-deploy.template.sh deploy/<your-private-name>.sh && chmod +x deploy/<your-private-name>.sh
Then set DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH and run your private script.

EOF
exit 1
