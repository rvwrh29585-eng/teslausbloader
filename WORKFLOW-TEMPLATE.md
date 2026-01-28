# AI-Assisted Web App Workflow Template

> A reusable guide for building web apps with Cursor AI + GitHub + Cloudflare Pages

---

## Overview

This workflow lets you:
- Describe what you want in natural language
- Have AI write all the code
- AI pushes directly to GitHub
- Cloudflare auto-deploys on every push
- See changes live in ~1 minute

---

## Step 1: Create GitHub Repository

### Option A: GitHub Web Interface
1. Go to [github.com/new](https://github.com/new)
2. Name your repo (e.g., `my-cool-app`)
3. Set to **Public** or **Private**
4. **Don't** add README, .gitignore, or license (let AI create them)
5. Click **Create repository**
6. Copy the repo URL (e.g., `https://github.com/USERNAME/my-cool-app.git`)

### Option B: GitHub CLI
```bash
gh repo create my-cool-app --public --clone
cd my-cool-app
```

---

## Step 2: Authenticate Git on Your Machine

The AI needs permission to push. Choose one method:

### Option A: GitHub CLI (Recommended)
```bash
# Install if needed
brew install gh

# Login (opens browser)
gh auth login

# Configure git to use HTTPS with gh credentials
gh auth setup-git
```

### Option B: Personal Access Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Generate new token with `repo` scope
3. Use token as password when git asks for credentials

### Option C: SSH Key
```bash
# Generate key if needed
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Paste at: GitHub Settings → SSH Keys → New SSH Key
```

---

## Step 3: Set Up Cloudflare Pages

### Initial Setup (One-Time)
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click **Workers & Pages** in sidebar
3. Click **Create** → **Pages** → **Connect to Git**
4. Authorize Cloudflare to access your GitHub
5. Select your repository

### Configure Build Settings

For a **React + Vite** project:
| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | `cd web && npm install && npm run build` |
| Build output directory | `web/dist` |
| Root directory | `/` (leave empty) |

For a **static site** (no build):
| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Build command | (leave empty) |
| Build output directory | `/` or `public` |

### Optional: Add KV Storage
If you need a database:
1. Go to **Workers & Pages → KV**
2. Click **Create a namespace**
3. Name it (e.g., `my-app-data`)
4. Go to your Pages project → **Settings → Functions → KV namespace bindings**
5. Add binding: Variable name `DATA`, select your namespace

### Optional: Environment Variables
1. Go to Pages project → **Settings → Environment variables**
2. Add any API keys or secrets

---

## Step 4: Create Local Project

```bash
# Create project folder
mkdir ~/Apps/my-cool-app
cd ~/Apps/my-cool-app

# Initialize git and connect to GitHub
git init
git remote add origin https://github.com/USERNAME/my-cool-app.git
git branch -M main
```

---

## Step 5: Open in Cursor and Brief the AI

Open the folder in Cursor, then start a new chat with context like this:

---

### Template Prompt for AI

```
I'm starting a new web project. Here's the setup:

**Project:** [Brief description of what you're building]

**Tech Stack:**
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Hosting: Cloudflare Pages
- Backend: Cloudflare Pages Functions (if needed)
- Database: Cloudflare KV (if needed)

**Workflow:**
- You have full control to create, edit, and push code
- GitHub repo: https://github.com/USERNAME/my-cool-app
- Every push auto-deploys to Cloudflare Pages
- Live URL will be: https://my-cool-app.pages.dev

**To deploy changes:**
1. Make code changes
2. Run: git add -A && git commit -m "message" && git push

**Project structure I want:**
/web              - React frontend
/functions/api    - Cloudflare Workers (API routes)
/README.md        - Documentation

Please start by:
1. Creating the initial project structure
2. Setting up React + Vite + Tailwind
3. Creating a basic landing page
4. Pushing to GitHub so I can verify the deployment works

Let me know if you need any clarification before starting.
```

---

## Step 6: Development Loop

Once set up, the workflow is:

1. **Describe what you want** in natural language
2. **AI writes the code** and commits to GitHub
3. **Cloudflare auto-deploys** (~30-60 seconds)
4. **You test** the live site
5. **Give feedback** and iterate

### Useful Commands the AI Will Use

```bash
# Check current status
git status

# Commit and push changes
git add -A && git commit -m "Add feature X" && git push

# Check deployment status (if using Wrangler)
npx wrangler pages deployment list

# View logs
npx wrangler pages deployment tail
```

---

## Common Project Templates

### Simple Static Site
```
my-site/
├── index.html
├── style.css
├── script.js
└── README.md
```

### React + Vite App
```
my-app/
├── web/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── functions/
│   └── api/
│       └── hello.ts
├── README.md
└── .gitignore
```

### Full-Stack with KV Database
```
my-app/
├── web/                    # Frontend
├── functions/api/          # Backend APIs
├── wrangler.toml           # Cloudflare config (KV bindings)
└── README.md
```

---

## Troubleshooting

### "Permission denied" on git push
```bash
# Re-authenticate with GitHub CLI
gh auth login
gh auth setup-git
```

### Cloudflare build fails
- Check build logs in Cloudflare dashboard
- Ensure build command and output directory are correct
- For React: output is usually `web/dist` or `dist`

### Functions not working
- Functions must be in `/functions` at repo root (not inside `/web`)
- File path becomes API route: `/functions/api/hello.ts` → `/api/hello`

### KV not working
- Verify binding name in wrangler.toml matches code
- Bindings only work in deployed environment, not local dev

---

## Checklist for New Projects

- [ ] GitHub repo created
- [ ] Git authenticated on machine (`gh auth login`)
- [ ] Cloudflare Pages project created and connected to repo
- [ ] Build settings configured
- [ ] (Optional) KV namespace created and bound
- [ ] (Optional) Environment variables added
- [ ] Initial code pushed and deployed
- [ ] Live URL tested

---

## Example First Message to AI

> I want to build a simple recipe sharing site. Users can browse recipes, search by ingredient, and save favorites (stored in localStorage). No login needed.
>
> Use React + Vite + Tailwind. Host on Cloudflare Pages. GitHub repo is https://github.com/myuser/recipe-app
>
> Start by setting up the project structure and a basic homepage with a search bar. Push to GitHub when ready so I can test the deployment.

---

*This template was created based on building the Tesla Lock Sound Loader project.*
