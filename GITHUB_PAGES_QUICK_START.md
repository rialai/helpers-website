# GitHub Pages Migration - Quick Reference

## Cost Achievement ✅
- **Previous**: €60+/month on GCP  
- **New**: €0/month on GitHub Pages  
- **Savings**: €720+/year

## What Changed

### Old Architecture (GCP)
```
GCP Compute Engine VM → Running Frappe + Database → Website served directly
```
**Cost**: Full VM, storage, network, compute

### New Architecture (GitHub Pages)
```
Frappe Database (local) → Export to JSON → GitHub Repository → GitHub Pages CDN
```
**Cost**: €0 (GitHub Pages) + domain hosting

## Files Added/Changed

### New Files
- `docs/` - GitHub Pages directory (entire folder)
- `export_for_github_pages.py` - Script to export Frappe data to JSON
- `.github/workflows/update-pages.yml` - Automated daily updates
- `GITHUB_PAGES_SETUP.md` - Detailed setup guide
- `CNAME` - Custom domain configuration

## Quick Start (5 minutes)

### 1. Enable GitHub Pages
```
Settings → Pages → /docs branch → Save
```

### 2. Set Custom Domain
```
Settings → Pages → Custom domain: helpers.ie → Save
```

### 3. Update DNS (at your registrar)
```
A Records → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
AAAA Records → 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153, 2606:50c0:8003::153
```

### 4. Export Data
```bash
python3 export_for_github_pages.py
```

### 5. Commit & Push
```bash
git add docs/ CNAME .github/ export_for_github_pages.py
git commit -m "feat: GitHub Pages hosting"
git push origin main
```

### 6. Wait 2 minutes
GitHub builds and deploys automatically.

## Key Differences from Old Setup

| Aspect | Old (GCP) | New (GitHub Pages) |
|--------|-----------|------------------|
| **Hosting** | VM constantly running | Static files only |
| **Database** | Live query per request | Pre-exported JSON |
| **Data Updates** | Real-time (via Frappe API) | Periodic exports |
| **Uptime** | Depends on VM | 99.9% GitHub guarantee |
| **SSH Access** | Yes (35.205.7.180) | No (managed service) |
| **Custom Code** | Full Python/JavaScript | Static HTML/JS only |

## Removed Old Infrastructure

Old deployment scripts are obsolete:
- `deploy.sh` → No longer needed
- `deploy-python.py` → No longer needed  
- `deploy-via-gcloud.sh` → No longer needed
- GCP project billing → Disabled ✅

## Testing

```bash
# Test locally
cd docs
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Monitoring

1. **Site Status**: https://github.com/username/helpers-website/settings/pages
2. **Failed Deployments**: https://github.com/username/helpers-website/deployments
3. **Data Updates**: Check `docs/data/graph.json` commit history

## Important Notes

1. **Data is Exported**: Changes in Frappe don't appear live - need to:
   - Run `export_for_github_pages.py` or
   - Wait for nightly GitHub Actions run (if enabled)

2. **No API Calls**: Frontend loads static JSON only
   - Faster page loads
   - Works offline (if pages cached)
   - No Frappe server needed to view site

3. **Custom Domain**: Must configure at DNS registrar
   - GitHub can't change your domain records
   - You maintain control of DNS

4. **HTTPS**: Automatically provisioned by GitHub (free)
   - Takes 5-10 minutes after enabling
   - Then automatic renewal

## Next Steps

1. ✅ Read `GITHUB_PAGES_SETUP.md` for detailed instructions
2. ✅ Follow Quick Start above (5 minutes)
3. ✅ Test at https://helpers.ie after DNS propagates
4. ✅ (Optional) Enable GitHub Actions secrets for auto-updates
5. ✅ Archive old deployment scripts (or keep for reference)

## Support

See `GITHUB_PAGES_SETUP.md` Troubleshooting section for:
- DNS issues
- Certificate problems
- Data export failures
- Graph visualization issues

---

**All configured. Ready to deploy!** 🚀
