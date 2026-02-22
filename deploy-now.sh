#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# 🚀 HELPERS.IE DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════

set -e

echo ""
echo "🚀 HELPERS.IE DEPLOYMENT"
echo "════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check gcloud
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✓ gcloud CLI found"

# Step 2: Check current account
ACCOUNT=$(gcloud config get-value account 2>/dev/null)
PROJECT=$(gcloud config get-value project 2>/dev/null)

echo "  Account: $ACCOUNT"
echo "  Project: $PROJECT"
echo ""

# Step 3: Attempt to get instances list (this may trigger reauthentication)
echo "Attempting to connect to production server..."
echo ""

# Set correct project
gcloud config set project debraker-bot --quiet

# Try deployment
gcloud compute --project=debraker-bot ssh --zone=europe-west3-b wordpress-gcp -- << 'EOF'

    echo ""
    echo "✓ SSH connection established"
    echo ""
    
    # Find bench
    BENCH_DIR=""
    if [ -d "$HOME/bench" ]; then
        BENCH_DIR="$HOME/bench"
    elif [ -d "/opt/frappe-bench" ]; then
        BENCH_DIR="/opt/frappe-bench"
    else
        BENCH_DIR=$(find ~ -maxdepth 2 -name "bench" -type d 2>/dev/null | head -1)
    fi
    
    if [ -z "$BENCH_DIR" ]; then
        echo "❌ Bench directory not found"
        exit 1
    fi
    
    echo "📁 Bench location: $BENCH_DIR"
    cd "$BENCH_DIR"
    
    # Deploy
    echo ""
    echo "📥 Pulling helpers_website..."
    cd apps/helpers_website
    git fetch origin main
    git checkout main
    git pull origin main
    
    echo "✓ Code updated"
    echo ""
    
    cd ../..
    
    echo "🔄 Running migrations..."
    bench migrate --quiet
    echo "✓ Migrations done"
    
    echo ""
    echo "🧹 Clearing cache..."
    bench clear-cache
    echo "✓ Cache cleared"
    
    echo ""
    echo "════════════════════════════════════════════════════════════"
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo "════════════════════════════════════════════════════════════"
    
EOF

echo ""
echo "🎉 Done! Visit https://helpers.ie to see the changes"
echo ""
