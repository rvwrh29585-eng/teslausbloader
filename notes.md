# Project notes

Informal maintainer log for [Tesla USB Loader](https://teslausbloader.pages.dev). For user-facing docs see [README.md](./README.md) and [ABOUT.md](./ABOUT.md).

---

## Status (Late June 2026)

**Production site is working end-to-end.** Verified on iPhone at [teslausbloader.pages.dev](https://teslausbloader.pages.dev):

- **Sounds** — browse, preview, download `LockChime.wav` / `ASSChime.wav`
- **Wraps** — browse by model, preview, download PNGs
- **USB load** — downloaded files copied to a Tesla USB stick and used in-car successfully

The site continues to work great after recent updates.

Dual-end USB stick (USB-C + USB-A) works fine for loading files from a phone or computer.

### Recent changes (June 2026)
- Centralized all icon components (Play, Pause, Heart, Loading, etc.) into `web/src/lib/icons.tsx`. This removed ~440 lines of duplicated inline SVGs from across the React components.
- Updated `.gitignore` for explicit build artifact exclusion (`web/dist/`).
- Local workspace tidied (removed generated `web/dist/` and legacy ignored directories).

---

## One drive, sounds + wraps

The same Tesla USB drive can hold both:

| Content | Location on USB | In-car path |
|---------|-----------------|-------------|
| Lock chime | `LockChime.wav` at **root** | Toybox → Boombox → Lock Sound → USB |
| ASS chime | `ASSChime.wav` at **root** | Controls → Autopilot → ASS → Customize Summon → Completion Sound → USB |
| Wraps | `Wraps/*.png` at **root** (`Wraps/` folder, capital W) | Toybox → Paint Shop → Wraps |

Sounds use the **glovebox** USB port; wraps use the **centre console** USB port (Paint Shop).

---

## Current wrap catalog

| Model folder | Label | Files |
|--------------|-------|-------|
| `wraps/modely/` | Model Y (pre-2025) | MyWrap001–003.png |
| `wraps/model3/` | Model 3 (pre-2024) | MyWrap004–005.png |

Wrap design tool linked in the UI: [Jowua Wrap Studio](https://www.jowua-life.com/pages/jowua-wrap-studio).

---

## Publishing new content

### Sounds (community)

1. Add `{category}_{name}.wav` to `soundscustom/` — see [soundscustom/soundscustom.md](./soundscustom/soundscustom.md)
2. Push to `main` → Cloudflare rebuilds → appears in Sounds tab

### Wraps

1. Add PNG to `wraps/{model-id}/` — see [wraps/wraps.md](./wraps/wraps.md)
2. Convert JPG → PNG before commit (avoids “Tesla requires PNG” warning in UI):
   ```bash
   sips -s format png wraps/modely/MyWrap.jpg --out wraps/modely/MyWrap.png
   ```
3. Push to `main` — prebuild regenerates `web/public/wraps-manifest.json`

No manual manifest editing needed for either sounds or wraps.

---

## Deployment

- **Host:** Cloudflare Pages (`rvwrh29585-eng/teslausbloader`)
- **Trigger:** push to `main`
- **Build:** `cd web && npm install && npm run build` (prebuild runs manifest scripts)
- **Functions:** `functions/api/` (sounds, audio, wrap, stats)

We test in **production**, not local dev — Vite alone does not serve `/api/*`. Use `npm run dev:cf` in `web/` only if local API debugging is needed.

---

## Lessons learned

- **Wrap API routing:** Cloudflare `[[path]]` catch-all passes `params.path` as a **string array**, not a string. Use `functions/api/wrap/[model]/[file].ts` instead.
- **Cache:** `/api/sounds` uses `no-store` so new custom sounds show up without hard refresh.
- **PNG for wraps:** Store PNG in repo even though the API accepts JPG — keeps UI clean and matches Tesla requirements.
- **Shared icon library:** Centralizing repeated inline SVGs (and other icons) into a single `lib/icons.tsx` dramatically reduces duplication and makes the component code easier to maintain.

---

## Out of scope (for now)

- License plate images
- Light shows
- Wrap favorites / stats
- Per-model “Get template” links in UI (Tesla GitHub paths)
