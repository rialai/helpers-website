#!/bin/bash

# Quick deployment check and alternative methods

echo "🔍 Checking server connectivity..."
echo ""

# Test 1: Check if server is reachable
echo "1️⃣  Testing ping to 35.205.7.180..."
if ping -c 1 -W 2 35.205.7.180 &> /dev/null; then
    echo "   ✓ Server is reachable"
else
    echo "   ✗ Server not reachable via ping"
fi

echo ""
echo "2️⃣  Testing HTTPS connection..."
if timeout 5 curl -s -I https://helpers.ie | head -1; then
    echo "   ✓ helpers.ie is accessible"
else
    echo "   ✗ Connection failed"
fi

echo ""
echo "3️⃣  Checking SSH keys..."
ls -la ~/.ssh/google_compute_engine 2>/dev/null && echo "   ✓ Google SSH key exists" || echo "   ✗ No Google SSH key"
ls -la ~/.ssh/id_rsa 2>/dev/null && echo "   ✓ RSA key exists" || echo "   ✗ No RSA key"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 MANUAL DEPLOYMENT STEPS"
echo ""
echo "Since SSH keys are not working, try these options:"
echo ""
echo "OPTION 1: Use gcloud CLI (if authenticated)"
echo "─────────────────────────────────────────"
echo "gcloud compute ssh wordpress-gcp --project=debraker-bot -- << 'EOF'"
echo "cd ~/bench"
echo "cd apps/helpers_website"
echo "git pull origin main"
echo "cd ../.."
echo "bench migrate"
echo "bench clear-cache"
echo "EOF"
echo ""
echo ""
echo "OPTION 2: Manually on server"
echo "───────────────────────────"
echo "1. SSH to 35.205.7.180 (however you normally do)"
echo "2. Run these commands:"
echo ""
echo "   cd ~/bench  # or /opt/frappe-bench or wherever bench is"
echo "   cd apps/helpers_website"
echo "   git pull origin main"
echo "   cd ../.."
echo "   bench migrate"
echo "   bench clear-cache"
echo ""
echo ""
echo "OPTION 3: Using Frappe Bench API (REST)"
echo "───────────────────────────────────────"
echo "POST https://helpers.ie/api/method/frappe.client.get"
echo "(if REST API is exposed)"
echo ""
echo ""
echo "OPTION 4: Frappe Cloud Dashboard (if hosted there)"
echo "────────────────────────────────────────────────"
echo "Log in to https://frappecloud.com and trigger deployment"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
