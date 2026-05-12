# KEMRI deployment clone

This tree is a copy of **Machakos** (`/home/dev/dev/machakos`) with **ports shifted by +100** on key surfaces so both stacks can run on one machine.

**Docker container names** use the `kemri_` prefix (e.g. `kemri_node_api`, `kemri_nginx_proxy`) so they stay distinct from Machakos (`machakosme_*`) and other stacks on the same host.

## Port map

| Service | Machakos | KEMRI |
|--------|----------|-------|
| Nginx (main SPA + citizen) | `8084` | `8184` |
| Node API (`PORT`) | `3002` | `3102` |
| Vite / frontend published | `5178` → `5173` | `5278` → `5173` |
| Public dashboard published | `5179` → `5173` | `5279` → `5173` |
| Docker production nginx (template) | `8082` | `8182` |
| Docker API publish (template) | `3011` | `3111` |
| Docker Postgres publish (template) | `5434` | `5534` |

## URLs (local dev with compose)

- Main app (via nginx): `http://localhost:8184`
- Citizen app: `http://localhost:8184/citizen/`
- Direct Vite (optional): `http://localhost:5278`

## Database

- **Database name:** `kemridb` (see root `.env` and `api/.env`).

If login shows a server error or logs mention `database "kemridb" does not exist`, Postgres has no `kemridb` yet — create it and import from Machakos (see below). Until then the API will not authenticate anyone.

If restore fails with **`must be owner of schema public`**, you piped the dump into `psql` as `gov_local_user`. Pipe into **`sudo -u postgres psql`** instead, then run **`REASSIGN OWNED`** (see below).

**Manual clone:**

```bash
sudo -u postgres psql -c 'DROP DATABASE IF EXISTS kemridb;'
sudo -u postgres psql -c 'CREATE DATABASE kemridb OWNER gov_local_user;'

pg_dump revised_gov_from_remote --no-owner --no-acl \
  | sudo -u postgres psql -d kemridb -v ON_ERROR_STOP=1

# Do not use REASSIGN OWNED BY postgres — it fails on system-required objects. Transfer app objects instead:
ONLY_TRANSFER_OWNERSHIP=yes ./scripts/kemri-clone-postgres.sh
```

**Script (same steps):**

```bash
cd /home/dev/dev/kemri
SOURCE_DB=revised_gov_from_remote ./scripts/kemri-clone-postgres.sh
```

## First run

```bash
cd /home/dev/dev/kemri
npm install --prefix api && npm install --prefix frontend && npm install --prefix public-dashboard   # if not using only Docker
docker compose build
docker compose up -d
```

Only **one** stack should bind **nginx host port** `8184` at a time; Machakos keeps `8084`.

## Deploy scripts (safety)

- **`deploy/deploy-to-server.sh`** exits immediately with instructions — it does **not** rsync to any server by default.
- Use **`deploy/remote-deploy.template.sh`** (copy to a private script) with explicit **`DEPLOY_HOST`**, **`DEPLOY_USER`**, **`DEPLOY_PATH`**.
- **`deploy/sync-local-db-to-server.sh`** requires **`KEMRI_REMOTE_DEPLOY_ENABLED=yes`** and the same **`DEPLOY_*`** variables before any remote DB overwrite (dry-run only needs `--dry-run`).
- **`deploy/.env.deploy`** uses **localhost KEMRI URLs** by default; Machakos production URLs are commented out.

## Branding

`VITE_CERT_COUNTY_NAME` is set to **KEMRI** in `frontend/.env.development` and `api/.env`; adjust as needed.
