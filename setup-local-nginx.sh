#!/bin/bash

# Script to setup local nginx on port 80 for IMPES app
# This replaces Apache with nginx for local development

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

# Check if running as root for certain operations
check_sudo() {
    if [ "$EUID" -ne 0 ]; then 
        print_warning "Some commands require sudo. You may be prompted for your password."
    fi
}

# Stop and disable Apache
stop_apache() {
    print_status "Checking for Apache..."
    
    if systemctl is-active --quiet apache2 2>/dev/null; then
        print_status "Stopping Apache2..."
        sudo systemctl stop apache2
        print_success "Apache2 stopped"
        
        print_status "Disabling Apache2 from starting on boot..."
        sudo systemctl disable apache2
        print_success "Apache2 disabled"
    elif systemctl is-active --quiet httpd 2>/dev/null; then
        print_status "Stopping httpd..."
        sudo systemctl stop httpd
        print_success "httpd stopped"
        
        print_status "Disabling httpd from starting on boot..."
        sudo systemctl disable httpd
        print_success "httpd disabled"
    else
        print_status "Apache/httpd is not running"
    fi
}

# Install nginx if not installed
install_nginx() {
    print_status "Checking if nginx is installed..."
    
    if ! command -v nginx &> /dev/null; then
        print_status "Installing nginx..."
        sudo apt-get update
        sudo apt-get install -y nginx
        print_success "nginx installed"
    else
        print_success "nginx is already installed"
    fi
}

# Setup nginx configuration
setup_nginx_config() {
    print_status "Setting up nginx configuration..."
    
    CONFIG_FILE="/etc/nginx/sites-available/impes-local"
    ENABLED_LINK="/etc/nginx/sites-enabled/impes-local"
    LOCAL_CONFIG="./nginx-local.conf"
    
    if [ ! -f "$LOCAL_CONFIG" ]; then
        print_error "Configuration file not found: $LOCAL_CONFIG"
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Copy configuration file
    print_status "Copying nginx configuration to $CONFIG_FILE..."
    sudo cp "$LOCAL_CONFIG" "$CONFIG_FILE"
    print_success "Configuration file copied"
    
    # Remove default nginx site if it exists
    if [ -L "/etc/nginx/sites-enabled/default" ]; then
        print_status "Removing default nginx site..."
        sudo rm /etc/nginx/sites-enabled/default
        print_success "Default site removed"
    fi
    
    # Create symlink to enable site
    if [ -L "$ENABLED_LINK" ]; then
        print_status "Removing existing symlink..."
        sudo rm "$ENABLED_LINK"
    fi
    
    print_status "Creating symlink to enable site..."
    sudo ln -s "$CONFIG_FILE" "$ENABLED_LINK"
    print_success "Site enabled"
    
    # Test nginx configuration
    print_status "Testing nginx configuration..."
    if sudo nginx -t; then
        print_success "nginx configuration is valid"
    else
        print_error "nginx configuration test failed!"
        exit 1
    fi
    
    # Reload nginx
    print_status "Reloading nginx..."
    if sudo systemctl reload nginx; then
        print_success "nginx reloaded"
    else
        print_warning "nginx reload failed, trying restart..."
        sudo systemctl restart nginx
        print_success "nginx restarted"
    fi
}

# Check if port 80 is available
check_port_80() {
    print_status "Checking if port 80 is available..."
    
    if sudo lsof -i :80 &> /dev/null || netstat -tlnp 2>/dev/null | grep -q ":80 " || ss -tlnp 2>/dev/null | grep -q ":80 "; then
        print_warning "Port 80 is currently in use"
        print_status "This script will stop Apache, but you may need to stop other services manually"
    else
        print_success "Port 80 is available"
    fi
}

# Main execution
main() {
    print_status "Setting up local nginx for IMPES app on port 80..."
    echo
    
    check_sudo
    check_port_80
    echo
    
    stop_apache
    echo
    
    install_nginx
    echo
    
    setup_nginx_config
    echo
    
    print_success "========================================="
    print_success "   NGINX SETUP COMPLETED SUCCESSFULLY!   "
    print_success "========================================="
    echo
    print_status "Your app should now be accessible at:"
    print_status "  - http://localhost/impes/"
    print_status "  - http://localhost/api/"
    echo
    print_status "The nginx on port 80 proxies to your Docker containers on port 8081"
    print_status "Make sure your Docker containers are running:"
    print_status "  docker compose up -d"
    echo
}

# Run main function
main
