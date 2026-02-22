#!/bin/bash

# GitHub Webhook Deployment Server
# Слушает на localhost и выполняет деплой когда push приходит на main

PORT=8000
DEPLOY_PATH="/Users/riabets/helpers-website"

echo "🔗 GitHub Webhook Deployment Server"
echo "═════════════════════════════════════════════════════"
echo ""
echo "Listening for GitHub webhooks on port $PORT"
echo "Deploy path: $DEPLOY_PATH"
echo ""
echo "Setup Instructions:"
echo "─────────────────────"
echo "1. Go to: https://github.com/rialai/helpers-website/settings/hooks"
echo "2. Click 'Add webhook'"
echo "3. Payload URL: https://your-domain.com:$PORT/deploy"
echo "4. Content type: application/json"
echo "5. Events: Just the push event"
echo "6. Secret: (set any secret)"
echo ""
echo "═════════════════════════════════════════════════════"
echo ""

# Simple webhook listener
python3 << 'PYTHON_EOF'
#!/usr/bin/env python3

import http.server
import socketserver
import json
import subprocess
import os
import sys
from urllib.parse import urlparse

PORT = 8000
DEPLOY_PATH = "/Users/riabets/helpers-website"
REMOTE_URL = "https://github.com/rialai/helpers-website.git"

class DeployHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        # Read request body
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        # Parse JSON
        try:
            data = json.loads(body)
        except:
            self.send_response(400)
            self.end_headers()
            return
        
        # Check if it's a push event
        if data.get('ref') == 'refs/heads/main':
            print("\n🔔 GitHub webhook received - Push to main detected!")
            print(f"   Pusher: {data.get('pusher', {}).get('name', 'unknown')}")
            print(f"   Commits: {len(data.get('commits', []))}")
            
            # Execute deployment
            self.deploy()
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status":"deployment_triggered"}')
        else:
            self.send_response(202)
            self.end_headers()
    
    def deploy(self):
        print("\n🚀 Starting deployment...")
        
        # Run deployment script
        os.chdir(DEPLOY_PATH)
        
        try:
            # Update code
            print("   📥 Pulling latest code...")
            subprocess.run(['git', 'pull', 'origin', 'main'], check=True, capture_output=True)
            
            # SSH to server and deploy
            print("   🔗 Connecting to production server...")
            ssh_cmd = '''
            cd ~/bench/apps/helpers_website && \
            git pull origin main && \
            cd ../.. && \
            bench migrate --quiet && \
            bench clear-cache
            '''
            
            # Using gcloud
            result = subprocess.run([
                'gcloud', 'compute', 'ssh',
                'wordpress-gcp',
                '--project=debraker-bot',
                '--zone=europe-west3-b',
                '--',
                ssh_cmd
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("\n✅ Deployment successful!")
            else:
                print(f"\n⚠️  Deployment had issues:")
                print(result.stderr)
        
        except Exception as e:
            print(f"\n❌ Deployment failed: {e}")

# Start server
with socketserver.TCPServer(("", PORT), DeployHandler) as httpd:
    print(f"\n✓ Webhook server running on port {PORT}")
    print("  (Press Ctrl+C to stop)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nShutting down...")

PYTHON_EOF
