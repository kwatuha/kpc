#!/bin/bash

# Test script to verify Edit Project functionality
# This tests:
# 1. GET /api/projects/:id - Fetch single project
# 2. PUT /api/projects/:id - Update project

set -e

echo "=== Testing Edit Project Functionality ==="
echo ""

# Test project ID (using project_id = 1)
PROJECT_ID=1

echo "Step 1: Testing GET /api/projects/${PROJECT_ID}"
echo "Note: This requires authentication. Testing database query directly..."
echo ""

# Test the database query directly
docker exec -i gov_postgres psql -U postgres -d government_projects <<EOF
-- Test the GET single project query
SELECT 
    p.project_id AS id,
    p.name AS "projectName",
    p.description AS "projectDescription",
    p.implementing_agency AS directorate,
    p.category_id AS "categoryId",
    p.sector AS sector,
    cat."categoryName" AS "categoryName"
FROM projects p
LEFT JOIN categories cat ON p.category_id = cat."categoryId" AND (cat.voided IS NULL OR cat.voided = false)
WHERE p.project_id = ${PROJECT_ID} AND p.voided = false;
EOF

echo ""
echo "Step 2: Testing UPDATE query structure"
echo ""

# Test update query
docker exec -i gov_postgres psql -U postgres -d government_projects <<EOF
-- Test updating a project
BEGIN;

-- Show current values
SELECT project_id, name, category_id, sector FROM projects WHERE project_id = ${PROJECT_ID};

-- Test update (will rollback)
UPDATE projects 
SET 
    name = name || ' (TEST)',
    category_id = COALESCE(category_id, NULL),
    updated_at = CURRENT_TIMESTAMP
WHERE project_id = ${PROJECT_ID} AND voided = false
RETURNING project_id, name, category_id;

ROLLBACK;
EOF

echo ""
echo "=== Test Complete ==="
echo ""
echo "To test via API:"
echo "1. Log in at http://localhost:8081/impes/login"
echo "2. Navigate to Projects page"
echo "3. Click Edit on a project"
echo "4. Make changes and click Update"
echo ""
