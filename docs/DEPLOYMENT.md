# Deployment checklist (login and database)

## If login stops working after deploy

Login can fail after a deploy **even if you did not change any remote data**. Common cause: the API is connecting to a **different database** than before (e.g. wrong or default env vars).

### 1. Check that the API is reachable

- Open: `http://YOUR_SERVER/impes/login`
- In browser DevTools → **Network**, try to log in and find the request to **`/api/auth/login`**.
  - **Status 0 / Failed / CORS** → API not reachable or wrong URL (see “Frontend API URL” below).
  - **Status 500** → API is reachable but error on server (often DB connection or query).
  - **Status 400 + "Invalid credentials"** → API reached the DB; username/password don’t match (or that user doesn’t exist in the DB the API is using).

You can also check the API directly:

```bash
# From your machine (replace with your server and port if not 80)
curl -s http://102.210.149.119/api/health
# Expected: {"ok":true,"message":"API is running"}
```

If `/api/health` returns 200, the API is up. If login still fails, the next step is database configuration.

### 2. Keep the same database connection on the server

The API uses these environment variables to connect to PostgreSQL:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_TYPE=postgresql`

- **Docker Compose (e.g. `docker-compose.prod.yml`):**  
  The compose file does **not** set these from `api/.env` by default; it uses **host environment** (or a `.env` in the **project root**). So on the server you must have the correct `DB_*` values in:
  - A `.env` file in the project root (where you run `docker compose`), or
  - Exported in the shell before `docker compose up`.

- **Do not overwrite server env when deploying:**  
  If you copy a **local** `api/.env` or project root `.env` to the server during deploy, it can replace the server’s env and point the API at a different DB (e.g. local or empty). Then the user `akwatuha` may not exist there, so login fails.

**What to do:**

1. On the server, keep a dedicated env file (e.g. project root `.env` or `api/.env`) with the **correct remote DB** credentials.
2. When you deploy (e.g. git pull + rebuild), **do not** overwrite that file with your local one.
3. Restart the API after deploy so it picks up the correct env:  
   `docker compose -f docker-compose.prod.yml up -d --build api` (or your actual command).

### 3. Frontend API URL (production build)

The frontend calls the API using `VITE_API_URL` at **build time**. For production behind the same host (e.g. `http://102.210.149.119/impes/`):

- **Do not** set `VITE_API_URL` to an absolute URL like `http://api:3000` or `http://localhost:3001` when building the frontend. In the browser those URLs are wrong (different host or the user’s machine).
- Either leave `VITE_API_URL` unset so the app uses the relative path `/api`, or set it to a relative path, e.g. `VITE_API_URL=/api`, when running `npm run build`.

Then the login request goes to `http://102.210.149.119/api/auth/login`, which nginx proxies to your API.

### 4. Quick checklist

- [ ] `/api/health` returns 200 on the server.
- [ ] Server env (project root or `api/.env`) has the correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for the DB where `akwatuha` exists.
- [ ] Deploy process does **not** overwrite that env file with a local one.
- [ ] Frontend production build was made **without** an absolute `VITE_API_URL` that points to a host/port unreachable from the browser.
- [ ] API container/process was restarted after deploy.

If all of the above are correct and login still fails, check API logs on the server for the exact error when you submit the login form (e.g. DB connection error or “Invalid credentials” after a successful DB query).
