# GitHub Pages Setup Guide

This guide explains how to set up and use GitHub Pages as a free hosting solution for the helpers.ie website.

## Architecture Overview

Instead of running a costly GCP instance, the website now uses:

- **Static Hosting**: GitHub Pages (FREE, €0/month)
- **Domain**: helpers.ie (your existing domain)
- **Data Format**: Static JSON files (automatically updated from Frappe)
- **Frontend**: HTML/Canvas visualization (no server-side rendering needed)

**Cost Reduction**: €60+/month → €0/month ✅

## What's New

### Folder Structure

```
helpers-website/
├── docs/                          # GitHub Pages root directory
│   ├── index.html                 # Main page
│   ├── CNAME                      # Custom domain configuration
│   ├── assets/
│   │   └── resources-graph.js     # Modified for static JSON
│   └── data/
│       └── graph.json             # Auto-generated from Frappe
├── export_for_github_pages.py     # Data export script
├── .github/workflows/
│   └── update-pages.yml           # GitHub Actions automation
└── CNAME                          # Repository root copy
```

## Setup Steps

### Step 1: Enable GitHub Pages in Repository Settings

1. Go to GitHub repository → **Settings**
2. Navigate to **Pages** (left sidebar)
3. Under "Source", select:
   - **Deploy from a branch**
   - **Branch**: `main`
   - **Folder**: `/docs`
4. Click **Save**

Wait for GitHub to build and deploy (usually 1-2 minutes).

### Step 2: Configure Custom Domain

#### Via GitHub Settings (Recommended)

1. In **Settings → Pages**, enter your custom domain: `helpers.ie`
2. GitHub will create/update the CNAME file automatically
3. Check **Enforce HTTPS** (auto-provisioned SSL certificate)
4. Save

#### Manual CNAME Configuration

The repository already includes:
- `/CNAME` - Repository root (for GitHub Pages)
- `/docs/CNAME` placeholder - Keep minimal

### Step 3: Update DNS Records

Update your domain registrar settings to point to GitHub Pages.

#### Option A: Using CNAME (Recommended for subdomains)

If using `helpers.ie` as the apex domain, you need to use an ALIAS/ANAME record (GitHub recommends):

**Add DNS Records:**

| Type  | Name           | Value                      |
|-------|----------------|---------------------------|
| A     | @              | 185.199.108.153            |
| A     | @              | 185.199.109.153            |
| A     | @              | 185.199.110.153            |
| A     | @              | 185.199.111.153            |
| AAAA  | @              | 2606:50c0:8000::153        |
| AAAA  | @              | 2606:50c0:8001::153        |
| AAAA  | @              | 2606:50c0:8002::153        |
| AAAA  | @              | 2606:50c0:8003::153        |

Or use ALIAS/ANAME if your registrar supports it:

| Type  | Name | Value                            |
|-------|------|----------------------------------|
| ALIAS | @    | `username.github.io`             |

#### Option B: Using www subdomain

If you prefer `www.helpers.ie`:

| Type  | Name | Value                            |
|-------|------|----------------------------------|
| CNAME | www  | `username.github.io`             |

**DNS Propagation**: Changes can take 15 minutes to 48 hours.

### Step 4: Generate Initial Data

#### From Local Frappe Bench

```bash
# Navigate to your Frappe bench directory
cd ~/frappe-bench

# Run the export script
python3 ../helpers-website/export_for_github_pages.py
```

#### Or manually from repo

```bash
cd ~/helpers-website
python3 export_for_github_pages.py
```

**Output**: Creates `docs/data/graph.json` with your Frappe data

### Step 5: Commit and Push

```bash
cd ~/helpers-website

# Add new files
git add docs/ CNAME .github/workflows/ export_for_github_pages.py

# Commit
git commit -m "feat: add GitHub Pages hosting configuration"

# Push to main branch
git push origin main
```

GitHub Actions will automatically:
1. Build and deploy to GitHub Pages
2. Make site live at `https://helpers.ie`

## Automatic Data Updates (Optional)

### GitHub Actions Workflow

The included `.github/workflows/update-pages.yml` can automatically:
- Query your Frappe instance daily
- Export updated graph data
- Commit changes to repository
- Redeploy updated site

**To enable:**

1. Store Frappe credentials as GitHub Secrets:
   - Go to **Settings → Secrets and variables → Actions**
   - Add `FRAPPE_URL`: Your Frappe instance URL (e.g., `https://erp.example.com`)
   - Add `FRAPPE_TOKEN`: API token for guest read access
   
2. Workflow runs automatically at midnight UTC (or manually via "Actions" tab)

**Note**: Requires Frappe to be accessible from GitHub's servers

### Manual Updates

Or run manually whenever you have new data:

```bash
cd ~/helpers-website
python3 export_for_github_pages.py
git add docs/data/graph.json
git commit -m "chore: update graph data"
git push origin main
```

## Testing Locally

```bash
cd ~/helpers-website/docs
# macOS
open -a "Google Chrome" index.html

# Linux
xdg-open index.html

# Or run a simple server
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Verification Checklist

- [ ] GitHub Pages enabled in Settings → Pages
- [ ] Custom domain set to `helpers.ie`
- [ ] CNAME file exists in `/docs` directory
- [ ] DNS records pointing to GitHub Pages
- [ ] `docs/data/graph.json` has real data (not just demo)
- [ ] HTTPS is enforced
- [ ] Graph visualization loads and displays data
- [ ] No errors in browser console (F12 → Console tab)

## Troubleshooting

### Site shows "404 Not Found"

**Issue**: GitHub Pages not built yet or wrong branch selected
**Fix**:
1. Check **Settings → Pages** → Source is set to `/docs` on `main` branch
2. Wait 2-3 minutes for build to complete
3. Check "Deployments" tab for build logs

### Custom domain not working

**Issue**: DNS records not propagated
**Fix**:
1. Run `nslookup helpers.ie` in terminal
2. Should return GitHub's IP addresses (185.199.108.* etc.)
3. If not, wait up to 48 hours and check DNS settings
4. In GitHub Settings → Pages, ensure "Enforce HTTPS" is checked

### Graph shows demo data instead of real data

**Issue**: `docs/data/graph.json` not updated
**Fix**:
1. Run `python3 export_for_github_pages.py` locally
2. Commit and push the updated JSON
3. Hard refresh browser (Cmd+Shift+R on Mac)

### Visualization not displaying

**Issue**: JavaScript errors or canvas issues
**Fix**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Verify `docs/assets/resources-graph.js` loaded (Network tab)
4. Try different browser (Chrome/Firefox/Safari)

## Maintenance

### Update Data Regularly

**Option 1**: GitHub Actions (automatic, requires setup)
**Option 2**: Manual export and commit when data changes
**Option 3**: Run `export_for_github_pages.py` on a schedule locally (cron job)

### Monitor Site Health

1. GitHub Actions runs: **Settings → Actions**
2. Deployment history: **Settings → Pages → Deployments**
3. Site analytics available through GitHub Pages

## Costs Summary

| Service | Cost | Status |
|---------|------|--------|
| GitHub Pages Hosting | FREE | ✅ Enabled |
| Domain (helpers.ie) | ~€10/year | Your existing |
| Custom SSL Certificate | FREE | Auto-provisioned |
| Data Storage (100 employees) | < 1 MB | ✅ Negligible |
| **Monthly Total** | **€0** | **✅ ACHIEVED** |

**Previous GCP Cost**: €60+/month  
**New Cost**: €0/month  
**Savings**: €720+/year 🎉

## Support

For issues with:
- **GitHub Pages**: https://docs.github.com/en/pages
- **Custom domains**: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- **DNS**: Contact your domain registrar support

For issues with:
- **Frappe export**: Edit `export_for_github_pages.py` or run with `--debug` flag
- **Graph visualization**: Check `docs/assets/resources-graph.js` and browser console
