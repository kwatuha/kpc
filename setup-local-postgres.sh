#!/bin/bash

# Setup script for local PostgreSQL installation
# This script helps set up PostgreSQL on your local machine to match the production server setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        OS="unknown"
    fi
    echo $OS
}

# Check if PostgreSQL is installed
check_postgresql() {
    if command -v psql &> /dev/null; then
        POSTGRES_VERSION=$(psql --version | awk '{print $3}')
        print_success "PostgreSQL is installed: $POSTGRES_VERSION"
        return 0
    else
        print_warning "PostgreSQL is not installed"
        return 1
    fi
}

# Check if PostgreSQL is running
check_postgresql_running() {
    # Check if postgres process is running
    if pgrep -x postgres > /dev/null 2>&1; then
        # Check if it's actually accepting connections
        if pg_isready -h localhost -p 5432 &> /dev/null; then
            print_success "PostgreSQL is running and accepting connections"
            return 0
        else
            print_warning "PostgreSQL process is running but not accepting connections on port 5432"
            print_status "Checking other ports..."
            # Check common PostgreSQL ports
            for port in 5432 5433 5434; do
                if pg_isready -h localhost -p $port &> /dev/null; then
                    print_warning "PostgreSQL is running on port $port instead of 5432"
                    print_status "You may need to update DB_PORT in .env file"
                    return 0
                fi
            done
            return 1
        fi
    else
        print_warning "PostgreSQL is not running"
        return 1
    fi
}

# Find PostgreSQL service name
find_postgresql_service() {
    # Try common service names
    local service_names=(
        "postgresql"
        "postgresql@14-main"
        "postgresql@14"
        "postgresql-14"
        "postgresql@16-main"
        "postgresql@16"
        "postgresql-16"
    )
    
    for service in "${service_names[@]}"; do
        if systemctl list-unit-files | grep -q "^${service}.service"; then
            echo "$service"
            return 0
        fi
    done
    
    # If systemctl doesn't find it, try checking running services
    local running_service=$(systemctl list-units --type=service --state=running | grep -i postgres | awk '{print $1}' | head -1)
    if [ -n "$running_service" ]; then
        echo "$running_service"
        return 0
    fi
    
    return 1
}

# Start PostgreSQL service
start_postgresql() {
    local service_name=$(find_postgresql_service)
    
    if [ -n "$service_name" ]; then
        print_status "Found PostgreSQL service: $service_name"
        if sudo systemctl start "$service_name" 2>/dev/null; then
            sudo systemctl enable "$service_name" 2>/dev/null
            print_success "PostgreSQL service started"
            return 0
        fi
    fi
    
    # Try alternative methods
    print_status "Trying alternative methods to start PostgreSQL..."
    
    # Method 1: Try pg_ctlcluster (Debian/Ubuntu)
    if command -v pg_ctlcluster &> /dev/null; then
        print_status "Using pg_ctlcluster to start PostgreSQL..."
        local version=$(psql --version | awk '{print $3}' | cut -d. -f1)
        if sudo pg_ctlcluster ${version} main start 2>/dev/null; then
            print_success "PostgreSQL started using pg_ctlcluster"
            return 0
        fi
    fi
    
    # Method 2: Try finding and starting postgres directly
    local pg_ctl=$(find /usr/lib/postgresql -name "pg_ctl" 2>/dev/null | head -1)
    if [ -n "$pg_ctl" ]; then
        print_status "Found pg_ctl at: $pg_ctl"
        local data_dir=$(sudo -u postgres psql -t -c "SHOW data_directory;" 2>/dev/null | xargs)
        if [ -n "$data_dir" ] && [ -d "$data_dir" ]; then
            print_status "Starting PostgreSQL with data directory: $data_dir"
            if sudo -u postgres "$pg_ctl" -D "$data_dir" start 2>/dev/null; then
                print_success "PostgreSQL started directly"
                return 0
            fi
        fi
    fi
    
    # Method 3: Try common service names
    for service in postgresql postgresql@14-main postgresql-14; do
        if sudo systemctl start "$service" 2>/dev/null; then
            print_success "PostgreSQL started using service: $service"
            return 0
        fi
    done
    
    print_error "Could not start PostgreSQL automatically"
    print_status "Please try one of these commands manually:"
    print_status "  sudo systemctl start postgresql"
    print_status "  sudo pg_ctlcluster 14 main start"
    print_status "  sudo -u postgres /usr/lib/postgresql/14/bin/pg_ctl -D /var/lib/postgresql/14/main start"
    return 1
}

# Install PostgreSQL (Linux)
install_postgresql_linux() {
    print_status "Installing PostgreSQL on Linux..."
    
    if command -v apt-get &> /dev/null; then
        sudo apt update
        sudo apt install -y postgresql postgresql-contrib
    elif command -v yum &> /dev/null; then
        sudo yum install -y postgresql-server postgresql-contrib
        sudo postgresql-setup initdb
    else
        print_error "Unsupported Linux distribution. Please install PostgreSQL manually."
        exit 1
    fi
    
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    print_success "PostgreSQL installed and started"
}

# Install PostgreSQL (macOS)
install_postgresql_macos() {
    print_status "Installing PostgreSQL on macOS..."
    
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is required. Install from https://brew.sh"
        exit 1
    fi
    
    brew install postgresql@16
    brew services start postgresql@16
    
    # Add to PATH
    echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
    echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.bash_profile
    
    print_success "PostgreSQL installed and started"
    print_warning "Please restart your terminal or run: export PATH=\"/usr/local/opt/postgresql@16/bin:\$PATH\""
}

# Find PostgreSQL admin user
find_postgres_admin() {
    # Try common admin users
    local admin_users=("postgres" "$(whoami)")
    
    for admin in "${admin_users[@]}"; do
        if id "$admin" &> /dev/null; then
            # Try to connect with this user
            if psql -U "$admin" -d postgres -c "SELECT 1;" &> /dev/null; then
                echo "$admin"
                return 0
            fi
        fi
    done
    
    # Try connecting without specifying user (uses peer authentication)
    if psql -d postgres -c "SELECT 1;" &> /dev/null; then
        echo "$(whoami)"
        return 0
    fi
    
    return 1
}

# Create database and user
setup_database() {
    print_status "Setting up database and user..."
    
    read -p "Database name [government_projects]: " DB_NAME
    DB_NAME=${DB_NAME:-government_projects}
    
    read -p "Database user [postgres_user]: " DB_USER
    DB_USER=${DB_USER:-postgres_user}
    
    read -sp "Database password: " DB_PASSWORD
    echo
    
    # Find PostgreSQL admin user
    ADMIN_USER=$(find_postgres_admin)
    
    if [ -z "$ADMIN_USER" ]; then
        print_error "Could not find PostgreSQL admin user"
        print_status "Trying to connect as current user: $(whoami)"
        ADMIN_USER=$(whoami)
    else
        print_status "Using PostgreSQL admin user: $ADMIN_USER"
    fi
    
    # Try to create database and user
    print_status "Creating database and user..."
    
    # First, try with sudo if postgres user exists
    if id postgres &> /dev/null; then
        if sudo -u postgres psql << EOF 2>/dev/null
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER USER $DB_USER CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
        then
            print_success "Database and user created"
            return 0
        fi
    fi
    
    # Try connecting as current user (peer authentication)
    if psql -d postgres << EOF 2>/dev/null
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
ALTER USER $DB_USER CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
    then
        print_success "Database and user created"
        return 0
    fi
    
    # If both fail, provide manual instructions
    print_error "Could not create database automatically"
    print_status "Please run these commands manually:"
    echo ""
    echo "  psql -d postgres"
    echo "  CREATE DATABASE $DB_NAME;"
    echo "  CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    echo "  ALTER USER $DB_USER CREATEDB;"
    echo "  GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
    echo "  \\q"
    echo ""
    read -p "Press Enter after you've created the database and user manually..."
    
    print_success "Continuing with setup..."
    
    # Create .env file
    print_status "Creating .env file..."
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
    
    print_success ".env file created"
    print_warning "Please review and update .env file if needed"
}

# Main execution
main() {
    print_status "Local PostgreSQL Setup Script"
    echo
    
    OS=$(detect_os)
    print_status "Detected OS: $OS"
    
    if check_postgresql; then
        if check_postgresql_running; then
            print_success "PostgreSQL is ready"
        else
            print_warning "PostgreSQL is installed but not running"
            if [[ "$OS" == "linux" ]]; then
                start_postgresql
                # Wait a moment and check again
                sleep 2
                if check_postgresql_running; then
                    print_success "PostgreSQL is now running"
                else
                    print_error "Failed to start PostgreSQL. Please start it manually."
                    print_status "Try: sudo systemctl start postgresql"
                    print_status "Or: sudo pg_ctlcluster 14 main start"
                fi
            elif [[ "$OS" == "macos" ]]; then
                brew services start postgresql@16
            fi
        fi
    else
        print_status "PostgreSQL not found. Installing..."
        if [[ "$OS" == "linux" ]]; then
            install_postgresql_linux
        elif [[ "$OS" == "macos" ]]; then
            install_postgresql_macos
        else
            print_error "Unsupported OS. Please install PostgreSQL manually."
            exit 1
        fi
    fi
    
    echo
    read -p "Do you want to set up the database and user now? (y/n): " SETUP_DB
    if [[ "$SETUP_DB" == "y" || "$SETUP_DB" == "Y" ]]; then
        setup_database
    else
        print_status "Skipping database setup. You can run this script again later."
    fi
    
    echo
    print_success "Setup complete!"
    print_status "Next steps:"
    echo "  1. Review and update .env file if needed"
    echo "  2. Run database migrations: docker compose exec api npm run migrate"
    echo "  3. Start the application: docker compose up -d"
}

# Run main function
main
