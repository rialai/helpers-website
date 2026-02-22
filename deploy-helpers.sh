#!/bin/bash
# Deploy script to run directly on the server
# Usage: bash /tmp/deploy-helpers.sh

set -e

echo ""
echo "🚀 HELPERS.IE DEPLOYMENT"
echo "════════════════════════════════════════════════════════════"
echo ""

# Find bench directory
if [ -d "$HOME/bench" ]; then
    BENCH_DIR="$HOME/bench"
elif [ -d "/opt/frappe-bench" ]; then
    BENCH_DIR="/opt/frappe-bench"
elif [ -d "/srv/frappe-bench" ]; then
    BENCH_DIR="/srv/frappe-bench"
else
    BENCH_DIR=$(find ~ -maxdepth 3 -name "bench" -type d 2>/dev/null | head -1)
fi

if [ -z "$BENCH_DIR" ]; then
    echo "❌ Could not find Frappe Bench directory"
    echo ""
    echo "Manual search needed. Common locations:"
    echo "  - ~/bench"
    echo "  - /opt/frappe-bench"
    echo "  - /srv/frappe-bench"
    exit 1
fi

echo "📁 Bench directory: $BENCH_DIR"
cd "$BENCH_DIR"

echo ""
echo "📥 Updating helpers_website from GitHub..."
cd apps/helpers_website

git fetch origin main
git checkout main
git pull origin main

echo "   ✓ Code updated"

# Back to bench
cd ../..

echo ""
echo "🔄 Running database migrations..."
bench migrate --quiet

echo "   ✓ Migrations complete"

echo ""
echo "🧹 Clearing cache..."
bench clear-cache

echo "   ✓ Cache cleared"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🎉 Visit https://helpers.ie to see your changes"
echo ""
