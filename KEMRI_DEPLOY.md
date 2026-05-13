# KEMRI / KIMES deployment runbook

Production target: **`https://kemri.pathwaystechnologies.com/`** on the shared
Pathways/ICS server (`165.22.227.234`, SSH user `kunye`) alongside the existing
Machakos stack at `/home/kunye/dev/machakos/`.

The KEMRI stack uses ports offset by `+100` from Machakos so the two run
side-by-side without conflict:

| Component                | Machakos | **KEMRI** |
|--------------------------|---------:|----------:|
| Compose nginx (host)     |   `8084` |  **8184** |
| Frontend container       |   `5178` |  **5278** |
| Public-dashboard         |   `5179` |  **5279** |
| API (Node, host network) |   `3002` |  **3102** |
| Postgres (shared native) | `127.0.0.1:5433` |  same — db `kemridb` |

The KEMRI database is a **separate logical database** (`kemridb`) on the same
native Postgres instance Machakos uses (PostgreSQL 16.9, listening on
`127.0.0.1:5433`). Same role (`gov_local_user`), same password. No new
credentials to manage. The role already has `CREATEDB`, so the bootstrap does
not need `sudo`.

---

## One-time setup (on the server)

From your laptop, push the repo once so the server has the bootstrap script:

```bash
./deploy/deploy-kemri-pathways.sh
```

Then on the server (as `kunye`, no sudo):

```bash
cd ~/dev/kemri
bash deploy/setup-kemridb-on-server.sh
```

This script:
1. Creates the `kemridb` database owned by `gov_local_user` (port `5433`).
2. Enables `pg_trgm`, `unaccent`, and `pgvector` inside `kemridb`.
3. Writes `api/.env` for you (auto-generates a fresh `JWT_SECRET`, fills in
   the DB section, and leaves SMTP fields blank for you to populate manually
   if you want password-reset emails).
4. Prints a connection check.

Open `api/.env` afterwards and fill in `SMTP_*` from your local
`api/.env` if you want user-onboarding / password-reset emails:

```bash
nano ~/dev/kemri/api/.env
```

---

## Routine deploys (from your laptop)

From the KEMRI repo root:

```bash
# Code + media only (default, fast, non-destructive to DB)
./deploy/deploy-kemri-pathways.sh

# Code + media + push the local Postgres DB → server (DESTRUCTIVE: wipes
# kemridb on the server and replaces it with your laptop's contents).
DEPLOY_SYNC_DB=1 DEPLOY_SYNC_DB_CONFIRM=yes ./deploy/deploy-kemri-pathways.sh

# Code only, skip media sync
DEPLOY_SYNC_UPLOADS=0 ./deploy/deploy-kemri-pathways.sh
```

The script:
1. rsyncs the repo to `kunye@165.22.227.234:/home/kunye/dev/kemri/`
   (preserves the server's `api/.env` and `deploy/.env.deploy`).
2. Optionally syncs `uploads/` and `api/uploads/`.
3. Optionally `pg_dump`s your local `kemridb` and restores into the server's
   `kemridb` (stops the API container during the restore).
4. SSH-builds and starts `docker-compose.server.yml`:
   ```
   docker compose --env-file deploy/.env.deploy -f docker-compose.server.yml up -d
   ```

Default targets (override at the command line by exporting `DEPLOY_HOST`,
`DEPLOY_USER`, `DEPLOY_PATH`):

```
DEPLOY_HOST=165.22.227.234
DEPLOY_USER=kunye
DEPLOY_PATH=/home/kunye/dev/kemri
```

---

## Exposing it to the internet (TLS)

Done **once** (or any time DNS / vhost changes). Run on the server:

```bash
# 1. Install the host-system nginx vhost
sudo cp ~/dev/kemri/deploy/snippets/nginx-kemri.pathwaystechnologies.com.conf \
        /etc/nginx/sites-available/kemri-pathways.conf
sudo ln -sf /etc/nginx/sites-available/kemri-pathways.conf \
        /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 2. Obtain and install a Let's Encrypt certificate (DNS must already point at
#    this server's IP — verified with: dig +short kemri.pathwaystechnologies.com).
sudo certbot --nginx -d kemri.pathwaystechnologies.com
```

Certbot rewrites the vhost file with the `ssl_certificate` directives and an
HTTPS server block. Re-running it is safe and the renewal cron is installed
automatically.

---

## Verifying a deploy

```bash
# On the server
cd ~/dev/kemri
docker compose -f docker-compose.server.yml ps
docker compose -f docker-compose.server.yml logs --tail=80 api
docker compose -f docker-compose.server.yml logs --tail=40 frontend

# From anywhere
curl -fsSI http://165.22.227.234:8184/                 # compose nginx (no TLS)
curl -fsSI https://kemri.pathwaystechnologies.com/     # system nginx + certbot
curl -fsS  https://kemri.pathwaystechnologies.com/api/health || true
```

---

## Common issues

- **`api/.env` missing on server**: API container starts but can't reach
  Postgres. Create the file (see One-time setup) and `docker compose -f
  docker-compose.server.yml restart api`.
- **`pgvector not available`** when pushing the DB: install
  `postgresql-<major>-pgvector` on the server's native Postgres, or strip the
  vector DDL from the dump:
  ```
  DEPLOY_STRIP_VECTOR_EXTENSION_DDL=yes DEPLOY_SYNC_DB=1 \
  DEPLOY_SYNC_DB_CONFIRM=yes ./deploy/deploy-kemri-pathways.sh
  ```
- **`certbot` fails the HTTP-01 challenge**: confirm DNS resolves to the
  server (`dig +short kemri.pathwaystechnologies.com`) and ports 80/443 are
  open at the firewall.
- **Port 8184 already in use**: another process is bound to the host port.
  `sudo ss -ltnp | grep 8184` to find it.

---

## Rollback

```bash
# Roll the code back to the previous deploy:
cd ~/dev/kemri
git -c safe.directory=$PWD log --oneline -5             # find a known-good commit
git -c safe.directory=$PWD checkout <sha>               # detached HEAD is OK
docker compose --env-file deploy/.env.deploy -f docker-compose.server.yml up -d

# Roll the DB back to a pre-deploy dump (saved automatically in db_backups/):
ls db_backups/local_to_server_*.sql.gz                  # pick a dump
# (then a manual psql restore — script doesn't auto-roll-back DBs)
```
