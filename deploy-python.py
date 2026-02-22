#!/usr/bin/env python3

import subprocess
import sys
import time
import os

# Configuration
PASSWORD = "ryhqYs-cuwmu1-demhyr"
PROJECT = "debraker-bot"
INSTANCE = "wordpress-gcp"
ZONE = "europe-west3-b"

print("🚀 DEPLOYING helpers_website")
print("=" * 70)
print()

# Deploy commands to execute on the server
deploy_commands = [
    "cd ~/bench/apps/helpers_website",
    "git fetch origin main",
    "git checkout main",
    "git pull origin main",
    "cd ../..",
    "bench migrate --quiet",
    "bench clear-cache",
    "echo '✅ DEPLOYMENT COMPLETE'",
]

# Build the complete command
command_string = " && ".join(deploy_commands)

# SSH command
ssh_cmd = [
    "gcloud", "compute", "ssh",
    INSTANCE,
    f"--project={PROJECT}",
    f"--zone={ZONE}",
    "--",
    command_string
]

print("Attempting deployment...")
print()

try:
    # Set password in environment and execute
    env = dict(os.environ)
    
    # Run the SSH command
    process = subprocess.Popen(
        ssh_cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Send password if prompt appears
    stdout, stderr = process.communicate(input=PASSWORD + "\n", timeout=300)
    
    print("Output:")
    print(stdout)
    
    if stderr:
        print("Errors/Info:")
        print(stderr)
    
    if process.returncode == 0:
        print()
        print("=" * 70)
        print("✅ DEPLOYMENT SUCCESSFUL!")
        print("=" * 70)
        print()
        print("Visit: https://helpers.ie")
        print()
        print("You should see the new resources graph visualization!")
    else:
        print(f"Exit code: {process.returncode}")

except subprocess.TimeoutExpired:
    print("❌ Timeout - deployment took too long")
    process.kill()
except KeyboardInterrupt:
    print("\n❌ Interrupted by user")
    process.kill()
except Exception as e:
    print(f"❌ Error: {e}")

print()
print("⚠️  IMPORTANT: Change your Google Cloud password immediately!")
print("    You should never share passwords in scripts or terminals!")
