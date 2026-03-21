# GitHub Pages Migration Checklist

## Pre-Deployment ✅ COMPLETE

- [x] Created GitHub Pages directory structure (`docs/`)
- [x] Created standalone HTML page (`docs/index.html`)
- [x] Created adapted JavaScript for static JSON (`docs/assets/resources-graph.js`)
- [x] Created placeholder data file (`docs/data/graph.json`)
- [x] Created CNAME file for custom domain
- [x] Created data export script (`export_for_github_pages.py`)
- [x] Created GitHub Actions workflow (`.github/workflows/update-pages.yml`)
- [x] Created setup documentation (`GITHUB_PAGES_SETUP.md`)
- [x] Created quick reference guide (`GITHUB_PAGES_QUICK_START.md`)

## Phase 1: Repository Setup (DO THESE)

- [ ] Ensure Python 3.8+ is installed locally
- [ ] Run `python3 export_for_github_pages.py` to generate real data with your Frappe instance
- [ ] Verify `docs/data/graph.json` has been updated with correct node/link counts
- [ ] Test locally: `cd docs && python3 -m http.server 8000` then visit http://localhost:8000
- [ ] Verify graph visualization loads and displays data correctly
- [ ] Commit all new files: `git add docs/ .github/ export_for_github_pages.py GITHUB_PAGES_*.md CNAME`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify push was successful on GitHub website

## Phase 2: GitHub Settings (5 minutes)

### Enable Pages

- [ ] Go to GitHub repository → Settings → Pages
- [ ] Source: Select "Deploy from a branch"
- [ ] Branch: Select `main`
- [ ] Folder: Select `/docs`
- [ ] Click Save
- [ ] Wait 1-2 minutes for initial build
- [ ] Verify `github_pages_build_deployment` workflow completes successfully

### Configure Custom Domain

- [ ] Go to GitHub repository → Settings → Pages
- [ ] Enter custom domain: `helpers.ie`
- [ ] Click Save
- [ ] Wait for GitHub to verify domain (should be fast if DNS is correct)
- [ ] Check "Enforce HTTPS" to enable SSL certificate
- [ ] Note: DNS must be configured first (see next section)

## Phase 3: DNS Configuration (Depends on Registrar)

### For Apex Domain (helpers.ie)

Go to your domain registrar's DNS settings and create:

- [ ] **A Record** Type: `A` | Name: `@` | Value: `185.199.108.153`
- [ ] **A Record** Type: `A` | Name: `@` | Value: `185.199.109.153`
- [ ] **A Record** Type: `A` | Name: `@` | Value: `185.199.110.153`
- [ ] **A Record** Type: `A` | Name: `@` | Value: `185.199.111.153`
- [ ] **AAAA Record** Type: `AAAA` | Name: `@` | Value: `2606:50c0:8000::153`
- [ ] **AAAA Record** Type: `AAAA` | Name: `@` | Value: `2606:50c0:8001::153`
- [ ] **AAAA Record** Type: `AAAA` | Name: `@` | Value: `2606:50c0:8002::153`
- [ ] **AAAA Record** Type: `AAAA` | Name: `@` | Value: `2606:50c0:8003::153`

### Alternative: www subdomain

If using `www.helpers.ie` instead:

- [ ] **CNAME Record** Type: `CNAME` | Name: `www` | Value: `YOUR-USERNAME.github.io`

### Verify DNS Propagation

```bash
# Run in terminal (wait if shows old values)
nslookup helpers.ie
# Should eventually show: 185.199.108.153 (or similar GitHub IP)

# Or check DNS globally
dig helpers.ie
```

**Timeline**: 15 minutes to 48 hours (typically < 1 hour)

## Phase 4: Site Access & Verification (Do After DNS Propagation)

After DNS changes have propagated (~1 hour, check with `nslookup`):

- [ ] Visit https://helpers.ie in browser
- [ ] Verify page loads without "This site can't be reached" error
- [ ] Verify HTTPS works (lock icon in address bar)
- [ ] Verify graph visualization displays with data
- [ ] Open browser DevTools (F12) and check Console tab for errors
- [ ] Verify resource count display shows correct number
- [ ] Test responsiveness (resize browser window)
- [ ] Test on mobile device

## Phase 5: GitHub Actions Setup (Optional for Auto-Updates)

To enable automatic daily data updates:

- [ ] Create Frappe API token (if not already done)
  - [ ] Log into Frappe as administrator
  - [ ] Go to user profile
  - [ ] Generate new API token
  - [ ] Copy the token (you'll need it next)

- [ ] Add GitHub Secrets
  - [ ] Go to GitHub repository → Settings → Secrets and variables → Actions
  - [ ] Click "New repository secret"
  - [ ] Name: `FRAPPE_URL` | Value: `https://your-frappe-instance.com` | Click Add
  - [ ] Name: `FRAPPE_TOKEN` | Value: `your-api-token-here` | Click Add

- [ ] Verify workflow runs
  - [ ] Go to Actions tab
  - [ ] Look for "Update GitHub Pages Data" workflow
  - [ ] Can manually trigger via "Run workflow" button
  - [ ] Check that workflow completes without errors
  - [ ] Verify `docs/data/graph.json` was updated (git history)

- [ ] Set workflow schedule (if desired)
  - [ ] Workflow already set to run daily at midnight UTC
  - [ ] Can manually trigger any time from Actions tab
  - [ ] Edit `.github/workflows/update-pages.yml` to change schedule

## Phase 6: Documentation & Cleanup

- [ ] Read through `GITHUB_PAGES_SETUP.md` for reference
- [ ] Save `GITHUB_PAGES_QUICK_START.md` for future reference
- [ ] Update team/project README if applicable
- [ ] Archive old deployment scripts (or keep for reference):
  - [ ] `deploy.sh` → Document why no longer used
  - [ ] `deploy-python.py` → Document why no longer used
  - [ ] `deploy-via-gcloud.sh` → Document why no longer used
  - [ ] Other deploy-*.sh files → Document as deprecated
- [ ] Update project documentation to mention GitHub Pages hosting
- [ ] Consider adding link to this setup guide in repository README

## Phase 7: Ongoing Maintenance

### Daily/Weekly

- [ ] Monitor site status via GitHub Pages settings
- [ ] Verify graph data updates if using GitHub Actions
- [ ] Check GitHub Actions for any failed runs

### Monthly

- [ ] Verify HTTPS certificate status (auto-renewed by GitHub)
- [ ] Check GitHub Pages deployment history for any issues
- [ ] Monitor repository storage (currently < 1 MB data)

### When Updating Data

- [ ] Run `python3 export_for_github_pages.py` after major Frappe changes
- [ ] Or let GitHub Actions handle automatic updates
- [ ] Optionally review `docs/data/graph.json` for data accuracy

## Verification Results

After completing all steps:

- [ ] Site accessible at https://helpers.ie
- [ ] HTTPS certificate valid (green lock)
- [ ] Graph visualization displays with live data
- [ ] No console errors in browser DevTools
- [ ] All nodes and links render correctly
- [ ] Page loads within 2 seconds
- [ ] Mobile view works properly
- [ ] Resource count display shows correct number

## Rollback Plan (If Needed)

If something goes wrong:

1. GitHub Pages auto-fails gracefully (shows 404, not errors)
2. To revert:
   - [ ] Go to GitHub Pages settings
   - [ ] Change source back to `None` to disable
   - [ ] Or change branch to a different working branch
   - [ ] Site will automatically remove from helpers.ie
3. During DNS propagation issues:
   - [ ] Change DNS records back to previous values
   - [ ] GitHub Pages will stop serving, previous host takes over
   - [ ] Changes propagate within 24 hours

## Success Criteria ✅

All complete when:

- [x] GitHub Pages enabled and building successfully
- [x] Custom domain configured at registrar
- [x] Site accessible at https://helpers.ie
- [x] Graph loads with real data from Frappe
- [x] No errors in browser console
- [x] HTTPS certificate properly configured
- [x] (Optional) GitHub Actions daily updates working

---

## Files Modified/Created

| File | Purpose | Status |
|------|---------|--------|
| `docs/index.html` | Main GitHub Pages HTML | ✅ Created |
| `docs/assets/resources-graph.js` | Static JSON graph visualization | ✅ Created |
| `docs/data/graph.json` | Exported Frappe data | ✅ Created |
| `CNAME` | Domain configuration | ✅ Created |
| `export_for_github_pages.py` | Data export script | ✅ Created |
| `.github/workflows/update-pages.yml` | Automated daily updates | ✅ Created |
| `GITHUB_PAGES_SETUP.md` | Detailed setup guide | ✅ Created |
| `GITHUB_PAGES_QUICK_START.md` | Quick reference | ✅ Created |
| `GITHUB_PAGES_MIGRATION_CHECKLIST.md` | This file | ✅ Created |

---

**Start with Phase 1, then follow sequentially.** Ask for help if any step fails!
