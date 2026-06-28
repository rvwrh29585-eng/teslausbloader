# Tesla USB Loader (frontend)

React + Vite frontend for [teslausbloader.pages.dev](https://teslausbloader.pages.dev).

## Features

- **Sounds** — Browse 200+ lock/ASS chimes; preview, favorites, download as `LockChime.wav` / `ASSChime.wav`
- **Wraps** — Browse PNG vehicle wraps by model; download for Paint Shop (`Wraps/` on USB)
- **Mobile-friendly** — Works on iPhone and other phones for browse + download

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Cloudflare Pages + Functions (`../functions/`)

## Development

```bash
npm install
npm run dev          # UI only — /api/* won't work
npm run dev:cf       # UI + Cloudflare Functions locally
npm run build        # prebuild regenerates sound/wrap manifests
npm run deploy       # manual deploy (normally push to main instead)
```

**Note:** We usually test against production after pushing to `main`. Plain `npm run dev` does not serve API routes.

## Deployment

Push to `main` on GitHub → Cloudflare Pages auto-builds.

- Build command: `cd web && npm install && npm run build`
- Output: `web/dist`
- Functions: repo root `functions/`

See [../notes.md](../notes.md) for publishing sounds/wraps and verified USB workflows.
