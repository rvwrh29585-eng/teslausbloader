# Tesla Lock Sound Loader - Complete Project Documentation

> A web app for browsing, previewing, and downloading custom lock sounds for Tesla vehicles. Built from scratch with AI assistance.

**Sound Source:** All sounds are from [Not a Tesla App](https://www.notateslaapp.com/tesla-custom-lock-sounds/) - this project is an unofficial browser for their excellent collection.

---

## Table of Contents

1. [For Users](#for-users)
2. [For Developers](#for-developers)
3. [AI Agent Game Plan](#ai-agent-game-plan)

---

## For Users

### What Is This?

Tesla Lock Sound Loader lets you customize your Tesla's lock chime with 200+ sounds from movies, video games, TV shows, and more. Browse sounds, preview them, pick your favorite, and download it ready for your Tesla.

### How It Works

1. **Browse** - Search, filter by category, or explore random picks
2. **Preview** - Click play to hear any sound
3. **Favorite** - Heart sounds you like to save them
4. **Download** - Get the file as `LockChime.wav`

### Setting Up Your Tesla

1. Download your chosen sound (it downloads as `LockChime.wav`)
2. Insert a USB drive formatted as FAT32 (usually named `TESLADRIVE`)
3. Copy `LockChime.wav` to the **root** of the USB drive (not in any folder)
4. Safely eject the USB drive
5. Plug it into your Tesla's glovebox USB port
6. Go to **Toybox → Boombox → Lock Sound → USB**

### Requirements

- Tesla with Pedestrian Warning System (PWS) speaker (2019+ models)
- USB drive formatted as FAT32
- Sound file must be named exactly `LockChime.wav`

### Features

- **200+ sounds** from movies, games, cartoons, and more
- **Channels** - Browse by vibe: Funny, Sci-Fi, Gaming, Retro, Movies, Cute
- **Seasonal Channels** - Spooky (Oct), Holiday (Dec), etc. auto-highlight
- **Quick Picks** - 5 random sounds with shuffle
- **Most Popular** - See what others are playing
- **Favorites** - Save sounds you like
- **Recently Played** - Quick access to sounds you've tried
- **Search & Categories** - Find sounds fast
- **Share** - Share any sound with a direct link
- **Grid/List view** - Switch layouts for browsing
- **Offline caching** - Cache sounds for offline access
- **Worldwide/Personal stats** - See global or your own stats

---

## For Developers

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Hosting | Cloudflare Pages |
| API | Cloudflare Pages Functions (Workers) |
| Database | Cloudflare KV (key-value store) |
| Audio Source | GitHub raw files + notateslaapp.com fallback |
| CI/CD | GitHub Actions |

### Project Structure

```
teslalocksoundloader/
├── .github/
│   └── workflows/
│       └── sync-sounds.yml    # Automated sound sync (runs 2x daily)
├── functions/
│   └── api/
│       ├── sounds.ts          # Scrapes source site for sound list
│       ├── stats.ts           # Play/download/favorite tracking
│       └── audio/
│           └── [file].ts      # Proxies audio files (GitHub → fallback)
├── scripts/
│   └── sync-sounds.js         # Node script to download new sounds
├── sounds/
│   └── *.wav                  # 200+ WAV files stored in repo
├── web/
│   ├── src/
│   │   ├── App.tsx            # Main app component
│   │   ├── components/
│   │   │   ├── Hero.tsx       # Intro + instructions
│   │   │   ├── QuickPicks.tsx # Random sound suggestions
│   │   │   ├── MostPopular.tsx # Top played/favorited
│   │   │   ├── SoundBrowser.tsx # Main browsing UI
│   │   │   ├── SoundCard.tsx  # Individual sound card
│   │   │   ├── StatsToggle.tsx # Worldwide/Personal toggle
│   │   │   ├── CategoryFilter.tsx # Tag cloud categories
│   │   │   ├── DownloadPanel.tsx # Download + instructions
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useSounds.ts   # Fetch + filter sounds
│   │   │   ├── useAudio.ts    # HTML5 audio playback
│   │   │   ├── useStats.ts    # Global + personal stats
│   │   │   ├── useFavorites.ts # localStorage favorites
│   │   │   └── useRecentlyPlayed.ts
│   │   └── lib/
│   │       ├── api.ts         # API helpers
│   │       └── storage.ts     # localStorage + Cache API
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

### Local Development

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/teslausbloader.git
cd teslausbloader

# Install dependencies
cd web
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Cloudflare Setup

1. **Create Cloudflare Pages project**
   - Connect to GitHub repo
   - Build command: `cd web && npm install && npm run build`
   - Build output directory: `web/dist`

2. **Create KV Namespace**
   - Go to Workers & Pages → KV → Create namespace
   - Name it `tesla-stats`

3. **Bind KV to Pages**
   - Pages project → Settings → Functions → KV namespace bindings
   - Variable name: `STATS`
   - Namespace: `tesla-stats`

4. **Deploy**
   - Push to `main` branch
   - Cloudflare auto-builds and deploys

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sounds` | GET | Returns list of all sounds with metadata |
| `/api/audio/[file].wav` | GET | Proxies audio file (GitHub → fallback) |
| `/api/stats` | GET | Returns global stats + top sounds |
| `/api/stats` | POST | Records play/download/favorite event |

### Key Design Decisions

1. **WAV files in Git** - Stored directly in repo for CDN delivery via GitHub raw
2. **Cloudflare Workers proxy** - Handles CORS, provides fallback sources
3. **Session deduplication** - Only first play per session counts globally
4. **Personal + Global stats** - localStorage for personal, KV for global
5. **Automated sync** - GitHub Actions checks source site twice daily

---

## AI Agent Game Plan

> This section is a step-by-step guide for an AI agent to rebuild this project from scratch.

### Phase 1: Project Setup

**Goal:** Create a new React + Vite + Tailwind project

```
1. Create project directory
2. Initialize web app:
   - npx create-vite@latest web --template react-ts
   - cd web && npm install
   - npm install -D tailwindcss postcss autoprefixer
   - npx tailwindcss init -p
3. Configure Tailwind in vite.config.ts and tailwind.config.js
4. Set up dark theme in index.css (Tesla red: #e82127)
5. Create basic folder structure: components/, hooks/, lib/
```

### Phase 2: Core Sound Browsing

**Goal:** Fetch and display sounds with search/filter

```
1. Create /functions/api/sounds.ts
   - Scrape https://www.notateslaapp.com/tesla-custom-lock-sounds/
   - Parse HTML for .wav links using regex
   - Extract category from URL path
   - Return JSON: { sounds: [{ name, category, url }] }

2. Create useSounds hook
   - Fetch from /api/sounds
   - Process sounds: generate display names, parse categories
   - Implement filtering by search query and category

3. Create SoundCard component
   - Display sound name + category
   - Play/Pause button
   - Select button

4. Create SoundBrowser component
   - Search bar
   - Category filter
   - Grid of SoundCards
```

### Phase 3: Audio Playback

**Goal:** Preview sounds with HTML5 Audio

```
1. Create useAudio hook
   - Manage Audio element
   - play(url, id), stop() functions
   - Track currentlyPlaying and isPlaying state

2. Create /functions/api/audio/[file].ts
   - Proxy audio files to handle CORS
   - Try GitHub raw first, fallback to source site
```

### Phase 4: Download Functionality

**Goal:** Download selected sound as LockChime.wav

```
1. Create DownloadPanel component
   - Shows when sound is selected
   - Download button
   - Try File System Access API (Chrome)
   - Fallback to blob download

2. Add post-download instructions modal
   - Step-by-step Tesla setup guide
   - Warning about file renaming
```

### Phase 5: Favorites & Recently Played

**Goal:** Local persistence of user preferences

```
1. Add to lib/storage.ts:
   - getFavorites(), saveFavorites(), toggleFavorite()
   - getRecentlyPlayed(), addRecentlyPlayed()

2. Create useFavorites hook
3. Create useRecentlyPlayed hook
4. Update SoundCard with heart button
5. Add filter tabs: All / Favorites / Recent
```

### Phase 6: Stats Tracking

**Goal:** Track plays, downloads, favorites globally

```
1. Create Cloudflare KV namespace for stats
2. Create /functions/api/stats.ts
   - GET: return global stats + top sounds
   - POST: record play/download/favorite event

3. Create useStats hook
   - Fetch global stats
   - Session deduplication (only first play counts)
   - Personal stats in localStorage
   - Worldwide/Personal mode toggle

4. Create StatsToggle component
5. Create MostPopular component (top played/favorited)
```

### Phase 7: UX Enhancements

**Goal:** Polish the user experience

```
1. Hero component - intro + expandable instructions
2. QuickPicks component - 5 random sounds + shuffle
3. Category tag cloud - weighted by count + favorites
4. Grid/List view toggle
5. Compact card design for density
6. Micro-animations:
   - Card hover scale
   - Heart pop on favorite
   - Bounce-in for selected indicator
7. Play count badges on cards
```

### Phase 8: Automated Sound Sync

**Goal:** Keep sounds up-to-date automatically

```
1. Create scripts/sync-sounds.js
   - Fetch source page
   - Parse all .wav URLs
   - Compare to local sounds/ folder
   - Download new sounds

2. Create .github/workflows/sync-sounds.yml
   - Schedule: twice daily (cron)
   - Run sync script
   - Commit and push new sounds
```

### Phase 9: Deployment

**Goal:** Deploy to Cloudflare Pages

```
1. Push code to GitHub
2. Create Cloudflare Pages project
3. Configure build settings
4. Create and bind KV namespace
5. Verify API endpoints work
6. Test full flow
```

### Key Files to Create (In Order)

1. `web/package.json` - dependencies
2. `web/vite.config.ts` - Vite + Tailwind config
3. `web/src/index.css` - Tailwind + custom styles
4. `web/src/lib/api.ts` - API helpers
5. `web/src/lib/storage.ts` - localStorage utilities
6. `web/src/hooks/useSounds.ts` - sound fetching
7. `web/src/hooks/useAudio.ts` - audio playback
8. `web/src/hooks/useFavorites.ts` - favorites
9. `web/src/hooks/useRecentlyPlayed.ts` - history
10. `web/src/hooks/useStats.ts` - stats tracking
11. `web/src/components/SoundCard.tsx` - sound display
12. `web/src/components/SoundBrowser.tsx` - main browser
13. `web/src/components/DownloadPanel.tsx` - download UI
14. `web/src/components/Hero.tsx` - intro section
15. `web/src/components/QuickPicks.tsx` - random picks
16. `web/src/components/MostPopular.tsx` - top sounds
17. `web/src/components/StatsToggle.tsx` - stats mode
18. `web/src/App.tsx` - main app
19. `functions/api/sounds.ts` - sounds API
20. `functions/api/stats.ts` - stats API
21. `functions/api/audio/[file].ts` - audio proxy
22. `scripts/sync-sounds.js` - sync script
23. `.github/workflows/sync-sounds.yml` - CI/CD

### Prompts That Built This Project

Here are example prompts used during development:

1. "Fix my script.sh that scrapes Tesla lock sounds from notateslaapp.com"
2. "Port this Bash CLI tool to a web app hosted on Cloudflare Pages"
3. "Add a favorites system with heart buttons and localStorage"
4. "Add play count tracking with Cloudflare KV"
5. "Create compact cards and a Grid/List view toggle"
6. "Add micro-animations - hover scale and heart pop"
7. "Add session deduplication to prevent gaming the stats"
8. "Create automated GitHub Actions to sync new sounds daily"

### Tips for AI Agents

1. **Read before editing** - Always read existing files before modifying
2. **Build incrementally** - Test each phase before moving on
3. **Handle errors gracefully** - The app should work even if APIs fail
4. **Mobile-first** - Test responsive design at each step
5. **Commit often** - Small, focused commits with clear messages
6. **Check for linter errors** - Fix TypeScript errors before moving on

---

## Sound Source & Credits

> **All sounds are sourced from [Not a Tesla App](https://www.notateslaapp.com/tesla-custom-lock-sounds/).**
> 
> This project is an unofficial browser/loader for their excellent curated collection of Tesla lock sounds. All credit for collecting, optimizing, and maintaining the sound library goes to the [Not a Tesla App](https://www.notateslaapp.com) team. They do the hard work of finding, converting, and testing sounds to work perfectly with Tesla vehicles.

We highly recommend visiting their site for:
- The original source of all sounds
- Tesla software update news
- FSD updates and features
- Tesla tips, guides, and easter eggs

### Additional Credits

- Built with [Claude](https://claude.ai) AI assistance
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com)

## License

MIT License - Feel free to fork and customize!
