#!/bin/bash

# Automated deployment with password authentication
# This script uses expect to auto-enter the password

GCLOUD_PASSWORD="ryhqYs-cuwmu1-demhyr"
PROJECT="debraker-bot"
INSTANCE="wordpress-gcp"
ZONE="europe-west3-b"

echo "🚀 DEPLOYING helpers_website"
echo "═════════════════════════════════════════════════════════════"
echo ""

# Check if expect is available
if ! command -v expect &> /dev/null; then
    echo "Installing expect..."
    brew install expect 2>/dev/null || apt-get install -y expect 2>/dev/null
fi

# Create expect script for authentication
cat > /tmp/deploy-expect.sh << 'EXPECT_EOF'
#!/usr/bin/expect

set password "ryhqYs-cuwmu1-demhyr"
set project "debraker-bot"
set instance "wordpress-gcp"
set zone "europe-west3-b"

# Run gcloud ssh command
spawn gcloud compute ssh $instance --project=$project --zone=$zone

# Wait for password prompt and send it
expect {
    "Enter your password:" {
        send "$password\r"
        interact
    }
    "Connected" {
        interact
    }
    timeout {
        puts "Connection timeout"
        exit 1
    }
}

EXPECT_EOF

chmod +x /tmp/deploy-expect.sh

echo "Attempting connection with authentication..."
echo ""

# Try with expect
expect << 'EXPECT_DEPLOY'
#!/usr/bin/expect

set password "ryhqYs-cuwmu1-demhyr"
set project "debraker-bot"
set instance "wordpress-gcp"
set zone "europe-west3-b"
set timeout 60

spawn gcloud compute ssh $instance --project=$project --zone=$zone

expect {
    "password:" {
        send "$password\r"
        expect "# " { }
    }
    "$ " { }
    "# " { }
}

# Now execute deployment commands
send "cd ~/bench/apps/helpers_website\r"
expect "$ "

send "git fetch origin main\r"
expect "$ "

send "git checkout main\r"
expect "$ "

send "git pull origin main\r"
expect "$ "

send "cd ../..\r"
expect "$ "

send "bench migrate --quiet\r"
expect "$ "

send "bench clear-cache\r"
expect "$ "

send "echo '✅ DEPLOYMENT COMPLETE'\r"
expect "$ "

send "exit\r"

EXPECT_DEPLOY

echo ""
echo "═════════════════════════════════════════════════════════════"
echo "✅ Done!"
echo ""
echo "Visit: https://helpers.ie"
echo ""
echo "⚠️  IMPORTANT: Change your Google Cloud password immediately!"
echo "═════════════════════════════════════════════════════════════"

