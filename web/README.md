# Tesla Lock Sound Loader

A web app to browse, preview, and download custom lock sounds for your Tesla.

## Features

- **Browse & Search**: Filter 200+ sounds by name or category
- **Rando-Browse**: Discover new sounds with random playback
- **Preview**: Listen before you download
- **Offline Caching**: Optionally cache all sounds locally
- **Easy Download**: Save as `LockChime.wav` ready for your Tesla

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS
- Cloudflare Pages + Workers

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run with Cloudflare Workers (for API testing)
npm run dev:cf

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## Deployment

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Workers in `/functions` auto-deploy

## How to Use the Sound on Your Tesla

1. Select a sound and download as `LockChime.wav`
2. Copy to the root of your USB drive (named `TESLADRIVE`)
3. Plug USB into Tesla glovebox USB port
4. Go to **Toybox → Boombox → Lock Sound → USB**
