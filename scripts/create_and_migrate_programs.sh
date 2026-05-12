#!/bin/bash

# Complete script to create tables and migrate programs/subprograms
# This script:
# 1. Creates the programs and subprograms tables
# 2. Runs the migration script to import data

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Programs and Subprograms Setup ===${NC}\n"

# Check if we're using Docker
if docker ps | grep -q "gov_postgres"; then
    USE_DOCKER=true
    echo -e "${GREEN}Detected Docker environment${NC}"
else
    USE_DOCKER=false
    echo -e "${YELLOW}Using direct database connection${NC}"
fi

# Step 1: Create tables
echo -e "\n${BLUE}Step 1: Creating tables...${NC}"

if [ "$USE_DOCKER" = true ]; then
    docker exec -i gov_postgres psql -U postgres -d government_projects < api/migrations/create_programs_subprograms_tables.sql
    echo -e "${GREEN}✓ Tables created${NC}"
else
    psql -h localhost -U postgres -d government_projects -f api/migrations/create_programs_subprograms_tables.sql
    echo -e "${GREEN}✓ Tables created${NC}"
fi

# Step 2: Verify tables exist
echo -e "\n${BLUE}Step 2: Verifying tables...${NC}"

if [ "$USE_DOCKER" = true ]; then
    docker exec gov_postgres psql -U postgres -d government_projects -c "\d programs" > /dev/null 2>&1 && echo -e "${GREEN}✓ programs table exists${NC}" || echo -e "${YELLOW}⚠ programs table check failed${NC}"
    docker exec gov_postgres psql -U postgres -d government_projects -c "\d subprograms" > /dev/null 2>&1 && echo -e "${GREEN}✓ subprograms table exists${NC}" || echo -e "${YELLOW}⚠ subprograms table check failed${NC}"
else
    psql -h localhost -U postgres -d government_projects -c "\d programs" > /dev/null 2>&1 && echo -e "${GREEN}✓ programs table exists${NC}" || echo -e "${YELLOW}⚠ programs table check failed${NC}"
    psql -h localhost -U postgres -d government_projects -c "\d subprograms" > /dev/null 2>&1 && echo -e "${GREEN}✓ subprograms table exists${NC}" || echo -e "${YELLOW}⚠ subprograms table check failed${NC}"
fi

# Step 3: Run migration
echo -e "\n${BLUE}Step 3: Running migration script...${NC}"
echo -e "${YELLOW}Note: Make sure npm packages are installed (cd api && npm install)${NC}\n"

if [ -f "api/node_modules/mysql2/package.json" ] && [ -f "api/node_modules/pg/package.json" ]; then
    node scripts/migrate_programs_subprograms.js
    echo -e "\n${GREEN}✓ Migration completed${NC}"
else
    echo -e "${YELLOW}⚠ Dependencies not found. Please run: cd api && npm install${NC}"
    echo -e "${YELLOW}Then run: node scripts/migrate_programs_subprograms.js${NC}"
fi

echo -e "\n${BLUE}=== Setup Complete ===${NC}"
