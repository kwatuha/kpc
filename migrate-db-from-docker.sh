#!/bin/bash

# Script to migrate database from Docker PostgreSQL to local PostgreSQL
# This dumps the database from Docker and imports it into local PostgreSQL

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
DOCKER_DB_PASSWORD="postgres"
DUMP_FILE="government_projects_dump_$(date +%Y%m%d_%H%M%S).sql"

# Local database configuration (can be overridden)
LOCAL_DB_NAME="${DB_NAME:-government_projects}"
LOCAL_DB_USER="${DB_USER:-postgres_user}"
LOCAL_DB_PASSWORD="${DB_PASSWORD:-}"

print_status "=== Database Migration from Docker to Local PostgreSQL ==="
echo ""

# Step 1: Check if Docker container is running
print_status "Step 1: Checking Docker PostgreSQL container..."
if ! docker ps --format "{{.Names}}" | grep -q "^${DOCKER_CONTAINER}$"; then
    print_error "Docker container '${DOCKER_CONTAINER}' is not running"
    print_status "Available containers:"
    docker ps --format "  {{.Names}}"
    exit 1
fi
print_success "Docker container '${DOCKER_CONTAINER}' is running"

# Step 2: Check if local PostgreSQL is running
print_status "Step 2: Checking local PostgreSQL..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    print_error "Local PostgreSQL is not running"
    print_status "Please start PostgreSQL first:"
    echo "  ./start-postgres.sh"
    echo "  or"
    echo "  sudo systemctl start postgresql@14-main"
    exit 1
fi
print_success "Local PostgreSQL is running"

# Step 3: Dump database from Docker
print_status "Step 3: Dumping database from Docker container..."
print_status "Container: ${DOCKER_CONTAINER}"
print_status "Database: ${DOCKER_DB_NAME}"

if docker exec ${DOCKER_CONTAINER} pg_dump -U ${DOCKER_DB_USER} -d ${DOCKER_DB_NAME} --clean --if-exists > "${DUMP_FILE}" 2>/dev/null; then
    print_success "Database dumped to: ${DUMP_FILE}"
    DUMP_SIZE=$(du -h "${DUMP_FILE}" | cut -f1)
    print_status "Dump file size: ${DUMP_SIZE}"
else
    print_error "Failed to dump database from Docker container"
    exit 1
fi

# Step 4: Get local database credentials
echo ""
print_status "Step 4: Local database configuration"
read -p "Local database name [${LOCAL_DB_NAME}]: " input_db_name
LOCAL_DB_NAME=${input_db_name:-${LOCAL_DB_NAME}}

read -p "Local database user [${LOCAL_DB_USER}]: " input_db_user
LOCAL_DB_USER=${input_db_user:-${LOCAL_DB_USER}}

if [ -z "$LOCAL_DB_PASSWORD" ]; then
    read -sp "Local database password: " LOCAL_DB_PASSWORD
    echo ""
fi

# Step 5: Create local database if it doesn't exist
print_status "Step 5: Creating local database if needed..."

# Try to connect and create database
if psql -d postgres -c "SELECT 1;" &> /dev/null; then
    # Connect as current user
    CONNECT_CMD="psql -d postgres"
elif id postgres &> /dev/null && sudo -u postgres psql -d postgres -c "SELECT 1;" &> /dev/null; then
    # Connect as postgres user
    CONNECT_CMD="sudo -u postgres psql -d postgres"
else
    print_error "Cannot connect to PostgreSQL. Please ensure PostgreSQL is running and accessible."
    exit 1
fi

# Check if database exists
DB_EXISTS=$(${CONNECT_CMD} -tAc "SELECT 1 FROM pg_database WHERE datname='${LOCAL_DB_NAME}'" 2>/dev/null || echo "0")

if [ "$DB_EXISTS" = "1" ]; then
    print_warning "Database '${LOCAL_DB_NAME}' already exists"
    read -p "Drop and recreate? (y/n): " RECREATE
    if [[ "$RECREATE" == "y" || "$RECREATE" == "Y" ]]; then
        print_status "Dropping existing database..."
        ${CONNECT_CMD} -c "DROP DATABASE IF EXISTS ${LOCAL_DB_NAME};" 2>/dev/null || true
        ${CONNECT_CMD} -c "CREATE DATABASE ${LOCAL_DB_NAME};" 2>/dev/null
        print_success "Database recreated"
    else
        print_status "Using existing database"
    fi
else
    print_status "Creating database '${LOCAL_DB_NAME}'..."
    ${CONNECT_CMD} -c "CREATE DATABASE ${LOCAL_DB_NAME};" 2>/dev/null
    print_success "Database created"
fi

# Step 6: Create user if it doesn't exist
print_status "Step 6: Creating database user if needed..."
USER_EXISTS=$(${CONNECT_CMD} -tAc "SELECT 1 FROM pg_user WHERE usename='${LOCAL_DB_USER}'" 2>/dev/null || echo "0")

if [ "$USER_EXISTS" = "1" ]; then
    print_status "User '${LOCAL_DB_USER}' already exists, updating password..."
    ${CONNECT_CMD} -c "ALTER USER ${LOCAL_DB_USER} WITH PASSWORD '${LOCAL_DB_PASSWORD}';" 2>/dev/null || true
else
    print_status "Creating user '${LOCAL_DB_USER}'..."
    ${CONNECT_CMD} -c "CREATE USER ${LOCAL_DB_USER} WITH PASSWORD '${LOCAL_DB_PASSWORD}';" 2>/dev/null
    print_success "User created"
fi

# Grant privileges
print_status "Granting privileges..."
${CONNECT_CMD} -c "GRANT ALL PRIVILEGES ON DATABASE ${LOCAL_DB_NAME} TO ${LOCAL_DB_USER};" 2>/dev/null || true
${CONNECT_CMD} -d ${LOCAL_DB_NAME} -c "GRANT ALL ON SCHEMA public TO ${LOCAL_DB_USER};" 2>/dev/null || true
print_success "Privileges granted"

# Step 7: Import dump into local database
print_status "Step 7: Importing database dump..."
print_status "This may take a few minutes..."

# Set PGPASSWORD for non-interactive connection
export PGPASSWORD="${LOCAL_DB_PASSWORD}"

if psql -h localhost -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -f "${DUMP_FILE}" > /dev/null 2>&1; then
    print_success "Database imported successfully"
else
    print_warning "Import had some warnings/errors. Checking if database has data..."
    
    # Check if tables were created
    TABLE_COUNT=$(psql -h localhost -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
    
    if [ "$TABLE_COUNT" -gt "0" ]; then
        print_success "Database imported (${TABLE_COUNT} tables found)"
    else
        print_error "Import failed - no tables found"
        print_status "Trying import with verbose output..."
        psql -h localhost -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -f "${DUMP_FILE}" 2>&1 | tail -20
        exit 1
    fi
fi

unset PGPASSWORD

# Step 8: Update .env file
print_status "Step 8: Updating .env file..."
cat > .env << EOF
# Database Configuration (localhost PostgreSQL)
DB_TYPE=postgresql
DB_HOST=127.0.0.1
DB_USER=${LOCAL_DB_USER}
DB_PASSWORD=${LOCAL_DB_PASSWORD}
DB_NAME=${LOCAL_DB_NAME}
DB_PORT=5432

# API Configuration
NODE_ENV=development
API_HOST=localhost
EOF

print_success ".env file updated"

# Step 9: Verify import
print_status "Step 9: Verifying import..."
TABLE_COUNT=$(psql -h localhost -U ${LOCAL_DB_USER} -d ${LOCAL_DB_NAME} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")
print_success "Database verification: ${TABLE_COUNT} tables found"

echo ""
print_success "=== Migration Complete! ==="
echo ""
print_status "Summary:"
echo "  - Dump file: ${DUMP_FILE}"
echo "  - Local database: ${LOCAL_DB_NAME}"
echo "  - Local user: ${LOCAL_DB_USER}"
echo "  - Tables imported: ${TABLE_COUNT}"
echo ""
print_status "Next steps:"
echo "  1. Review .env file if needed"
echo "  2. Start the application: docker compose up -d"
echo "  3. The API will now connect to local PostgreSQL instead of Docker"
