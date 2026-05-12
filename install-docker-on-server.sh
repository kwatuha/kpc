#!/bin/bash

# Script to install Docker on the remote server
# Run this on the server: ssh fortress@102.210.149.119

echo "Installing Docker on the server..."
echo "This script needs to be run on the server with sudo access"
echo ""
echo "To run this script:"
echo "  1. Copy this script to the server:"
echo "     scp -i ~/.ssh/id_gprs_server install-docker-on-server.sh fortress@102.210.149.119:~/"
echo ""
echo "  2. SSH into the server:"
echo "     ssh -i ~/.ssh/id_gprs_server fortress@102.210.149.119"
echo ""
echo "  3. Run the script:"
echo "     bash install-docker-on-server.sh"
echo ""
echo "Or run these commands directly on the server:"
echo ""
cat << 'INSTALL_COMMANDS'
# Update package index
sudo apt-get update

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Install docker-compose (standalone) as backup
sudo apt-get install -y docker-compose

echo ""
echo "Docker installation complete!"
echo "IMPORTANT: You need to log out and log back in for group changes to take effect."
echo "After logging back in, verify with: docker --version"
INSTALL_COMMANDS
