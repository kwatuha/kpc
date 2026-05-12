#!/bin/bash

# Quick script to start PostgreSQL on Linux
# This helps when the service name is not standard

echo "Finding PostgreSQL service..."

# Try to find the service
SERVICE=$(systemctl list-unit-files | grep -i postgres | grep -v "@" | awk '{print $1}' | head -1)

if [ -z "$SERVICE" ]; then
    # Try version-specific service
    VERSION=$(psql --version 2>/dev/null | awk '{print $3}' | cut -d. -f1)
    if [ -n "$VERSION" ]; then
        SERVICE="postgresql@${VERSION}-main"
    fi
fi

if [ -z "$SERVICE" ]; then
    echo "Could not find PostgreSQL service automatically."
    echo ""
    echo "Available PostgreSQL services:"
    systemctl list-unit-files | grep -i postgres
    echo ""
    echo "Please start manually with:"
    echo "  sudo systemctl start postgresql@14-main"
    echo "  or"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo "Found service: $SERVICE"
echo "Starting PostgreSQL..."

if sudo systemctl start "$SERVICE"; then
    echo "✓ PostgreSQL started successfully"
    echo ""
    echo "Checking connection..."
    sleep 2
    if pg_isready -h localhost -p 5432; then
        echo "✓ PostgreSQL is ready to accept connections"
    else
        echo "⚠ PostgreSQL started but not accepting connections yet"
        echo "  Wait a few seconds and try: pg_isready -h localhost -p 5432"
    fi
else
    echo "✗ Failed to start PostgreSQL"
    echo ""
    echo "Try manually:"
    echo "  sudo systemctl start $SERVICE"
    exit 1
fi
