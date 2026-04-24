# Hyper Scroll Port (Vite + React + TypeScript)

Near-1:1 local port of the reference brutal-mode scroll demo.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages deployment

The Vite base path defaults to `/` for custom-domain deployment (helpers.ie).

- Default build (custom domain): `npm run build`
- Override base path for project-page deployment when needed: `VITE_BASE_PATH=/helpers.ie/ npm run build`

Deployment is automated via GitHub Actions in `.github/workflows/deploy.yml`.
