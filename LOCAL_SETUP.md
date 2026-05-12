# Local Development Setup Guide

This guide helps you set up the application locally with PostgreSQL running on your host machine (similar to the production server setup).

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL installed on your local machine
- Node.js (for local development, optional)

## Step 1: Install PostgreSQL Locally

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS (using Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

### Windows:
Download and install from: https://www.postgresql.org/download/windows/

## Step 2: Create Database and User

```bash
# Switch to postgres user (Linux/macOS)
sudo -u postgres psql

# Or on macOS with Homebrew:
psql postgres

# Create database and user
CREATE DATABASE government_projects;
CREATE USER postgres_user WITH PASSWORD 'your_password_here';
ALTER USER postgres_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE government_projects TO postgres_user;

# Exit psql
\q
```

## Step 3: Configure PostgreSQL for Local Connections

Edit PostgreSQL configuration to allow local connections:

**Linux/macOS:**
```bash
# Find postgresql.conf location
sudo -u postgres psql -c "SHOW config_file;"

# Edit postgresql.conf (usually /etc/postgresql/16/main/postgresql.conf or /usr/local/var/postgres/postgresql.conf)
# Set:
listen_addresses = 'localhost'

# Edit pg_hba.conf (usually /etc/postgresql/16/main/pg_hba.conf or /usr/local/var/pg_hba.conf)
# Add line:
host    all             all             127.0.0.1/32            md5

# Restart PostgreSQL
sudo systemctl restart postgresql  # Linux
# or
brew services restart postgresql@16  # macOS
```

**Windows:**
- Edit `postgresql.conf` and set `listen_addresses = 'localhost'`
- Edit `pg_hba.conf` and add: `host    all             all             127.0.0.1/32            md5`
- Restart PostgreSQL service from Services panel

## Step 4: Create Local .env File

Create a `.env` file in the project root:

```bash
cp .env.example .env  # If you have an example file
# Or create manually:
```

```env
# Database Configuration (localhost PostgreSQL)
DB_TYPE=postgresql
DB_HOST=127.0.0.1
DB_USER=postgres_user
DB_PASSWORD=your_password_here
DB_NAME=government_projects
DB_PORT=5432

# API Configuration
NODE_ENV=development
API_HOST=localhost
```

## Step 5: Update docker-compose.yml

The `docker-compose.yml` has been updated to:
- Use `network_mode: host` for the API container (to access localhost PostgreSQL)
- Comment out the `postgres_db` service (using host PostgreSQL instead)

## Step 6: Run Database Migrations

```bash
# Option 1: Run migrations from API container
docker compose exec api npm run migrate

# Option 2: Run migrations locally (if you have Node.js installed)
cd api
npm install
npm run migrate

# Option 3: Run SQL scripts directly
psql -U postgres_user -d government_projects -f scripts/migration/init-postgres.sql
```

## Step 7: Start the Application

```bash
# Start services (API will connect to localhost PostgreSQL)
docker compose up -d

# View logs
docker compose logs -f

# Check API can connect to database
docker compose logs api | grep "PostgreSQL connection"
```

## Step 8: Verify Setup

```bash
# Test database connection from API container
docker compose exec api node -e "const pool = require('./config/db'); pool.query('SELECT NOW()').then(() => {console.log('Connected!'); pool.end();}).catch(e => {console.log('Error:', e.message); pool.end();});"

# Check if API is running
curl http://localhost:3010/api/health

# Check if frontend is running
curl http://localhost:5176
```

## Troubleshooting

### Connection Refused Error

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Check PostgreSQL is listening on port 5432
sudo netstat -tlnp | grep 5432  # Linux
lsof -i :5432  # macOS

# Test connection manually
psql -U postgres_user -h 127.0.0.1 -d government_projects
```

### Authentication Failed

```bash
# Verify user exists and password is correct
sudo -u postgres psql -c "\du"

# Reset password if needed
sudo -u postgres psql -c "ALTER USER postgres_user WITH PASSWORD 'your_password';"
```

### Database Not Found

```bash
# List databases
sudo -u postgres psql -c "\l"

# Create database if missing
sudo -u postgres psql -c "CREATE DATABASE government_projects;"
```

### API Container Can't Access localhost

Make sure the API service in `docker-compose.yml` has:
```yaml
api:
  network_mode: host
```

This allows the container to access `127.0.0.1:5432` on your host machine.

## Differences from Production

| Aspect | Local Development | Production Server |
|--------|------------------|------------------|
| PostgreSQL | Host machine | Host machine |
| API Network | `network_mode: host` | `network_mode: host` |
| Frontend Port | 5176 | 80 (via nginx) |
| API Port | 3010 | 3001 |
| Nginx | Docker container | System nginx |

## Switching Back to Docker PostgreSQL

If you want to use Docker PostgreSQL instead:

1. Uncomment `postgres_db` service in `docker-compose.yml`
2. Change API `network_mode: host` to bridge network
3. Set `DB_HOST=postgres_db` in `.env`
4. Remove `depends_on` comment

## Useful Commands

```bash
# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log  # Linux
tail -f /usr/local/var/log/postgresql.log  # macOS

# Connect to database
psql -U postgres_user -d government_projects

# Backup database
pg_dump -U postgres_user government_projects > backup.sql

# Restore database
psql -U postgres_user government_projects < backup.sql

# View running containers
docker compose ps

# Restart API container
docker compose restart api
```
