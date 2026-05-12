#!/bin/bash

# ============================================
# Local Development Verification Script
# ============================================
# This script verifies your local setup is using local API

set +e  # Don't exit on errors (we want to see all checks)

echo "🔍 Verifying Local Development Setup..."
echo ""
echo "=========================================="
echo "1. CHECKING RUNNING CONTAINERS"
echo "=========================================="

if command -v docker &> /dev/null; then
    echo "✓ Docker is installed"
    echo ""
    echo "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "react_frontend|node_api|db|public_dashboard" || echo "⚠️  No project containers running"
    echo ""
else
    echo "❌ Docker not found"
fi

echo ""
echo "=========================================="
echo "2. TESTING LOCAL API (port 3000)"
echo "=========================================="

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/projects | grep -q "401\|200"; then
    echo "✅ Local API is responding on http://localhost:3000"
    echo "   Response: $(curl -s http://localhost:3000/api/projects | head -c 100)"
else
    echo "❌ Local API not responding on http://localhost:3000"
    echo "   Make sure API container is running: docker ps"
fi

echo ""
echo "=========================================="
echo "3. TESTING FRONTEND (port 5173)"
echo "=========================================="

if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/impes/ | grep -q "200"; then
    echo "✅ Frontend is responding on http://localhost:5173/impes/"
else
    echo "❌ Frontend not responding on http://localhost:5173"
    echo "   Make sure frontend container is running"
fi

echo ""
echo "=========================================="
echo "4. TESTING VITE PROXY"
echo "=========================================="

echo "Testing if frontend proxy forwards to local API..."
if curl -s http://localhost:5173/api/projects 2>&1 | grep -q "token\|authorization\|projects"; then
    echo "✅ Vite proxy is working! /api requests are being proxied"
    echo "   http://localhost:5173/api → http://localhost:3000/api"
else
    echo "❌ Vite proxy might not be working"
fi

echo ""
echo "=========================================="
echo "5. CHECKING ENVIRONMENT FILES"
echo "=========================================="

if [ -f "frontend/.env.development" ]; then
    echo "✅ frontend/.env.development exists"
    echo "   Contents:"
    cat frontend/.env.development | grep -v "^#" | grep -v "^$"
else
    echo "⚠️  frontend/.env.development not found"
fi

echo ""

if [ -f "frontend/.env.local" ]; then
    echo "⚠️  frontend/.env.local exists (overrides .env.development)"
    echo "   Contents:"
    cat frontend/.env.local | grep -v "^#" | grep -v "^$"
else
    echo "✓ No .env.local file (good - using .env.development)"
fi

echo ""
echo "=========================================="
echo "6. CHECKING VITE CONFIG"
echo "=========================================="

if grep -q "localhost:3000" frontend/vite.config.js; then
    echo "✅ vite.config.js proxy points to localhost:3000"
else
    echo "⚠️  vite.config.js proxy might not be configured correctly"
fi

echo ""
echo "=========================================="
echo "7. BROWSER VERIFICATION STEPS"
echo "=========================================="

echo ""
echo "📝 Manual steps to verify in browser:"
echo ""
echo "1. Open: http://localhost:5173/impes"
echo ""
echo "2. Press F12 to open DevTools"
echo ""
echo "3. Go to Console tab and paste:"
echo "   console.log('API URL:', import.meta.env.VITE_API_URL)"
echo "   console.log('Mode:', import.meta.env.MODE)"
echo ""
echo "   Expected output:"
echo "   - API URL: /api"
echo "   - Mode: development"
echo ""
echo "4. Go to Network tab and reload the page"
echo ""
echo "5. Filter by 'Fetch/XHR' and look for API calls"
echo ""
echo "   ✅ GOOD: http://localhost:5173/api/..."
echo "   ❌ BAD:  http://165.22.227.234:3000/..."
echo ""
echo "   If you see localhost:5173, the proxy is working!"
echo ""

echo "=========================================="
echo "8. NETWORK TRAFFIC TEST"
echo "=========================================="

echo ""
echo "Checking for any hardcoded production URLs..."
if grep -r "165.22.227.234" frontend/src/ 2>/dev/null | grep -v ".env" | grep -v "node_modules"; then
    echo "⚠️  Found hardcoded production IPs in source code"
else
    echo "✅ No hardcoded production IPs found in source code"
fi

echo ""
echo "=========================================="
echo "✨ SUMMARY"
echo "=========================================="

echo ""
echo "Your local setup should be:"
echo "  • API:              http://localhost:3000"
echo "  • Frontend:         http://localhost:5173/impes"
echo "  • Public Dashboard: http://localhost:5174"
echo ""
echo "API calls flow:"
echo "  Browser → http://localhost:5173/api/..."
echo "         ↓"
echo "  Vite Proxy (vite.config.js)"
echo "         ↓"
echo "  http://localhost:3000/api/..."
echo ""
echo "🎯 Next Steps:"
echo "  1. Verify in browser (see steps above)"
echo "  2. Check Network tab shows localhost URLs"
echo "  3. If using production IPs, restart containers:"
echo "     docker compose down && docker compose up -d --build"
echo ""
echo "=========================================="



























