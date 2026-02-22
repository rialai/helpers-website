#!/bin/bash

echo "🔍 GOOGLE CLOUD SERVER DISCOVERY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check gcloud installation
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✓ gcloud CLI found"
echo ""

# Step 2: Check authentication
echo "📋 Current authentication status:"
CURRENT_ACCOUNT=$(gcloud config get-value account 2>/dev/null || echo "none")
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null || echo "none")

echo "   Current account: $CURRENT_ACCOUNT"
echo "   Current project: $CURRENT_PROJECT"
echo ""

# Step 3: List all available accounts
echo "📌 Available Google Cloud Accounts:"
ACCOUNTS=$(gcloud auth list --format="value(account)" 2>/dev/null)
if [ -z "$ACCOUNTS" ]; then
    echo "   ⚠️  No accounts configured. Need to login."
    echo ""
    echo "   Run this to login:"
    echo "   $ gcloud auth login"
    exit 1
fi

ACCOUNT_ARRAY=($ACCOUNTS)
for i in "${!ACCOUNT_ARRAY[@]}"; do
    echo "   $((i+1)). ${ACCOUNT_ARRAY[$i]}"
done
echo ""

# Step 4: For each account, list all projects
echo "🏢 Scanning all projects across accounts..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HELPERS_FOUND=0
declare -a CANDIDATES

for ACCOUNT in $ACCOUNTS; do
    echo "🔐 Switching to account: $ACCOUNT"
    gcloud config set account "$ACCOUNT" --quiet 2>/dev/null
    
    # List projects for this account
    PROJECTS=$(gcloud projects list --format="value(projectId)" 2>/dev/null)
    
    if [ -z "$PROJECTS" ]; then
        echo "   ⚠️  No projects found in this account"
        continue
    fi
    
    for PROJECT in $PROJECTS; do
        echo ""
        echo "   📍 Project: $PROJECT"
        
        # List compute instances in this project
        INSTANCES=$(gcloud compute instances list --project="$PROJECT" --format="value(NAME,ZONE,EXTERNAL_IP)" 2>/dev/null)
        
        if [ -z "$INSTANCES" ]; then
            echo "      (no compute instances)"
            continue
        fi
        
        # Parse and display instances
        while IFS=$'\t' read -r NAME ZONE IP; do
            echo "      • $NAME (Zone: $ZONE, IP: $IP)"
            
            # Check if this instance might host helpers.ie
            if [[ "$NAME" == *"web"* ]] || [[ "$NAME" == *"frappe"* ]] || [[ "$NAME" == *"helpers"* ]]; then
                CANDIDATES+=("$PROJECT|$NAME|$ZONE|$IP|$ACCOUNT")
                echo "        ✓ Possible match!"
            fi
        done <<< "$INSTANCES"
    done
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ${#CANDIDATES[@]} -eq 0 ]; then
    echo "❌ No suitable instances found"
    echo ""
    echo "Try these steps:"
    echo "1. Run: gcloud auth login"
    echo "2. Run this script again"
    exit 1
fi

echo "✓ Found ${#CANDIDATES[@]} potential candidates:"
echo ""

for i in "${!CANDIDATES[@]}"; do
    IFS='|' read -r PROJECT NAME ZONE IP ACCOUNT <<< "${CANDIDATES[$i]}"
    echo "   Option $((i+1)):"
    echo "      Account:  $ACCOUNT"
    echo "      Project:  $PROJECT"
    echo "      Instance: $NAME"
    echo "      Zone:     $ZONE"
    echo "      IP:       $IP"
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💾 Saving findings to: /tmp/gcp-instances.txt"
echo ""

cat > /tmp/gcp-instances.txt << 'EOF'
🔍 GOOGLE CLOUD INSTANCES FOUND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EOF

for i in "${!CANDIDATES[@]}"; do
    IFS='|' read -r PROJECT NAME ZONE IP ACCOUNT <<< "${CANDIDATES[$i]}"
    cat >> /tmp/gcp-instances.txt << EOF

Option $((i+1)):
─────────────
Account:  $ACCOUNT
Project:  $PROJECT
Instance: $NAME
Zone:     $ZONE
IP:       $IP

To deploy to this instance, run:
gcloud compute ssh $NAME --project=$PROJECT --zone=$ZONE -- \\
  "cd ~/bench/apps/helpers_website && git pull origin main && cd .. && cd .. && bench migrate && bench clear-cache"

EOF
done

cat /tmp/gcp-instances.txt

# Step 5: Ask which one to use
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "❓ Which instance is helpers.ie? (1-${#CANDIDATES[@]}):"
read -r CHOICE

if [[ ! "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt ${#CANDIDATES[@]} ]; then
    echo "❌ Invalid choice"
    exit 1
fi

IDX=$((CHOICE-1))
IFS='|' read -r PROJECT NAME ZONE IP ACCOUNT <<< "${CANDIDATES[$IDX]}"

echo ""
echo "✓ Selected: $NAME in project $PROJECT"
echo ""
echo "🚀 Deploying helpers_website..."
echo ""

# Switch to the correct account and project
gcloud config set account "$ACCOUNT" --quiet
gcloud config set project "$PROJECT" --quiet

# Execute deployment
gcloud compute ssh "$NAME" --project="$PROJECT" --zone="$ZONE" -- << 'DEPLOY_SCRIPT'
    echo "🔗 Connected to server"
    
    # Try to find bench directory
    if [ -d "$HOME/bench" ]; then
        BENCH_DIR="$HOME/bench"
    elif [ -d "/opt/frappe-bench" ]; then
        BENCH_DIR="/opt/frappe-bench"
    elif [ -d "/home/frappe/bench" ]; then
        BENCH_DIR="/home/frappe/bench"
    else
        echo "❌ Could not find Bench directory"
        echo "Searching for bench..."
        find ~ -maxdepth 3 -name "bench" -type d 2>/dev/null | head -1 | read BENCH_DIR
        if [ -z "$BENCH_DIR" ]; then
            echo "❌ No bench found"
            exit 1
        fi
    fi
    
    echo "📁 Bench found at: $BENCH_DIR"
    
    cd "$BENCH_DIR"
    
    echo ""
    echo "📥 Pulling latest code from GitHub..."
    cd apps/helpers_website
    git fetch origin main
    git checkout main
    git pull origin main
    
    echo "✓ Code updated"
    
    # Go back to bench
    cd ../..
    
    echo ""
    echo "🔄 Running migrations..."
    bench migrate --quiet
    
    echo "✓ Migrations completed"
    
    echo ""
    echo "🧹 Clearing cache..."
    bench clear-cache
    
    echo "✓ Cache cleared"
    
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "Visit: https://helpers.ie"
    echo "You should see the new resources graph visualization!"
    
DEPLOY_SCRIPT

echo ""
echo "✨ Done! Check https://helpers.ie"
