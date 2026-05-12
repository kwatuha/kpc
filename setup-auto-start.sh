#!/bin/bash

# Script to set up Docker Compose auto-start on system boot
# Run this script with sudo: sudo ./setup-auto-start.sh

set -e

echo "Setting up Docker Compose auto-start for IMES application..."

# Get the absolute path to the docker-compose.yml file
COMPOSE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_FILE="$COMPOSE_DIR/docker-compose.service"

# Check if service file exists
if [ ! -f "$SERVICE_FILE" ]; then
    echo "Error: docker-compose.service file not found at $SERVICE_FILE"
    exit 1
fi

# Copy service file to systemd directory
echo "Installing systemd service..."
sudo cp "$SERVICE_FILE" /etc/systemd/system/imes-docker-compose.service

# Reload systemd to recognize the new service
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable the service to start on boot
echo "Enabling service to start on boot..."
sudo systemctl enable imes-docker-compose.service

# Optionally start the service now
read -p "Do you want to start the service now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting service..."
    sudo systemctl start imes-docker-compose.service
    echo "Service started. Checking status..."
    sudo systemctl status imes-docker-compose.service --no-pager
fi

echo ""
echo "Setup complete!"
echo ""
echo "To check service status: sudo systemctl status imes-docker-compose.service"
echo "To start service manually: sudo systemctl start imes-docker-compose.service"
echo "To stop service: sudo systemctl stop imes-docker-compose.service"
echo "To view logs: sudo journalctl -u imes-docker-compose.service -f"

