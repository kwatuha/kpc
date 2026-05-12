#!/bin/bash

# Direct migration script - dumps from Docker and imports to local
# Works even if local PostgreSQL service isn't set up yet

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DOCKER_CONTAINER="gov_postgres"
DOCKER_DB_NAME="government_projects"
DOCKER_DB_USER="postgres"
DUMP_FILE="government_projects_dump_$(date +%Y%m%d_%H%M%S).sql"

print_status "=== Direct Database Migration ==="
echo ""

# Step 1: Check Docker container
print_status "Step 1: Checking Docker PostgreSQL container..."
if ! docker ps --format "{{.Names}}" | grep -q "^${DOCKER_CONTAINER}$"; then
    print_error "Docker container '${DOCKER_CONTAINER}' is not running"
    exit 1
fi
print_success "Docker container is running"

# Step 2: Dump from Docker
print_status "Step 2: Dumping database from Docker..."
if docker exec ${DOCKER_CONTAINER} pg_dump -U ${DOCKER_DB_USER} -d ${DOCKER_DB_NAME} --clean --if-exists > "${DUMP_FILE}" 2>/dev/null; then
    DUMP_SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
    print_success "Database dumped: ${DUMP_FILE} (${DUMP_SIZE})"
else
    print_error "Failed to dump database"
    exit 1
fi

# Step 3: Check if we can connect to local PostgreSQL
print_status "Step 3: Checking local PostgreSQL..."

LOCAL_PG_READY=false
LOCAL_PORT=5432

# Check port 5432
if pg_isready -h localhost -p 5432 &> /dev/null; then
    LOCAL_PG_READY=true
    print_success "Local PostgreSQL is running on port 5432"
# Check port 5433 (Docker might be exposing it)
elif pg_isready -h localhost -p 5433 &> /dev/null; then
    LOCAL_PG_READY=true
    LOCAL_PORT=5433
    print_warning "Found PostgreSQL on port 5433 (might be Docker)"
    print_status "You may want to install local PostgreSQL first"
else
    print_warning "Local PostgreSQL is not running"
    echo ""
    print_status "You have two options:"
    echo ""
    echo "Option 1: Install and start local PostgreSQL"
    echo "  sudo apt install postgresql postgresql-contrib"
    echo "  sudo systemctl start postgresql"
    echo "  Then run this script again"
    echo ""
    echo "Option 2: Use the dump file later"
    echo "  Dump file saved: ${DUMP_FILE}"
    echo "  Import it later with:"
    echo "    psql -h localhost -U your_user -d government_projects -f ${DUMP_FILE}"
    echo ""
    read -p "Continue anyway? (y/n): " CONTINUE
    if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
        print_status "Dump file saved: ${DUMP_FILE}"
        exit 0
    fi
fi

if [ "$LOCAL_PG_READY" = true ]; then
    # Get local database credentials
    echo ""
    read -p "Local database name [government_projects]: " LOCAL_DB_NAME
    LOCAL_DB_NAME=${LOCAL_DB_NAME:-government_projects}
    
    read -p "Local database user [postgres_user]: " LOCAL_DB_USER
    LOCAL_DB_USER=${LOCAL_DB_USER:-postgres_user}
    
    read -sp "Local database password: " LOCAL_DB_PASSWORD
    echo ""
    
    # Try to connect and create database
    print_status "Step 4: Setting up local database..."
    
    # Determine connection method
    if psql -h localhost -p ${LOCAL_PORT} -d postgres -c "SELECT 1;" &> /dev/null; then
        CONNECT_CMD="psql -h localhost -p ${LOCAL_PORT} -d postgres"
        CONNECT_DB_CMD="psql -h localhost -p ${LOCAL_PORT}"
    elif id postgres &> /dev/null && sudo -u postgres psql -d postgres -c "SELECT 1;" &> /dev/null; then
        CONNECT_CMD="sudo -u postgres psql -d postgres"
        CONNECT_DB_CMD="sudo -u postgres psql"
    else
        print_error "Cannot connect to PostgreSQL"
        print_status "Dump file saved: ${DUMP_FILE}"
        print_status "Import manually when PostgreSQL is ready"
        exit 1
    fi
    
    # Create database
    DB_EXISTS=$(${CONNECT_CMD} -tAc "SELECT 1 FROM pg_database WHERE datname='${LOCAL_DB_NAME}'" 2>/dev/null || echo "0")
    
    if [ "$DB_EXISTS" = "1" ]; then
        print_warning "Database exists. Dropping and recreating..."
        ${CONNECT_CMD} -c "DROP DATABASE IF EXISTS ${LOCAL_DB_NAME};" 2>/dev/null || true
    fi
    
    ${CONNECT_CMD} -c "CREATE DATABASE ${LOCAL_DB_NAME};" 2>/dev/null
    print_success "Database created"
    
    # Create user
    USER_EXISTS=$(${CONNECT_CMD} -tAc "SELECT 1 FROM pg_user WHERE usename='${LOCAL_DB_USER}'" 2>/dev/null || echo "0")
    
    if [ "$USER_EXISTS" = "1" ]; then
        ${CONNECT_CMD} -c "ALTER USER ${LOCAL_DB_USER} WITH PASSWORD '${LOCAL_DB_PASSWORD}';" 2>/dev/null || true
    else
        ${CONNECT_CMD} -c "CREATE USER ${LOCAL_DB_USER} WITH PASSWORD '${LOCAL_DB_PASSWORD}';" 2>/dev/null
    fi
    
    ${CONNECT_CMD} -c "GRANT ALL PRIVILEGES ON DATABASE ${LOCAL_DB_NAME} TO ${LOCAL_DB_USER};" 2>/dev/null || true
    print_success "User created/updated"
    
    # Import dump
    print_status "Step 5: Importing database..."
    export PGPASSWORD="${LOCAL_DB_PASSWORD}"
    
    if psql -h localhost -p ${LOCAL_PORT} -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -f "${DUMP_FILE}" > /dev/null 2>&1; then
        print_success "Database imported successfully"
    else
        print_warning "Import had warnings. Verifying..."
        TABLE_COUNT=$(psql -h localhost -p ${LOCAL_PORT} -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
        if [ "$TABLE_COUNT" -gt "0" ]; then
            print_success "Import successful (${TABLE_COUNT} tables)"
        else
            print_error "Import failed"
            exit 1
        fi
    fi
    
    unset PGPASSWORD
    
    # Create .env file
    print_status "Step 6: Creating .env file..."
    cat > .env << EOF
# Database Configuration (localhost PostgreSQL)
DB_TYPE=postgresql
DB_HOST=127.0.0.1
DB_USER=${LOCAL_DB_USER}
DB_PASSWORD=${LOCAL_DB_PASSWORD}
DB_NAME=${LOCAL_DB_NAME}
DB_PORT=${LOCAL_PORT}

# API Configuration
NODE_ENV=development
API_HOST=localhost
EOF
    
    print_success ".env file created"
    print_success "=== Migration Complete! ==="
else
    print_status "Dump file saved: ${DUMP_FILE}"
    print_status "Install PostgreSQL and run this script again, or import manually"
fi
