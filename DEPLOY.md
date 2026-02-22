# Deploy to Google Cloud

Automatic deployment of helpers-website to Google Cloud using GitHub Actions.

## Prerequisites

1. **SSH Key**: The private SSH key from your local machine
2. **Deploy Host**: Server address (35.205.7.180 or hostname)
3. **Deploy User**: SSH username (nikolai)
4. **Bench Path**: Path where Frappe Bench is installed

## Setup GitHub Actions Secrets

Go to: GitHub Repo → Settings → Secrets and variables → Actions

Add these repository secrets:

### 1. `DEPLOY_HOST`
```
35.205.7.180
```

### 2. `DEPLOY_USER`
```
nikolai
```

### 3. `DEPLOY_SSH_KEY`
**Get your private SSH key:**
```bash
cat ~/.ssh/google_compute_engine
```
Paste the entire private key (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

### 4. `BENCH_PATH`
The path where Frappe Bench is installed. Find it with:
```bash
# On the server:
pwd  # if you're in the bench directory
```

Typical paths:
- `/home/nikolai/bench`
- `/home/frappe/bench`
- `/opt/frappe-bench`

## How it Works

1. Push changes to `main` branch
2. GitHub Actions automatically triggers the workflow
3. SSH connects to server
4. Updates the helpers_website app
5. Runs Frappe migrations
6. Clears cache
7. Website updates live at https://helpers.ie

## Manual Deployment

If you need to deploy manually without GitHub Actions:

```bash
# SSH into the server
ssh -i ~/.ssh/google_compute_engine nikolai@35.205.7.180

# Update the app
cd /path/to/bench
cd apps/helpers_website
git pull origin main

# Go back to bench and migrate
cd ../..
bench migrate
bench clear-cache
```

## Troubleshooting

### SSH Key Permission Denied
Make sure your SSH key exists and has correct permissions:
```bash
chmod 600 ~/.ssh/google_compute_engine
```

### Test SSH Connection
```bash
ssh -i ~/.ssh/google_compute_engine nikolai@35.205.7.180 "echo 'Connected'"
```

### Check Current Website
The latest version should be live at:
```
https://helpers.ie
```

View the resources graph visualization on the homepage - it now displays enterprise resources from the system!

## Current Status

✅ Code committed to GitHub (commit: de9105b)
✅ Resources graph visualization added
⏳ Awaiting GitHub Secrets setup
⏳ Awaiting first automatic deployment
