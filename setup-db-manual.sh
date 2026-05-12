#!/bin/bash

# Manual database setup script
# Use this when PostgreSQL doesn't have a postgres system user

set -e

echo "=== PostgreSQL Database Setup ==="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "ERROR: PostgreSQL is not running!"
    echo ""
    echo "Please start PostgreSQL first:"
    echo "  ./start-postgres.sh"
    echo "  or"
    echo "  sudo systemctl start postgresql@14-main"
    exit 1
fi

echo "PostgreSQL is running ✓"
echo ""

# Get database details
read -p "Database name [government_projects]: " DB_NAME
DB_NAME=${DB_NAME:-government_projects}

read -p "Database user [postgres_user]: " DB_USER
DB_USER=${DB_USER:-postgres_user}

read -sp "Database password: " DB_PASSWORD
echo ""

# Try to connect and create database
echo ""
echo "Attempting to create database and user..."

# Method 1: Try connecting as current user (if peer auth is configured)
if psql -d postgres -c "SELECT 1;" &> /dev/null; then
    echo "Connecting as current user: $(whoami)"
    psql -d postgres << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER USER $DB_USER CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
    echo "✓ Database and user created successfully"
    
# Method 2: Try with sudo if postgres user exists
elif id postgres &> /dev/null && sudo -u postgres psql -d postgres -c "SELECT 1;" &> /dev/null; then
    echo "Connecting as postgres user"
    sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER USER $DB_USER CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
    echo "✓ Database and user created successfully"
    
else
    echo ""
    echo "Could not connect automatically. Please run these commands manually:"
    echo ""
    echo "  psql -d postgres"
    echo ""
    echo "Then run:"
    echo "  CREATE DATABASE $DB_NAME;"
    echo "  CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "  ALTER USER $DB_USER CREATEDB;"
    echo "  GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    echo "  \\q"
    echo ""
    read -p "Press Enter after you've created the database and user..."
fi

# Create .env file
echo ""
echo "Creating .env file..."

cat > .env << EOF
# Database Configuration (localhost PostgreSQL)
DB_TYPE=postgresql
DB_HOST=127.0.0.1
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_PORT=5432

# API Configuration
NODE_ENV=development
API_HOST=localhost
EOF

echo "✓ .env file created"
echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Review .env file if needed"
echo "  2. Run database migrations: docker compose exec api npm run migrate"
echo "  3. Start the application: docker compose up -d"
