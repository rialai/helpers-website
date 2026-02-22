#!/bin/bash

# Deploy helpers-website to Google Cloud
# Manual deployment script

set -e

SSH_HOST="35.205.7.180"
SSH_USER="nikolai"
SSH_KEY="$HOME/.ssh/google_compute_engine"
BENCH_PATH="$HOME/bench"  # Update this if needed

echo "🚀 Starting deployment to helpers.ie..."
echo "Server: $SSH_HOST"
echo "User: $SSH_USER"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH key not found: $SSH_KEY"
    exit 1
fi

# Deploy via SSH
echo ""
echo "📡 Connecting to server..."
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" << 'DEPLOY_SCRIPT'
    echo "✓ Connected to server"
    
    # Find bench directory
    if [ -d "$HOME/bench" ]; then
        BENCH_DIR="$HOME/bench"
    elif [ -d "/opt/frappe-bench" ]; then
        BENCH_DIR="/opt/frappe-bench"
    elif [ -d "/home/frappe/bench" ]; then
        BENCH_DIR="/home/frappe/bench"
    else
        echo "❌ Could not find Bench directory"
        echo "Checking available directories..."
        ls -d ~ /opt /home 2>/dev/null | xargs -I {} find {} -maxdepth 3 -name "bench" -type d 2>/dev/null || true
        exit 1
    fi
    
    echo "Found Bench at: $BENCH_DIR"
    cd "$BENCH_DIR"
    
    # Update the app
    echo ""
    echo "📥 Updating helpers_website from GitHub..."
    cd apps/helpers_website
    git fetch origin main
    git checkout main
    git pull origin main
    
    # Back to bench directory
    cd ../..
    
    # Run migrations
    echo ""
    echo "🔄 Running migrations..."
    bench migrate
    
    # Clear cache
    echo ""
    echo "🧹 Clearing cache..."
    bench clear-cache
    
    echo ""
    echo "✅ Deployment completed successfully!"
    
DEPLOY_SCRIPT

echo ""
echo "✨ Monitor the website at: https://helpers.ie"
echo "If you see the resources graph, deployment was successful! 🎉"
