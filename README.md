# Tesla USB Loader

[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?logo=cloudflare)](https://teslausbloader.pages.dev)
[![Sounds](https://img.shields.io/badge/Sounds-215+-blue)](#)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

A web app for browsing, previewing, and downloading custom USB files for your Tesla — lock chimes, ASS completion sounds, and more. Choose from 200+ sounds including movies, video games, cartoons, and community additions.

> **Sound catalog:** 200+ sounds from [Not a Tesla App](https://www.notateslaapp.com/tesla-custom-lock-sounds/) plus community additions in [`soundscustom/`](./soundscustom/) — unofficial browser for their curated library.

**Live Site:** [teslausbloader.pages.dev](https://teslausbloader.pages.dev)

![Tesla USB Loader screenshot](./screenshot01.jpg)

---

## Features

- **200+ Sounds** - Movies, games, cartoons, TV shows, retro sounds
- **Instant Preview** - Click to play any sound
- **Quick Picks** - Random suggestions with shuffle
- **Most Popular** - See what the community loves
- **Favorites** - Save sounds you like
- **Search & Filter** - Find sounds by name or category
- **Worldwide Stats** - Track plays, downloads, favorites
- **Offline Support** - Cache sounds for offline access
- **Auto-Updated** - New sounds synced automatically
- **Custom Sounds** - Add your own WAVs via the `soundscustom/` folder (see [soundscustom/soundscustom.md](./soundscustom/soundscustom.md))
- **ASS Completion Sound** - Download the same library as `ASSChime.wav` for Actually Smart Summon
- **Custom Wraps** - Browse and download PNG vehicle wraps organized by model (Toybox → Paint Shop → Wraps)

---

## Quick Start for Tesla Owners

1. **Browse** the sounds at [teslausbloader.pages.dev](https://teslausbloader.pages.dev)
2. **Preview** sounds by clicking the play button
3. **Select** a sound (checkmark), then **download** as:
   - `LockChime.wav` — custom lock chime
   - `ASSChime.wav` — Actually Smart Summon completion sound
4. **Copy** the file(s) to the **root** of your USB drive (both can live on the same drive)
5. **Plug** the USB into your Tesla's glovebox port
6. **Activate** in the car:
   - **Lock:** Toybox → Boombox → Lock Sound → USB
   - **ASS:** Controls → Autopilot → ASS → Customize Summon → Completion Sound → USB

### Wraps

1. Open the **Wraps** tab and filter by your model
2. Download PNG wrap(s) to your phone or computer
3. Create a **`Wraps/`** folder (capital W) at the USB root and copy PNGs there
4. Plug into the centre console USB port → **Toybox → Paint Shop → Wraps**

Works on mobile (e.g. iPhone) — browse and download from the site, then copy to your Tesla USB stick.

> **Requirements:** Tesla with Pedestrian Warning System (2019+ models), FAT32 or exFAT USB drive. Each WAV must be under 1 MB and named exactly `LockChime.wav` or `ASSChime.wav`. Wraps must be PNG, under 1 MB.

See [notes.md](./notes.md) for maintainer notes and verified workflows.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Hosting | Cloudflare Pages |
| API | Cloudflare Workers |
| Database | Cloudflare KV |
| CI/CD | GitHub Actions |

---

## Development

```bash
# Clone the repo
git clone https://github.com/rvwrh29585-eng/teslausbloader.git
cd teslausbloader

# Install and run
cd web
npm install
npm run dev
```

See [ABOUT.md](./ABOUT.md) for complete documentation including:
- Full developer setup guide
- Project architecture
- API documentation
- AI agent game plan for rebuilding from scratch

---

## Project Structure

```
├── .github/workflows/     # Automated sound sync
├── functions/api/         # Cloudflare Workers (API)
├── scripts/               # Sync + generate-custom-sounds.js + generate-wraps-manifest.js (build-time lists)
├── sounds/                # WAV files synced from Not a Tesla App
├── soundscustom/         # Your own WAVs + soundscustom.md (naming guide)
├── wraps/                 # PNG vehicle wraps by model + wraps.md (naming guide)
├── web/                   # React frontend (public: logo, custom-sounds.json, wraps-manifest.json)
├── locksound-logo.jpg     # Logo (also in web/public for favicon and UI)
├── script.sh              # Original CLI version (deprecated, see below)
├── ABOUT.md               # Complete documentation
├── notes.md               # Maintainer notes, verified workflows, publishing checklist
└── README.md              # This file
```

### About `script.sh`

The project started as a Bash CLI tool using `gum` for TUI before being rewritten as a web app. The original `script.sh` is preserved for reference but is no longer maintained. It demonstrates:
- Scraping with `htmlq`
- TUI menus with `gum`
- Audio preview with `afplay`
- USB detection with `diskutil`

See [ABOUT.md](./ABOUT.md) for the full evolution story.

---

## How This Was Built

This entire project was built collaboratively with an AI assistant (Claude). The process included:

1. Started with a Bash script for scraping sounds
2. Evolved into a full web app with React + Cloudflare
3. Added features iteratively based on user feedback
4. Documented everything for reproducibility

See the [AI Agent Game Plan](./ABOUT.md#ai-agent-game-plan) in ABOUT.md for step-by-step instructions to rebuild this project from scratch.

---

## Contributing

Contributions welcome! Feel free to:
- Report bugs or request features via Issues
- Submit PRs for improvements
- Suggest new sounds to add
- Add your own sounds via the [soundscustom/](./soundscustom/) folder (naming guide in [soundscustom.md](./soundscustom/soundscustom.md))
- Add your own wraps via the [wraps/](./wraps/) folder (naming guide in [wraps/wraps.md](./wraps/wraps.md))

---

## Sound Source & Credits

> **200+ sounds from [Not a Tesla App](https://www.notateslaapp.com/tesla-custom-lock-sounds/)**, plus community additions in [`soundscustom/`](./soundscustom/).
> 
> This project is an unofficial browser/loader for their excellent curated collection. All credit for collecting, optimizing, and maintaining the main sound library goes to the [Not a Tesla App](https://www.notateslaapp.com) team.

### Additional Credits

- Built with [Claude](https://claude.ai) AI assistance
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com)

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

<p align="center">
  <strong>⚡ Made for Tesla owners who want a personal touch ⚡</strong>
</p>
