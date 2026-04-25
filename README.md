# helpers.ie homepage

This repository is intentionally reduced to a single source of truth for the live homepage at https://helpers.ie/.

## Source of truth

- Homepage app: `hyper-scroll-port/` (Vite + React + TypeScript)
- Deployment workflow: `.github/workflows/deploy.yml`

There are no alternative homepage implementations in this repository.

## Local development

```bash
cd hyper-scroll-port
npm ci
npm run dev
```

## Production build

```bash
cd hyper-scroll-port
npm run build
npm run preview
```

## Deployment

Deployment runs through GitHub Actions workflow `.github/workflows/deploy.yml`:

1. Installs dependencies in `hyper-scroll-port/`
2. Builds with `VITE_BASE_PATH=/`
3. Uploads `hyper-scroll-port/dist` as the Pages artifact
4. Deploys to GitHub Pages

This is the only deployment path kept in the repository.

## Safe editing rules

- Homepage source is only in `hyper-scroll-port/src/`.
- Keep layout/content/behavior unchanged unless intentionally updating the live homepage.
- Do not add parallel homepage stacks or alternative deploy workflows.
- Validate changes with:

```bash
cd hyper-scroll-port
npm ci
npm run build
```
