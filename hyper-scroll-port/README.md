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

The Vite base path defaults to `/helpers.ie/` for project-page deployment.

- Default build (project page): `npm run build`
- Override base path when needed: `VITE_BASE_PATH=/ npm run build`

Deployment is automated via GitHub Actions in `.github/workflows/deploy.yml`.
