# VDA Trading Terminal — Complete Project Context

> **Purpose of this file:** This is a single self-contained document that
> contains every piece of documentation, configuration, source code, and
> test for the **VDA Trading Terminal** (including the embedded CRM module).
> Paste or upload this file into ChatGPT (or any AI assistant) so it can
> answer questions about the project, suggest improvements, debug issues,
> or help deploy it.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [How to Run Locally](#how-to-run-locally)
4. [How to Deploy (go live)](#how-to-deploy-go-live)
5. [CRM Module Deploy Guide](#crm-module-deploy-guide)
6. [GitHub Actions Workflow](#github-actions-workflow)
7. [package.json](#packagejson)
8. [.gitignore](#gitignore)
9. [Source Code — Entry Points](#source-code--entry-points)
10. [Source Code — Utilities](#source-code--utilities)
11. [Source Code — MT4 Bridge Service](#source-code--mt4-bridge-service)
12. [Source Code — Redux Store](#source-code--redux-store)
13. [Source Code — Redux Reducers](#source-code--redux-reducers)
14. [Source Code — UI Components (Trading Terminal)](#source-code--ui-components-trading-terminal)
15. [Source Code — Additional UI Components](#source-code--additional-ui-components)
16. [Source Code — CRM Components](#source-code--crm-components)
17. [Tests](#tests)
18. [Source Code — Additional Tests](#source-code--additional-tests)
19. [CRM System — Standalone Repo Files](#crm-system--standalone-repo-files)
20. [Backend Server (Node.js / Express + WebSocket)](#backend-server-nodejs--express--websocket)
21. [Backend — Middleware](#backend--middleware)
22. [Backend — Routes](#backend--routes)
23. [Backend — Controllers](#backend--controllers)
24. [Backend — Models](#backend--models)
25. [Backend — Services](#backend--services)
26. [Backend — Utilities](#backend--utilities)
27. [Backend — Tests](#backend--tests)
28. [Database (PostgreSQL)](#database-postgresql)
29. [Docker & Deployment](#docker--deployment)
30. [Quick Reference](#quick-reference--key-facts-for-chatgpt)

---

## Project Overview

# VDA Trading Terminal

This is a **trading app** that runs in your web browser. It shows live prices and lets you practice buying and selling currencies and other assets. 📈

---

> ### 🚀 Ready to put it online?
> **[➡ DEPLOY.md — Step-by-step go-live guide (plain English)](./DEPLOY.md)**
> *(Or run `./go-live.sh` to check your setup and get the exact steps printed for you!)*

---

## 👀 Want to see it right now?

**Just click this link and it opens in your browser — nothing to install!**

> 👉 **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

That's it! The app will open and prices will start moving on their own. 🎉

---

## 💻 Want to run it on your own computer instead?

Follow these steps **one at a time**. Take your time — there's no rush!

---

### Step 1 — Download Node.js

Node.js is a helper program that lets the app run on your computer.

1. Go to 👉 **[https://nodejs.org](https://nodejs.org)**
2. Click the big green button that says **"LTS"** (that's the safe, stable version)
3. Download and install it — just click **Next** on everything, like any normal program
4. When it's done, close and reopen your terminal / command prompt

---

### Step 2 — Open your terminal (the black text window)

- **Windows**: Press the `Windows` key, type `cmd`, press `Enter`
- **Mac**: Press `Cmd + Space`, type `Terminal`, press `Enter`

---

### Step 3 — Go to the project folder

Type this and press `Enter` (change the path to wherever you saved the project):

```
cd C:\path\to\vda-trading-terminal
```

*(On Mac it looks like: `cd /Users/yourname/vda-trading-terminal`)*

---

### Step 4 — Install the app's pieces (first time only)

Type this and press `Enter`:

```
npm install
```

⏳ Wait for it to finish. You'll see a lot of text scrolling — that's normal! It usually takes about 1–2 minutes.

---

### Step 5 — Start the app

Type this and press `Enter`:

```
npm start
```

⏳ Wait about 10–20 seconds. When you see:

```
Compiled successfully!
```

...the app is ready! 🎉

---

### Step 6 — Open it in your browser

Open **Google Chrome**, **Firefox**, or any browser and go to:

> 👉 **[http://localhost:3000](http://localhost:3000)**

The trading terminal will open and prices will start moving automatically. No real money is involved — it's just a demo!

---

### Step 7 — How to stop it

When you're done, go back to the terminal and press:

```
Ctrl + C
```

That turns off the app.

---

## 🌐 Make it live online (so anyone in the world can visit it)

📖 **[Full step-by-step guide → DEPLOY.md](./DEPLOY.md)**  *(also try `./go-live.sh` for a guided checklist!)*

The app is already set up to go live for **free** using something called **GitHub Pages**. Think of it like GitHub hosting your website for you. You just need to flip one switch — here's how:

---

### Step 1 — Go to your GitHub repository

Open your browser and go to:

> 👉 **[https://github.com/virtuex-digital-assets/vda-trading-terminal](https://github.com/virtuex-digital-assets/vda-trading-terminal)**

---

### Step 2 — Open the Settings

Click the **"Settings"** tab near the top of the page (it has a gear icon ⚙️).

---

### Step 3 — Find "Pages" in the left menu

On the left side of the Settings page, scroll down and click **"Pages"**.

---

### Step 4 — Turn on GitHub Pages

Under **"Source"**, click the dropdown that says **"None"** and change it to **"GitHub Actions"**.

Then click **Save**.

---

### Step 5 — Merge this PR to main

Once the PR is merged into the `main` branch, GitHub will automatically:
1. Build the app ⚙️
2. Put it live on the internet 🚀

This takes about **2–3 minutes**.

---

### Step 6 — Visit your live site!

Once it's done, your site will be live at:

> 👉 **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

Just open that link in any browser — from any device, anywhere in the world! 🌍

> Every time you push new code to `main`, the site automatically updates itself. You don't have to do anything!

---

## 🏠 Use your own domain name (e.g. `www.mysite.com`)

Want the site to have your own web address instead of the long GitHub one? Here's how — step by step.

---

### What you need first

You need to **buy a domain name** (like `mysite.com`). You can buy one from:
- [Namecheap](https://www.namecheap.com) (~$10/year)
- [Google Domains](https://domains.google) (~$12/year)
- [GoDaddy](https://www.godaddy.com) (~$12/year)

Once you've bought one, come back here and follow these steps:

---

### Step A — Point your domain to GitHub

1. Log in to wherever you bought your domain (e.g. Namecheap)
2. Find the **DNS settings** for your domain (sometimes called "Advanced DNS" or "Manage DNS")
3. Add these **4 records** (they tell the internet to send visitors to GitHub):

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

4. Also add this record (for the `www.` version):

| Type | Host | Value |
|---|---|---|
| CNAME | www | virtuex-digital-assets.github.io |

5. Save the changes. DNS can take up to **24 hours** to spread around the internet (usually much faster).

---

### Step B — Tell GitHub your domain name

1. Go back to your GitHub repo → **Settings** → **Pages**
2. Under **"Custom domain"**, type in your domain (e.g. `www.mysite.com`)
3. Click **Save**
4. GitHub will automatically turn on **HTTPS** (the padlock 🔒) for free — just tick "Enforce HTTPS" if it's not already ticked

---

### Step C — Add a CNAME file to the project

This file tells GitHub "remember my custom domain even after a new deploy":

1. In the `public/` folder of this project, create a file called `CNAME` (no file extension)
2. Inside it, put just your domain name on one line, for example:

```
www.mysite.com
```

3. Save it, commit it, and push to `main` — GitHub Pages will pick it up automatically

---

### Step D — Visit your site on your new domain!

After DNS has updated (give it up to 24 hours), open your browser and go to:

> 👉 **`https://www.mysite.com`**

Your trading terminal will load on your very own web address! 🎉

---

## 🆕 CRM System — standalone repository

The CRM module that lives inside this trading terminal has its own dedicated repository:

> 👉 **[https://github.com/virtuex-digital-assets/vda-crm-system](https://github.com/virtuex-digital-assets/vda-crm-system)**

Once deployed, the standalone CRM will be live at:

> 👉 **[https://virtuex-digital-assets.github.io/vda-crm-system](https://virtuex-digital-assets.github.io/vda-crm-system)**

---

### How to copy the CRM code into the new repo

The CRM source files live in this repo. Follow these steps **once** to push them into `vda-crm-system`.

> ⚠️ You need **Node.js** and **Git** installed before starting (see the steps earlier in this README).

---

#### Step 1 — Clone the new CRM repo

Open your terminal and type:

```
git clone https://github.com/virtuex-digital-assets/vda-crm-system.git
cd vda-crm-system
```

---

#### Step 2 — Bootstrap a React app in that folder

```
npx create-react-app .
```

⏳ This takes about 2 minutes. When it's done you'll see "Happy hacking!"

---

#### Step 3 — Copy the CRM source files across

From the `vda-trading-terminal` folder, copy these into the new repo:

| Copy this from `vda-trading-terminal/` | Into `vda-crm-system/` |
|---|---|
| `src/components/CRM/` | `src/components/CRM/` |
| `src/components/shared.css` | `src/components/shared.css` |
| `src/store/` | `src/store/` |

Then replace `vda-crm-system/src/App.js` with:

```jsx
import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import CRMView from './components/CRM/CRMView';
import './components/shared.css';

const App = () => (
  <Provider store={store}>
    <div style={{ background: '#0d1b2a', minHeight: '100vh' }}>
      <header style={{ padding: '10px 20px', background: '#0a1628', color: '#c0cfe8', fontSize: 18, fontWeight: 700 }}>
        VDA CRM System
      </header>
      <CRMView />
    </div>
  </Provider>
);

export default App;
```

---

#### Step 4 — Install the extra packages

```
npm install redux react-redux
```

---

#### Step 5 — Test it locally

```
npm start
```

Open **[http://localhost:3000](http://localhost:3000)** — the CRM should load.

---

#### Step 6 — Commit and push to GitHub

```
git add .
git commit -m "feat: add standalone CRM app"
git push
```

---

#### Step 7 — Enable GitHub Pages (make it live)

1. Go to 👉 **[https://github.com/virtuex-digital-assets/vda-crm-system/settings/pages](https://github.com/virtuex-digital-assets/vda-crm-system/settings/pages)**
2. Under **Source**, choose **GitHub Actions**
3. Click **Save**

GitHub will automatically build and deploy the CRM — it will be live in about 2 minutes at:

> 👉 **[https://virtuex-digital-assets.github.io/vda-crm-system](https://virtuex-digital-assets.github.io/vda-crm-system)**

---

## 🤔 What can I do in the app?

Here's what you'll see when you open it:

| What you see | What it does |
|---|---|
| **Market Watch** (left panel) | Shows live prices for 10 currencies and assets like Gold and Bitcoin |
| **Chart** (middle) | Shows a price chart — you can switch between different time views |
| **Order Panel** (right) | Where you click BUY or SELL to practice placing a trade |
| **Positions** (bottom) | Shows trades you have open right now |
| **History** | Shows trades you already closed |
| **Account Info** | Shows your pretend balance and profit/loss |

---

## 🪙 Which assets are in the app?

`EURUSD` · `GBPUSD` · `USDJPY` · `XAUUSD` (Gold) · `USDCHF` · `AUDUSD` · `USDCAD` · `NZDUSD` · `BTCUSD` · `ETHUSD`

---

## ❓ Something not working?

| Problem | Fix |
|---|---|
| *"npm is not recognized"* | You need to install Node.js (see Step 1 above) |
| *"localhost:3000 can't be reached"* | Make sure you ran `npm start` and waited for "Compiled successfully!" |
| *Page is blank or broken* | Try a hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac) |

---

## License

MIT © Virtuex Digital Assets

---

## How to Deploy (go live)

```
# 🚀 How to make VDA Trading Terminal go LIVE — step by step

Don't worry if you've never done this before. We'll go through it together,
one tiny step at a time. 🐣

---

## What are we doing?

We are going to put the trading terminal on the internet so **anyone in the world**
can open it in their browser — on their phone, their laptop, anywhere.

It will be available at this free address:

> **https://virtuex-digital-assets.github.io/vda-trading-terminal**

GitHub gives us free hosting. The app is already set up to go live automatically.
You just need to flip **one switch** in GitHub settings and then merge the PR. That's it!

---

## Before you start — things you need

| Thing | Why | Got it? |
|---|---|---|
| A GitHub account | So you can change settings | [github.com](https://github.com) — it's free |
| Owner or admin access to the repo | So you can change Settings | Ask the repo owner if unsure |

That's it. You don't need to install anything on your computer. GitHub does all the work!

---

## STEP 1 — Enable GitHub Pages

This is the **one switch** we need to flip. You only do this once, ever.

1. Open your browser and go to:
   > **[https://github.com/virtuex-digital-assets/vda-trading-terminal/settings/pages](https://github.com/virtuex-digital-assets/vda-trading-terminal/settings/pages)**

2. You'll see a section called **"Source"**

3. Click the dropdown (it probably says **"None"** or **"Deploy from a branch"**)

4. Choose **"GitHub Actions"**

5. Click **Save**

✅ Done! GitHub Pages is now turned on.

---

## STEP 2 — Merge the pull request to `main`

The code is ready — it just needs to be "merged" (like clicking Approve + Apply).

1. Go to the **Pull Requests** tab:
   > **[https://github.com/virtuex-digital-assets/vda-trading-terminal/pulls](https://github.com/virtuex-digital-assets/vda-trading-terminal/pulls)**

2. Click the open pull request

3. Scroll to the bottom and click the green **"Merge pull request"** button

4. Click **"Confirm merge"**

✅ Done! The code is now on the `main` branch.

---

## STEP 3 — Watch the robot build it 🤖

As soon as you merged, GitHub started an automatic robot job that:
- Installs the app's parts
- Builds a website from the code
- Publishes it live on the internet

This takes **about 2–3 minutes**. You can watch it:

1. Click the **Actions** tab:
   > **[https://github.com/virtuex-digital-assets/vda-trading-terminal/actions](https://github.com/virtuex-digital-assets/vda-trading-terminal/actions)**

2. You'll see a job called **"Deploy to GitHub Pages"** — it has a yellow spinning circle

3. Click on it to watch each step turn green ✅

> 💛 Yellow spinning = still working (be patient!)
> ✅ Green tick = finished!
> ❌ Red X = something went wrong (see "Help!" section below)

---

## STEP 4 — Open your live app! 🎉

Once the Actions job goes green (usually within 2–3 minutes of merging), open:

> **[https://virtuex-digital-assets.github.io/vda-trading-terminal](https://virtuex-digital-assets.github.io/vda-trading-terminal)**

The trading terminal will load and prices will start moving on their own. 📈

---

## 🔁 How updates work in the future

Every time someone pushes new code to `main`, the robot automatically:
1. Rebuilds the app
2. Puts it live again

You don't have to do anything. It just works! ✨

---

## 🏠 Want your own web address? (e.g. `www.mysite.com`)

Instead of the long GitHub address, you can use your own domain name.
Here's how — step by step:

---

### A — Buy a domain name

You need to buy a domain like `mysite.com`. Good places to buy:
- **[Namecheap](https://www.namecheap.com)** — about $10/year
- **[Google Domains](https://domains.google)** — about $12/year
- **[GoDaddy](https://www.godaddy.com)** — about $12/year

---

### B — Point your domain at GitHub

1. Log in to where you bought your domain
2. Find the **DNS settings** (sometimes called "Advanced DNS" or "Manage DNS")
3. Add these **4 A records** — copy them exactly:

   | Type | Host/Name | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

4. Also add **one CNAME record** for the `www.` version:

   | Type | Host/Name | Value |
   |---|---|---|
   | CNAME | www | virtuex-digital-assets.github.io |

5. Click Save. DNS changes can take up to **24 hours** to work (usually much faster).

---

### C — Tell GitHub your domain

1. Go to: **Settings → Pages** in your GitHub repo
2. Under **"Custom domain"**, type your domain (e.g. `www.mysite.com`)
3. Click **Save**
4. Tick **"Enforce HTTPS"** so the padlock 🔒 shows up for visitors

---

### D — Add a CNAME file to the project

This prevents GitHub from forgetting your domain after the next deploy.

1. Create a file called `CNAME` (no `.txt` extension!) inside the `public/` folder
2. Put your domain on the first line — for example:
   ```
   www.mysite.com
   ```
3. Save it, commit it to `main`, push it — the robot will pick it up automatically

---

### E — Visit your live site! 🎉

After DNS has finished spreading (up to 24 hours), open:

> **`https://www.mysite.com`**

Your trading terminal will load on your very own web address! 🌍

---

## 😰 Something went wrong?

| Problem | Fix |
|---|---|
| Settings → Pages shows an error | Make sure "Source" is set to **GitHub Actions**, not "None" |
| Actions tab shows red ❌ | Click on the failed job → scroll to the red step → read the message |
| Site shows a 404 page | Wait 2 more minutes, then hard-refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`) |
| "Permission denied" error in Actions | Make sure the workflow has `permissions: contents: write` (it already does) |
| Domain not working | DNS takes time — wait up to 24 hours, then try again |

---

## 🆘 Still stuck?

Open an issue in the repo and describe exactly what step you're on and what you see:

> **[https://github.com/virtuex-digital-assets/vda-trading-terminal/issues](https://github.com/virtuex-digital-assets/vda-trading-terminal/issues)**

---

*The app is live. Tell everyone.* 🚀
```

---

## go-live.sh (trading terminal)

```bash
#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# go-live.sh  —  Quick-start checklist for deploying VDA Trading Terminal
#
# This script does NOT push or deploy on its own — the GitHub Actions robot
# does all of that for you!  This script just walks you through the steps
# and checks that your local environment is ready.
#
# Usage:
#   chmod +x go-live.sh
#   ./go-live.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🚀  VDA Trading Terminal  —  Go Live Checklist"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  This script will check your local setup and then"
echo "  tell you exactly what to do next."
echo ""

# ── Step 1: Check Node.js ──────────────────────────────────────────────────────
echo "─── Checking tools ──────────────────────────────────────"
echo ""

if command -v node &> /dev/null; then
  NODE_VER=$(node --version)
  echo "  ✅  Node.js found: $NODE_VER"
else
  echo "  ❌  Node.js NOT found."
  echo ""
  echo "      → Download and install it from: https://nodejs.org"
  echo "      → Choose the LTS (green) button"
  echo "      → After installing, close this terminal, open a new one, then run this script again"
  echo ""
  exit 1
fi

# ── Step 2: Check Git ─────────────────────────────────────────────────────────
if command -v git &> /dev/null; then
  GIT_VER=$(git --version)
  echo "  ✅  Git found: $GIT_VER"
else
  echo "  ❌  Git NOT found."
  echo ""
  echo "      → Download and install it from: https://git-scm.com/downloads"
  echo "      → After installing, close this terminal, open a new one, then run this script again"
  echo ""
  exit 1
fi

# ── Step 3: Check we are inside the right project folder ──────────────────────
if [ ! -f "package.json" ]; then
  echo ""
  echo "  ❌  This script must be run from INSIDE the vda-trading-terminal folder."
  echo ""
  echo "      For example:"
  echo "        cd /path/to/vda-trading-terminal"
  echo "        ./go-live.sh"
  echo ""
  exit 1
fi

PROJECT_NAME=$(node -e "const p = require('./package.json'); console.log(p.name);")
echo "  ✅  Inside project: $PROJECT_NAME"
echo ""

# ── Step 4: Check node_modules ────────────────────────────────────────────────
echo "─── Checking dependencies ───────────────────────────────"
echo ""
if [ -d "node_modules" ]; then
  echo "  ✅  node_modules found (dependencies already installed)"
else
  echo "  ⚙️   node_modules not found — installing now..."
  npm install
  echo "  ✅  Dependencies installed!"
fi
echo ""

# ── Step 5: Quick build check ─────────────────────────────────────────────────
echo "─── Quick local build check ─────────────────────────────"
echo ""
echo "  ⏳  Building the app (this proves the code is healthy)..."
npm run build > /tmp/vda-build.log 2>&1 && echo "  ✅  Build succeeded — code is healthy!" || {
  echo "  ❌  Build FAILED. Here are the last 20 lines of the error:"
  echo ""
  tail -20 /tmp/vda-build.log
  echo ""
  echo "  → Fix the errors above, then run this script again."
  exit 1
}
echo ""

# ── Step 6: All good — tell the user what to do next ─────────────────────────
echo "═══════════════════════════════════════════════════════"
echo "  🎉  Local checks passed! Here is what to do next:"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  📋  STEP 1 — Enable GitHub Pages (do this ONCE, ever)"
echo ""
echo "       Go to:"
echo "       https://github.com/virtuex-digital-assets/vda-trading-terminal/settings/pages"
echo ""
echo "       Under 'Source', choose 'GitHub Actions', then click Save."
echo ""
echo "  📋  STEP 2 — Merge the pull request to main"
echo ""
echo "       Go to:"
echo "       https://github.com/virtuex-digital-assets/vda-trading-terminal/pulls"
echo ""
echo "       Open the PR, scroll down, click 'Merge pull request', then 'Confirm merge'."
echo ""
echo "  📋  STEP 3 — Watch the robot build and deploy (~2 min)"
echo ""
echo "       Go to:"
echo "       https://github.com/virtuex-digital-assets/vda-trading-terminal/actions"
echo ""
echo "       Watch the 'Deploy to GitHub Pages' job. Wait for the green ✅."
echo ""
echo "  📋  STEP 4 — Open your live app!"
echo ""
echo "       https://virtuex-digital-assets.github.io/vda-trading-terminal"
echo ""
echo "  📖  Full guide: DEPLOY.md"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
```

---

## GitHub Actions Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
      - copilot/investigate-conversation-issues
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Enable GitHub Pages (branch source)
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh api repos/${{ github.repository }}/pages \
            -X POST \
            -f "source[branch]=gh-pages" \
            -f "source[path]=/" \
            2>&1 | tee /tmp/pages-enable.log || echo "Pages already enabled or enable failed (see log above)"

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

---

## package.json

```json
{
  "name": "vda-trading-terminal",
  "version": "1.0.0",
  "description": "VDA MetaTrader 4 trading terminal – React frontend with Redux state management, candlestick charts, order management, and MT4 bridge connectivity.",
  "homepage": "https://virtuex-digital-assets.github.io/vda-trading-terminal",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "NODE_OPTIONS=--openssl-legacy-provider react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-scripts": "4.0.3",
    "redux": "^4.1.0",
    "react-redux": "^7.2.4"
  },
  "devDependencies": {
    "@testing-library/react": "^11.2.7",
    "@testing-library/jest-dom": "^5.14.1",
    "@testing-library/user-event": "^12.8.3"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

---

## .gitignore

```
# Dependencies
node_modules/
crm-system/node_modules/

# Production build artifacts
build/
crm-system/build/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor / OS
.DS_Store
.idea/
*.swp
```

---

## Source Code — Entry Points

---

## src/index.js

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
```

---

## src/App.js

```jsx
import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import mt4Bridge from './services/mt4Bridge';

import MarketWatch from './components/MarketWatch/MarketWatch';
import Chart from './components/Chart/Chart';
import OrderPanel from './components/OrderPanel/OrderPanel';
import Positions from './components/Positions/Positions';
import AccountInfo from './components/AccountInfo/AccountInfo';
import Terminal from './components/Terminal/Terminal';
import CRMView from './components/CRM/CRMView';

import './components/shared.css';
import './App.css';

const MT4_BRIDGE_URL = process.env.REACT_APP_MT4_BRIDGE_URL || '';

const AppInner = () => {
  const [appMode, setAppMode] = useState('terminal'); // 'terminal' | 'crm'

  useEffect(() => {
    if (MT4_BRIDGE_URL) {
      mt4Bridge.connect(MT4_BRIDGE_URL);
    } else {
      mt4Bridge.startSimulator();
    }
    return () => mt4Bridge.disconnect();
  }, []);

  return (
    <div className="terminal-root">
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="top-bar">
        <span className="logo">VDA</span>
        <span className="logo-sub">{appMode === 'crm' ? 'CRM System' : 'Trading Terminal · MetaTrader 4 Bridge'}</span>

        {/* App mode toggle */}
        <div className="app-mode-nav">
          <button
            className={`mode-btn${appMode === 'terminal' ? ' mode-active' : ''}`}
            onClick={() => setAppMode('terminal')}
          >
            📈 Trading Terminal
          </button>
          <button
            className={`mode-btn${appMode === 'crm' ? ' mode-active' : ''}`}
            onClick={() => setAppMode('crm')}
          >
            👥 CRM
          </button>
        </div>

        <div className="top-actions">
          {appMode === 'terminal' && (
            <button
              className="top-btn"
              title="Restart simulator"
              onClick={() => { mt4Bridge.stopSimulator(); mt4Bridge.startSimulator(); }}
            >
              ↺ Reset Demo
            </button>
          )}
        </div>
      </header>

      {/* ── CRM view ─────────────────────────────────────────────────── */}
      {appMode === 'crm' && <CRMView />}

      {/* ── Trading terminal layout ───────────────────────────────────── */}
      {appMode === 'terminal' && (
        <div className="main-layout">
          {/* Left sidebar: Market Watch + Account */}
          <div className="left-sidebar">
            <MarketWatch />
            <AccountInfo />
          </div>

          {/* Center: Chart + Positions + Terminal */}
          <div className="center-area">
            <Chart />
            <div className="bottom-panels">
              <Positions />
              <Terminal />
            </div>
          </div>

          {/* Right sidebar: Order Panel */}
          <div className="right-sidebar">
            <OrderPanel />
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <AppInner />
  </Provider>
);

export default App;
```

---

## Source Code — Utilities

---

## src/utils/constants.js

```js
// Shared spread values (in price units) for each symbol
export const SPREADS = {
  EURUSD: 0.0001,
  GBPUSD: 0.0002,
  USDJPY: 0.02,
  XAUUSD: 0.3,
  USDCHF: 0.0002,
  AUDUSD: 0.0002,
  USDCAD: 0.0002,
  NZDUSD: 0.0003,
  BTCUSD: 5.0,
  ETHUSD: 0.5,
};

export function getSpread(symbol) {
  return SPREADS[symbol] || 0.0001;
}
```

---

## src/utils/formatters.js

```js
/** Format a price to the correct number of decimal places for the symbol. */
export function formatPrice(symbol, price) {
  if (!price && price !== 0) return '—';
  const decimals = symbol && symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5;
  return Number(price).toFixed(decimals);
}

/** Format profit/loss with sign and 2 decimal places. */
export function formatProfit(value) {
  if (value === null || value === undefined) return '—';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}`;
}

/** Format a Unix timestamp (seconds) as HH:MM. */
export function formatBarTime(ts) {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Format ISO datetime as a short string. */
export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
```

---

## src/utils/marketSimulator.js

```js
/**
 * Market data simulator used when no live MT4 bridge is connected.
 * Generates realistic-looking OHLCV candles using a random-walk model.
 */

import { getSpread } from './constants';

// Seed prices for each symbol (realistic approximations)
const SEED_PRICES = {
  EURUSD: 1.0850,
  GBPUSD: 1.2650,
  USDJPY: 149.50,
  XAUUSD: 2020.0,
  USDCHF: 0.8950,
  AUDUSD: 0.6520,
  USDCAD: 1.3580,
  NZDUSD: 0.6090,
  BTCUSD: 52000.0,
  ETHUSD: 2800.0,
};

// Volatility (pip-per-bar σ relative to price)
const VOLATILITY = {
  EURUSD: 0.0008,
  GBPUSD: 0.001,
  USDJPY: 0.1,
  XAUUSD: 1.5,
  USDCHF: 0.0008,
  AUDUSD: 0.0009,
  USDCAD: 0.0009,
  NZDUSD: 0.0009,
  BTCUSD: 200,
  ETHUSD: 30,
};

const TIMEFRAME_SECONDS = {
  M1: 60,
  M5: 300,
  M15: 900,
  M30: 1800,
  H1: 3600,
  H4: 14400,
  D1: 86400,
  W1: 604800,
};

/** Gaussian random (Box-Muller) */
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/** Floor a Unix timestamp to the start of the current bar */
function barTime(ts, tfSeconds) {
  return Math.floor(ts / tfSeconds) * tfSeconds;
}

/**
 * Generate an array of OHLCV candles ending at 'now'.
 */
export function generateSimulatedCandles(symbol, timeframe, count) {
  const tfSec = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol = VOLATILITY[symbol] || 0.001;
  let price = SEED_PRICES[symbol] || 1.0;

  const nowSec = Math.floor(Date.now() / 1000);
  const startTime = barTime(nowSec, tfSec) - (count - 1) * tfSec;

  const candles = [];
  for (let i = 0; i < count; i++) {
    const time = startTime + i * tfSec;
    price = Math.max(0.0001, price + randn() * vol);
    const open = price;
    const close = Math.max(0.0001, price + randn() * vol * 0.5);
    const high = Math.max(open, close) + Math.abs(randn() * vol * 0.3);
    const low = Math.min(open, close) - Math.abs(randn() * vol * 0.3);
    const volume = Math.floor(100 + Math.random() * 900);
    candles.push({ time, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

/**
 * Advance the simulator by one tick.
 * Returns the updated last candle and a quote object.
 */
export function simulateNextCandle(symbol, timeframe, existingCandles) {
  const tfSec = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol = VOLATILITY[symbol] || 0.001;
  const spread = getSpread(symbol);

  const nowSec = Math.floor(Date.now() / 1000);
  const currentBarTime = barTime(nowSec, tfSec);

  const lastCandle = existingCandles[existingCandles.length - 1];
  const prevClose = lastCandle ? lastCandle.close : SEED_PRICES[symbol] || 1.0;

  // New tick price
  const tick = Math.max(0.0001, prevClose + randn() * vol * 0.15);

  let newCandle;
  if (lastCandle && lastCandle.time === currentBarTime) {
    // Update existing bar
    newCandle = {
      ...lastCandle,
      high: Math.max(lastCandle.high, tick),
      low: Math.min(lastCandle.low, tick),
      close: tick,
      volume: lastCandle.volume + Math.floor(Math.random() * 10),
    };
  } else {
    // Open new bar
    newCandle = {
      time: currentBarTime,
      open: prevClose,
      high: Math.max(prevClose, tick),
      low: Math.min(prevClose, tick),
      close: tick,
      volume: Math.floor(10 + Math.random() * 50),
    };
  }

  const bid = parseFloat(newCandle.close.toFixed(symbol.includes('JPY') ? 3 : 5));
  const ask = parseFloat((bid + spread).toFixed(symbol.includes('JPY') ? 3 : 5));

  return {
    newCandle,
    quote: { bid, ask, time: new Date().toISOString() },
  };
}

export function simulateQuote(symbol, lastPrice) {
  const vol = VOLATILITY[symbol] || 0.001;
  const spread = getSpread(symbol);
  const bid = Math.max(0.0001, lastPrice + randn() * vol * 0.1);
  const ask = bid + spread;
  return { bid, ask, time: new Date().toISOString() };
}


```

---

## Source Code — MT4 Bridge Service

---

## src/services/mt4Bridge.js

```js
/**
 * MT4 Bridge Service
 *
 * Handles communication with a MetaTrader 4 bridge (e.g., a WebSocket or REST
 * endpoint exposed by an MT4 Expert Advisor or a third-party MT4 bridge server).
 *
 * When a real bridge URL is not configured the service falls back to a built-in
 * market-data simulator so the terminal can be demoed without a live MT4
 * installation.
 */

import store from '../store';
import {
  updateQuote,
  setCandles,
  addCandle,
  updateAccount,
  updateOrderProfit,
  setConnectionStatus,
  addLog,
} from '../store/actions';
import { generateSimulatedCandles, simulateNextCandle } from '../utils/marketSimulator';
import { getSpread } from '../utils/constants';

const RECONNECT_DELAY_MS = 5000;
const CANDLE_HISTORY_COUNT = 200;

class MT4Bridge {
  constructor() {
    this._ws = null;
    this._simulationInterval = null;
    this._useSimulator = true;
    this._bridgeUrl = null;
  }

  /**
   * Connect to a live MT4 bridge WebSocket server.
   * @param {string} url  WebSocket URL, e.g. ws://localhost:5000
   */
  connect(url) {
    this._bridgeUrl = url;
    this._useSimulator = false;
    this._openSocket(url);
  }

  /** Start the built-in demo simulator (no real MT4 required). */
  startSimulator() {
    this._useSimulator = true;
    store.dispatch(setConnectionStatus({ status: 'connected', broker: 'VDA Demo (Simulator)' }));
    store.dispatch(addLog('info', 'Demo simulator started'));

    const state = store.getState();
    const symbols = state.market.symbols;
    const tf = state.market.timeframe;

    // Seed initial candle history for every symbol
    symbols.forEach((sym) => {
      const candles = generateSimulatedCandles(sym, tf, CANDLE_HISTORY_COUNT);
      store.dispatch(setCandles(sym, tf, candles));
      const last = candles[candles.length - 1];
      const spread = getSpread(sym);
      store.dispatch(updateQuote(sym, last.close, last.close + spread, last.time));
    });

    // Tick every 500 ms
    this._simulationInterval = setInterval(() => this._simulatorTick(), 500);
  }

  stopSimulator() {
    if (this._simulationInterval) {
      clearInterval(this._simulationInterval);
      this._simulationInterval = null;
    }
    store.dispatch(setConnectionStatus({ status: 'disconnected' }));
    store.dispatch(addLog('info', 'Demo simulator stopped'));
  }

  disconnect() {
    this.stopSimulator();
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  _simulatorTick() {
    const state = store.getState();
    const symbols = state.market.symbols;
    const tf = state.market.timeframe;

    symbols.forEach((sym) => {
      const key = `${sym}_${tf}`;
      const candles = state.market.candles[key] || [];
      if (candles.length === 0) return;

      const { newCandle, quote } = simulateNextCandle(sym, tf, candles);
      store.dispatch(addCandle(sym, tf, newCandle));
      store.dispatch(updateQuote(sym, quote.bid, quote.ask, quote.time));
    });

    // Recalculate floating P&L for open orders
    const { openOrders } = store.getState().orders;
    const quotes = store.getState().market.quotes;
    openOrders.forEach((order) => {
      const q = quotes[order.symbol];
      if (!q) return;
      const closePrice = order.type === 'BUY' ? q.bid : q.ask;
      const direction = order.type === 'BUY' ? 1 : -1;
      const pipValue = order.symbol.includes('JPY') ? 0.01 : 0.0001;
      const profit = direction * ((closePrice - order.openPrice) / pipValue) * order.lots * 1;
      store.dispatch(updateOrderProfit(order.ticket, parseFloat(profit.toFixed(2))));
    });

    // Update account equity
    const freshOrders = store.getState().orders.openOrders;
    const totalProfit = freshOrders.reduce((sum, o) => sum + (o.profit || 0), 0);
    const { balance, margin } = store.getState().account;
    const equity = balance + totalProfit;
    const freeMargin = equity - margin;
    const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;
    store.dispatch(
      updateAccount({
        equity: parseFloat(equity.toFixed(2)),
        profit: parseFloat(totalProfit.toFixed(2)),
        freeMargin: parseFloat(freeMargin.toFixed(2)),
        marginLevel: parseFloat(marginLevel.toFixed(2)),
      })
    );
  }

  _openSocket(url) {
    store.dispatch(setConnectionStatus({ status: 'connecting', broker: url }));
    store.dispatch(addLog('info', `Connecting to MT4 bridge at ${url}…`));

    try {
      this._ws = new WebSocket(url);
    } catch (e) {
      store.dispatch(setConnectionStatus({ status: 'error' }));
      store.dispatch(addLog('error', `Failed to create WebSocket: ${e.message}`));
      return;
    }

    this._ws.onopen = () => {
      store.dispatch(setConnectionStatus({ status: 'connected', broker: url }));
      store.dispatch(addLog('info', 'Connected to MT4 bridge'));
    };

    this._ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        this._handleBridgeMessage(msg);
      } catch (e) {
        store.dispatch(addLog('warn', `Malformed bridge message: ${evt.data}`));
      }
    };

    this._ws.onerror = () => {
      store.dispatch(setConnectionStatus({ status: 'error' }));
      store.dispatch(addLog('error', 'MT4 bridge connection error'));
    };

    this._ws.onclose = () => {
      store.dispatch(setConnectionStatus({ status: 'disconnected' }));
      store.dispatch(addLog('warn', `MT4 bridge disconnected. Reconnecting in ${RECONNECT_DELAY_MS / 1000}s…`));
      setTimeout(() => {
        if (!this._useSimulator && this._bridgeUrl) this._openSocket(this._bridgeUrl);
      }, RECONNECT_DELAY_MS);
    };
  }

  _handleBridgeMessage(msg) {
    switch (msg.type) {
      case 'quote':
        store.dispatch(updateQuote(msg.symbol, msg.bid, msg.ask, msg.time));
        break;
      case 'candles':
        store.dispatch(setCandles(msg.symbol, msg.timeframe, msg.data));
        break;
      case 'candle':
        store.dispatch(addCandle(msg.symbol, msg.timeframe, msg.data));
        break;
      case 'account':
        store.dispatch(updateAccount(msg.data));
        break;
      default:
        store.dispatch(addLog('debug', `Unknown bridge message type: ${msg.type}`));
    }
  }
}

const mt4Bridge = new MT4Bridge();
export default mt4Bridge;
```

---

## Source Code — Redux Store

---

## src/store/index.js

```js
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './rootReducer';

const composeEnhancers =
  (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const store = createStore(rootReducer, composeEnhancers(applyMiddleware()));

export default store;
```

---

## src/store/rootReducer.js

```js
import { combineReducers } from 'redux';
import marketReducer from './reducers/marketReducer';
import ordersReducer from './reducers/ordersReducer';
import accountReducer from './reducers/accountReducer';
import connectionReducer from './reducers/connectionReducer';
import terminalReducer from './reducers/terminalReducer';
import crmReducer from './reducers/crmReducer';

const rootReducer = combineReducers({
  market: marketReducer,
  orders: ordersReducer,
  account: accountReducer,
  connection: connectionReducer,
  terminal: terminalReducer,
  crm: crmReducer,
});

export default rootReducer;
```

---

## src/store/actions/actionTypes.js

```js
// Redux action types for the MT4 trading terminal

// Market data
export const UPDATE_QUOTE = 'UPDATE_QUOTE';
export const SET_ACTIVE_SYMBOL = 'SET_ACTIVE_SYMBOL';
export const ADD_CANDLE = 'ADD_CANDLE';
export const SET_CANDLES = 'SET_CANDLES';
export const SET_TIMEFRAME = 'SET_TIMEFRAME';

// Orders
export const PLACE_ORDER = 'PLACE_ORDER';
export const CLOSE_ORDER = 'CLOSE_ORDER';
export const MODIFY_ORDER = 'MODIFY_ORDER';
export const UPDATE_ORDER_PROFIT = 'UPDATE_ORDER_PROFIT';

// Account
export const UPDATE_ACCOUNT = 'UPDATE_ACCOUNT';
export const SET_LEVERAGE = 'SET_LEVERAGE';

// Connection
export const SET_CONNECTION_STATUS = 'SET_CONNECTION_STATUS';

// Terminal log
export const ADD_LOG = 'ADD_LOG';
export const CLEAR_LOG = 'CLEAR_LOG';

// CRM
export const CRM_SET_VIEW = 'CRM_SET_VIEW';
export const CRM_SELECT_CLIENT = 'CRM_SELECT_CLIENT';
export const CRM_ADD_CLIENT = 'CRM_ADD_CLIENT';
export const CRM_UPDATE_CLIENT = 'CRM_UPDATE_CLIENT';
export const CRM_SET_SEARCH = 'CRM_SET_SEARCH';
export const CRM_SET_STAGE_FILTER = 'CRM_SET_STAGE_FILTER';
export const CRM_ADD_NOTE = 'CRM_ADD_NOTE';
export const CRM_ADD_TRANSACTION = 'CRM_ADD_TRANSACTION';
export const CRM_DELETE_CLIENT = 'CRM_DELETE_CLIENT';
export const CRM_SET_REP_FILTER = 'CRM_SET_REP_FILTER';
```

---

## src/store/actions/index.js

```js
import {
  UPDATE_QUOTE,
  SET_ACTIVE_SYMBOL,
  ADD_CANDLE,
  SET_CANDLES,
  SET_TIMEFRAME,
  PLACE_ORDER,
  CLOSE_ORDER,
  MODIFY_ORDER,
  UPDATE_ORDER_PROFIT,
  UPDATE_ACCOUNT,
  SET_LEVERAGE,
  SET_CONNECTION_STATUS,
  ADD_LOG,
  CLEAR_LOG,
  CRM_SET_VIEW,
  CRM_SELECT_CLIENT,
  CRM_ADD_CLIENT,
  CRM_UPDATE_CLIENT,
  CRM_SET_SEARCH,
  CRM_SET_STAGE_FILTER,
  CRM_ADD_NOTE,
  CRM_ADD_TRANSACTION,
  CRM_DELETE_CLIENT,
  CRM_SET_REP_FILTER,
} from './actionTypes';

// ── Market data actions ────────────────────────────────────────────────────
export const updateQuote = (symbol, bid, ask, time) => ({
  type: UPDATE_QUOTE,
  payload: { symbol, bid, ask, time },
});

export const setActiveSymbol = (symbol) => ({
  type: SET_ACTIVE_SYMBOL,
  payload: symbol,
});

export const setCandles = (symbol, timeframe, candles) => ({
  type: SET_CANDLES,
  payload: { symbol, timeframe, candles },
});

export const addCandle = (symbol, timeframe, candle) => ({
  type: ADD_CANDLE,
  payload: { symbol, timeframe, candle },
});

export const setTimeframe = (timeframe) => ({
  type: SET_TIMEFRAME,
  payload: timeframe,
});

// ── Order actions ──────────────────────────────────────────────────────────
export const placeOrder = (order) => ({
  type: PLACE_ORDER,
  payload: order,
});

export const closeOrder = (ticket) => ({
  type: CLOSE_ORDER,
  payload: ticket,
});

export const modifyOrder = (ticket, sl, tp) => ({
  type: MODIFY_ORDER,
  payload: { ticket, sl, tp },
});

export const updateOrderProfit = (ticket, profit) => ({
  type: UPDATE_ORDER_PROFIT,
  payload: { ticket, profit },
});

// ── Account actions ────────────────────────────────────────────────────────
export const updateAccount = (accountData) => ({
  type: UPDATE_ACCOUNT,
  payload: accountData,
});

export const setLeverage = (leverage) => ({
  type: SET_LEVERAGE,
  payload: leverage,
});

// ── Connection actions ─────────────────────────────────────────────────────
export const setConnectionStatus = (status) => ({
  type: SET_CONNECTION_STATUS,
  payload: status,
});

// ── Terminal log actions ───────────────────────────────────────────────────
export const addLog = (level, message) => ({
  type: ADD_LOG,
  payload: { level, message, time: new Date().toISOString() },
});

export const clearLog = () => ({ type: CLEAR_LOG });

// ── CRM actions ────────────────────────────────────────────────────────────

export const crmSetView = (view) => ({ type: CRM_SET_VIEW, payload: view });
export const crmSelectClient = (id) => ({ type: CRM_SELECT_CLIENT, payload: id });
export const crmAddClient = (data) => ({ type: CRM_ADD_CLIENT, payload: data });
export const crmUpdateClient = (id, changes) => ({ type: CRM_UPDATE_CLIENT, payload: { id, changes } });
export const crmSetSearch = (query) => ({ type: CRM_SET_SEARCH, payload: query });
export const crmSetStageFilter = (stage) => ({ type: CRM_SET_STAGE_FILTER, payload: stage });
export const crmAddNote = (clientId, text, author) => ({ type: CRM_ADD_NOTE, payload: { clientId, text, author } });
export const crmAddTransaction = (clientId, txType, amount) => ({ type: CRM_ADD_TRANSACTION, payload: { clientId, txType, amount } });
export const crmDeleteClient = (id) => ({ type: CRM_DELETE_CLIENT, payload: id });
export const crmSetRepFilter = (rep) => ({ type: CRM_SET_REP_FILTER, payload: rep });
```

---

## Source Code — Redux Reducers

---

## src/store/reducers/accountReducer.js

```js
import { UPDATE_ACCOUNT, SET_LEVERAGE } from '../actions/actionTypes';

const initialState = {
  login: '12345678',
  name: 'VDA Demo Account',
  server: 'VDABroker-Demo',
  currency: 'USD',
  balance: 10000.0,
  equity: 10000.0,
  margin: 0.0,
  freeMargin: 10000.0,
  marginLevel: 0,
  leverage: 100,
  profit: 0.0,
};

const accountReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ACCOUNT:
      return { ...state, ...action.payload };

    case SET_LEVERAGE:
      return { ...state, leverage: action.payload };

    default:
      return state;
  }
};

export default accountReducer;
```

---

## src/store/reducers/connectionReducer.js

```js
import { SET_CONNECTION_STATUS } from '../actions/actionTypes';

const initialState = {
  status: 'disconnected', // 'connecting' | 'connected' | 'disconnected' | 'error'
  broker: '',
  pingMs: null,
};

const connectionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONNECTION_STATUS:
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

export default connectionReducer;
```

---

## src/store/reducers/crmReducer.js

```js
import {
  CRM_SET_VIEW,
  CRM_SELECT_CLIENT,
  CRM_ADD_CLIENT,
  CRM_UPDATE_CLIENT,
  CRM_SET_SEARCH,
  CRM_SET_STAGE_FILTER,
  CRM_ADD_NOTE,
  CRM_ADD_TRANSACTION,
  CRM_DELETE_CLIENT,
  CRM_SET_REP_FILTER,
} from '../actions/actionTypes';

// ── Seed data ──────────────────────────────────────────────────────────────

const SEED_CLIENTS = [
  {
    id: 'CLT001',
    firstName: 'James', lastName: 'Morrison',
    email: 'j.morrison@proton.me', phone: '+44 7700 900123',
    country: 'United Kingdom',
    stage: 'Active', kycStatus: 'verified',
    balance: 18450.20, totalDeposits: 25000, totalWithdrawals: 6500, openPL: 342.50,
    accounts: ['7100001'],
    assignedTo: 'Alice K.',
    createdAt: '2025-01-10T09:00:00Z', lastActivity: '2026-03-04T11:20:00Z',
    notes: [
      { id: 'n1', text: 'Very interested in crypto pairs.', date: '2025-02-01T10:00:00Z', author: 'Alice K.' },
    ],
    transactions: [
      { id: 't1', type: 'Deposit',    amount: 10000, date: '2025-01-15T09:00:00Z', status: 'completed' },
      { id: 't2', type: 'Deposit',    amount: 15000, date: '2025-02-01T10:00:00Z', status: 'completed' },
      { id: 't3', type: 'Withdrawal', amount: 6500,  date: '2025-03-01T10:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT002',
    firstName: 'Sarah', lastName: 'Chen',
    email: 's.chen@gmail.com', phone: '+65 9123 4567',
    country: 'Singapore',
    stage: 'Active', kycStatus: 'verified',
    balance: 52300.00, totalDeposits: 60000, totalWithdrawals: 8000, openPL: -1250.00,
    accounts: ['7100002', '7100003'],
    assignedTo: 'Bob T.',
    createdAt: '2024-11-20T08:00:00Z', lastActivity: '2026-03-05T08:00:00Z',
    notes: [],
    transactions: [
      { id: 't4', type: 'Deposit',    amount: 30000, date: '2024-12-01T09:00:00Z', status: 'completed' },
      { id: 't5', type: 'Deposit',    amount: 30000, date: '2025-01-10T09:00:00Z', status: 'completed' },
      { id: 't6', type: 'Withdrawal', amount: 8000,  date: '2025-06-01T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT003',
    firstName: 'Mohammed', lastName: 'Al-Rashid',
    email: 'm.rashid@gmail.com', phone: '+971 50 123 4567',
    country: 'UAE',
    stage: 'Funded', kycStatus: 'verified',
    balance: 5000, totalDeposits: 5000, totalWithdrawals: 0, openPL: 0,
    accounts: ['7100004'],
    assignedTo: 'Alice K.',
    createdAt: '2025-12-01T08:00:00Z', lastActivity: '2026-02-20T09:00:00Z',
    notes: [
      { id: 'n2', text: 'Follow up re gold trading strategy.', date: '2026-01-15T10:00:00Z', author: 'Alice K.' },
    ],
    transactions: [
      { id: 't7', type: 'Deposit', amount: 5000, date: '2025-12-15T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT004',
    firstName: 'Elena', lastName: 'Vasquez',
    email: 'elena.v@outlook.com', phone: '+34 612 345 678',
    country: 'Spain',
    stage: 'KYC Verified', kycStatus: 'verified',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Carol M.',
    createdAt: '2026-01-05T10:00:00Z', lastActivity: '2026-02-28T14:00:00Z',
    notes: [
      { id: 'n3', text: 'KYC approved — schedule deposit call.', date: '2026-02-28T14:00:00Z', author: 'Carol M.' },
    ],
    transactions: [],
  },
  {
    id: 'CLT005',
    firstName: 'David', lastName: 'Nakamura',
    email: 'd.nakamura@mail.com', phone: '+81 90 1234 5678',
    country: 'Japan',
    stage: 'KYC Submitted', kycStatus: 'submitted',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Bob T.',
    createdAt: '2026-02-10T08:00:00Z', lastActivity: '2026-03-01T09:30:00Z',
    notes: [],
    transactions: [],
  },
  {
    id: 'CLT006',
    firstName: 'Amara', lastName: 'Obi',
    email: 'a.obi@yahoo.com', phone: '+234 801 234 5678',
    country: 'Nigeria',
    stage: 'Contacted', kycStatus: 'pending',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Alice K.',
    createdAt: '2026-02-20T10:00:00Z', lastActivity: '2026-03-03T11:00:00Z',
    notes: [
      { id: 'n4', text: 'Called — very interested, sending KYC docs.', date: '2026-03-03T11:00:00Z', author: 'Alice K.' },
    ],
    transactions: [],
  },
  {
    id: 'CLT007',
    firstName: 'Lucas', lastName: 'Weber',
    email: 'l.weber@gmx.de', phone: '+49 170 1234567',
    country: 'Germany',
    stage: 'New Lead', kycStatus: 'pending',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Carol M.',
    createdAt: '2026-03-01T08:00:00Z', lastActivity: '2026-03-01T08:00:00Z',
    notes: [],
    transactions: [],
  },
  {
    id: 'CLT008',
    firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.s@gmail.com', phone: '+91 98765 43210',
    country: 'India',
    stage: 'Inactive', kycStatus: 'verified',
    balance: 1200, totalDeposits: 3000, totalWithdrawals: 1800, openPL: 0,
    accounts: ['7100005'],
    assignedTo: 'Bob T.',
    createdAt: '2024-08-15T09:00:00Z', lastActivity: '2025-09-10T10:00:00Z',
    notes: [
      { id: 'n5', text: 'No response to 3 calls — mark inactive.', date: '2025-09-10T10:00:00Z', author: 'Bob T.' },
    ],
    transactions: [
      { id: 't8', type: 'Deposit',    amount: 3000, date: '2024-09-01T09:00:00Z', status: 'completed' },
      { id: 't9', type: 'Withdrawal', amount: 1800, date: '2025-07-01T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT009',
    firstName: 'Oliver', lastName: 'Brown',
    email: 'o.brown@mail.co.uk', phone: '+44 7911 123456',
    country: 'United Kingdom',
    stage: 'Active', kycStatus: 'verified',
    balance: 9800, totalDeposits: 15000, totalWithdrawals: 5200, openPL: 650.00,
    accounts: ['7100006'],
    assignedTo: 'Alice K.',
    createdAt: '2025-03-01T09:00:00Z', lastActivity: '2026-03-04T15:00:00Z',
    notes: [],
    transactions: [
      { id: 't10', type: 'Deposit',    amount: 15000, date: '2025-03-10T09:00:00Z', status: 'completed' },
      { id: 't11', type: 'Withdrawal', amount: 5200,  date: '2025-12-01T09:00:00Z', status: 'completed' },
    ],
  },
  {
    id: 'CLT010',
    firstName: 'Sofia', lastName: 'Andersen',
    email: 'sofia.a@hotmail.com', phone: '+45 51 23 45 67',
    country: 'Denmark',
    stage: 'New Lead', kycStatus: 'pending',
    balance: 0, totalDeposits: 0, totalWithdrawals: 0, openPL: 0,
    accounts: [],
    assignedTo: 'Carol M.',
    createdAt: '2026-03-04T14:00:00Z', lastActivity: '2026-03-04T14:00:00Z',
    notes: [],
    transactions: [],
  },
];

// ── Initial state ──────────────────────────────────────────────────────────

const initialState = {
  activeView: 'dashboard',   // 'dashboard' | 'clients' | 'pipeline'
  selectedClientId: null,
  clients: SEED_CLIENTS,
  searchQuery: '',
  stageFilter: 'All',
  repFilter: 'All',          // 'All' | 'Alice K.' | 'Bob T.' | 'Carol M.'
};

// ── Helpers ────────────────────────────────────────────────────────────────

let nextClientNum = SEED_CLIENTS.length + 1;

// ── Reducer ────────────────────────────────────────────────────────────────

const crmReducer = (state = initialState, action) => {
  switch (action.type) {
    case CRM_SET_VIEW:
      return { ...state, activeView: action.payload, selectedClientId: null };

    case CRM_SELECT_CLIENT:
      return { ...state, selectedClientId: action.payload, activeView: 'clients' };

    case CRM_SET_SEARCH:
      return { ...state, searchQuery: action.payload };

    case CRM_SET_STAGE_FILTER:
      return { ...state, stageFilter: action.payload };

    case CRM_SET_REP_FILTER:
      return { ...state, repFilter: action.payload };

    case CRM_DELETE_CLIENT:
      return {
        ...state,
        clients: state.clients.filter((c) => c.id !== action.payload),
        selectedClientId: state.selectedClientId === action.payload ? null : state.selectedClientId,
      };

    case CRM_ADD_CLIENT: {
      const id = `CLT${String(nextClientNum++).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const newClient = {
        id,
        firstName: action.payload.firstName || '',
        lastName: action.payload.lastName || '',
        email: action.payload.email || '',
        phone: action.payload.phone || '',
        country: action.payload.country || '',
        stage: 'New Lead',
        kycStatus: 'pending',
        balance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        openPL: 0,
        accounts: [],
        assignedTo: action.payload.assignedTo || '',
        createdAt: now,
        lastActivity: now,
        notes: [],
        transactions: [],
      };
      return { ...state, clients: [...state.clients, newClient], selectedClientId: id, activeView: 'clients' };
    }

    case CRM_UPDATE_CLIENT:
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.id === action.payload.id
            ? { ...c, ...action.payload.changes, lastActivity: new Date().toISOString() }
            : c
        ),
      };

    case CRM_ADD_NOTE:
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== action.payload.clientId) return c;
          const note = {
            id: `note-${Date.now()}`,
            text: action.payload.text,
            date: new Date().toISOString(),
            author: action.payload.author || 'Agent',
          };
          return { ...c, notes: [note, ...c.notes], lastActivity: note.date };
        }),
      };

    case CRM_ADD_TRANSACTION:
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== action.payload.clientId) return c;
          const tx = {
            id: `tx-${Date.now()}`,
            type: action.payload.txType,
            amount: action.payload.amount,
            date: new Date().toISOString(),
            status: 'completed',
          };
          const totalDeposits = tx.type === 'Deposit'
            ? c.totalDeposits + tx.amount
            : c.totalDeposits;
          const totalWithdrawals = tx.type === 'Withdrawal'
            ? c.totalWithdrawals + tx.amount
            : c.totalWithdrawals;
          const balance = parseFloat((totalDeposits - totalWithdrawals).toFixed(2));
          return {
            ...c,
            transactions: [tx, ...c.transactions],
            totalDeposits,
            totalWithdrawals,
            balance,
            lastActivity: tx.date,
          };
        }),
      };

    default:
      return state;
  }
};

export default crmReducer;
```

---

## src/store/reducers/marketReducer.js

```js
import { UPDATE_QUOTE, SET_ACTIVE_SYMBOL, SET_CANDLES, ADD_CANDLE, SET_TIMEFRAME } from '../actions/actionTypes';

// Default symbols available in the terminal
const DEFAULT_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD', 'BTCUSD', 'ETHUSD'];

const initialState = {
  symbols: DEFAULT_SYMBOLS,
  quotes: DEFAULT_SYMBOLS.reduce((acc, sym) => {
    acc[sym] = { bid: 0, ask: 0, time: null, change: 0, changePercent: 0 };
    return acc;
  }, {}),
  activeSymbol: 'EURUSD',
  timeframe: 'H1',
  candles: {},   // { 'EURUSD_H1': [ { time, open, high, low, close, volume } ] }
};

const marketReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_QUOTE: {
      const { symbol, bid, ask, time } = action.payload;
      const prev = state.quotes[symbol] || {};
      const prevBid = prev.bid || bid;
      const change = bid - prevBid;
      const changePercent = prevBid !== 0 ? (change / prevBid) * 100 : 0;
      return {
        ...state,
        quotes: {
          ...state.quotes,
          [symbol]: { bid, ask, time, change, changePercent },
        },
      };
    }

    case SET_ACTIVE_SYMBOL:
      return { ...state, activeSymbol: action.payload };

    case SET_TIMEFRAME:
      return { ...state, timeframe: action.payload };

    case SET_CANDLES: {
      const { symbol, timeframe, candles } = action.payload;
      const key = `${symbol}_${timeframe}`;
      return { ...state, candles: { ...state.candles, [key]: candles } };
    }

    case ADD_CANDLE: {
      const { symbol, timeframe, candle } = action.payload;
      const key = `${symbol}_${timeframe}`;
      const existing = state.candles[key] || [];
      const last = existing[existing.length - 1];
      // If same timestamp, update the last candle; otherwise append
      const updated =
        last && last.time === candle.time
          ? [...existing.slice(0, -1), candle]
          : [...existing, candle];
      return { ...state, candles: { ...state.candles, [key]: updated } };
    }

    default:
      return state;
  }
};

export default marketReducer;
```

---

## src/store/reducers/ordersReducer.js

```js
import { PLACE_ORDER, CLOSE_ORDER, MODIFY_ORDER, UPDATE_ORDER_PROFIT } from '../actions/actionTypes';

let ticketCounter = 1000;

const initialState = {
  openOrders: [],     // market orders currently open
  pendingOrders: [],  // limit / stop orders waiting to be triggered
  history: [],        // closed orders
};

const ordersReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLACE_ORDER: {
      const order = { ...action.payload, ticket: ++ticketCounter, openTime: new Date().toISOString(), profit: 0 };
      if (order.type === 'BUY' || order.type === 'SELL') {
        return { ...state, openOrders: [...state.openOrders, order] };
      }
      return { ...state, pendingOrders: [...state.pendingOrders, order] };
    }

    case CLOSE_ORDER: {
      const ticket = action.payload;
      const order = state.openOrders.find((o) => o.ticket === ticket);
      if (!order) return state;
      const closed = { ...order, closeTime: new Date().toISOString() };
      return {
        ...state,
        openOrders: state.openOrders.filter((o) => o.ticket !== ticket),
        history: [closed, ...state.history],
      };
    }

    case MODIFY_ORDER: {
      const { ticket, sl, tp } = action.payload;
      const updateList = (list) =>
        list.map((o) => (o.ticket === ticket ? { ...o, sl, tp } : o));
      return {
        ...state,
        openOrders: updateList(state.openOrders),
        pendingOrders: updateList(state.pendingOrders),
      };
    }

    case UPDATE_ORDER_PROFIT: {
      const { ticket, profit } = action.payload;
      return {
        ...state,
        openOrders: state.openOrders.map((o) =>
          o.ticket === ticket ? { ...o, profit } : o
        ),
      };
    }

    default:
      return state;
  }
};

export default ordersReducer;
```

---

## src/store/reducers/terminalReducer.js

```js
import { ADD_LOG, CLEAR_LOG } from '../actions/actionTypes';

const MAX_LOG_ENTRIES = 500;

const initialState = {
  entries: [],
};

const terminalReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_LOG: {
      const entries = [action.payload, ...state.entries].slice(0, MAX_LOG_ENTRIES);
      return { ...state, entries };
    }

    case CLEAR_LOG:
      return { ...state, entries: [] };

    default:
      return state;
  }
};

export default terminalReducer;
```

---

## Source Code — UI Components (Trading Terminal)

---

## src/components/MarketWatch/MarketWatch.js

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveSymbol } from '../../store/actions';
import { formatPrice } from '../../utils/formatters';
import './MarketWatch.css';

const MarketWatch = () => {
  const dispatch = useDispatch();
  const { symbols, quotes, activeSymbol } = useSelector((s) => s.market);

  return (
    <div className="market-watch">
      <div className="panel-header">Market Watch</div>
      <table className="mw-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Bid</th>
            <th>Ask</th>
            <th>Chg%</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((sym) => {
            const q = quotes[sym] || {};
            const isActive = sym === activeSymbol;
            const chg = q.changePercent || 0;
            return (
              <tr
                key={sym}
                className={`mw-row${isActive ? ' active' : ''}`}
                onClick={() => dispatch(setActiveSymbol(sym))}
              >
                <td className="sym-name">{sym}</td>
                <td className="bid">{formatPrice(sym, q.bid)}</td>
                <td className="ask">{formatPrice(sym, q.ask)}</td>
                <td className={`chg ${chg >= 0 ? 'positive' : 'negative'}`}>
                  {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MarketWatch;
```

---

## src/components/Chart/Chart.js

```jsx
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTimeframe } from '../../store/actions';
import { formatPrice } from '../../utils/formatters';
import './Chart.css';

const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'];

const Chart = () => {
  const dispatch = useDispatch();
  const { activeSymbol, timeframe, candles, quotes } = useSelector((s) => s.market);
  const canvasRef = useRef(null);

  const key = `${activeSymbol}_${timeframe}`;
  const candleData = candles[key] || [];
  const quote = quotes[activeSymbol] || {};

  useEffect(() => {
    drawChart();
  }, [candleData, activeSymbol, timeframe]); // eslint-disable-line

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || candleData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const padding = { top: 20, bottom: 40, left: 10, right: 70 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const visible = candleData.slice(-120);
    const prices = visible.flatMap((c) => [c.high, c.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const candleWidth = Math.max(2, chartW / visible.length - 1);

    const toX = (i) => padding.left + i * (chartW / visible.length) + candleWidth / 2;
    const toY = (p) => padding.top + chartH - ((p - minPrice) / priceRange) * chartH;

    // Grid lines
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 0.5;
    for (let g = 0; g <= 5; g++) {
      const y = padding.top + (chartH / 5) * g;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      const price = maxPrice - (priceRange / 5) * g;
      ctx.fillStyle = '#5566aa';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatPrice(activeSymbol, price), width - padding.right + 4, y + 4);
    }

    // Candles
    visible.forEach((c, i) => {
      const x = toX(i);
      const openY = toY(c.open);
      const closeY = toY(c.close);
      const highY = toY(c.high);
      const lowY = toY(c.low);
      const isBull = c.close >= c.open;

      ctx.strokeStyle = isBull ? '#26a69a' : '#ef5350';
      ctx.fillStyle = isBull ? '#26a69a' : '#ef5350';

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(1, Math.abs(openY - closeY));
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    });

    // Current price line
    if (quote.bid) {
      const priceY = toY(quote.bid);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padding.left, priceY);
      ctx.lineTo(width - padding.right, priceY);
      ctx.stroke();
      ctx.setLineDash([]);
      // Label
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(width - padding.right, priceY - 8, padding.right, 16);
      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatPrice(activeSymbol, quote.bid), width - padding.right + 3, priceY + 4);
    }
  };

  return (
    <div className="chart-panel">
      <div className="chart-toolbar">
        <span className="chart-symbol">{activeSymbol}</span>
        <span className="chart-price bid">{formatPrice(activeSymbol, quote.bid)}</span>
        <span className="separator">/</span>
        <span className="chart-price ask">{formatPrice(activeSymbol, quote.ask)}</span>
        <div className="tf-buttons">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              className={`tf-btn${timeframe === tf ? ' active' : ''}`}
              onClick={() => dispatch(setTimeframe(tf))}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={canvasRef} width={900} height={450} className="chart-canvas" />
      </div>
    </div>
  );
};

export default Chart;
```

---

## src/components/OrderPanel/OrderPanel.js

```jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeOrder, updateAccount, addLog } from '../../store/actions';
import { formatPrice } from '../../utils/formatters';
import './OrderPanel.css';

const ORDER_TYPES = ['BUY', 'SELL', 'BUY LIMIT', 'SELL LIMIT', 'BUY STOP', 'SELL STOP'];

const LOT_SIZES = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0];

const OrderPanel = () => {
  const dispatch = useDispatch();
  const { activeSymbol, quotes } = useSelector((s) => s.market);
  const { balance, leverage } = useSelector((s) => s.account);

  const [orderType, setOrderType] = useState('BUY');
  const [lots, setLots] = useState(0.1);
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');

  const quote = quotes[activeSymbol] || {};
  const isMarket = orderType === 'BUY' || orderType === 'SELL';
  const isBuy = orderType.startsWith('BUY');

  const openPrice = isMarket
    ? (isBuy ? quote.ask : quote.bid)
    : parseFloat(price) || 0;

  const requiredMargin = openPrice
    ? parseFloat(((openPrice * lots * 100000) / leverage).toFixed(2))
    : 0;

  const canTrade = balance >= requiredMargin && openPrice > 0 && lots > 0;

  const submitOrder = (type) => {
    const isBuyType = type.startsWith('BUY');
    const execPrice = isMarket
      ? (isBuyType ? quote.ask : quote.bid)
      : parseFloat(price) || 0;

    if (!execPrice || lots <= 0) {
      dispatch(addLog('error', `Cannot place order: invalid price or lot size`));
      return;
    }

    const margin = parseFloat(((execPrice * lots * 100000) / leverage).toFixed(2));
    if (balance < margin) {
      dispatch(addLog('error', `Insufficient margin to place ${type} ${lots} ${activeSymbol}`));
      return;
    }

    const order = {
      symbol: activeSymbol,
      type,
      lots: parseFloat(lots),
      openPrice: parseFloat(execPrice.toFixed(5)),
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
      comment,
    };

    dispatch(placeOrder(order));
    dispatch(updateAccount({ margin: parseFloat(margin.toFixed(2)) }));
    dispatch(
      addLog(
        'info',
        `Order placed: ${type} ${lots} ${activeSymbol} @ ${formatPrice(activeSymbol, execPrice)}`
      )
    );
    setPrice('');
    setComment('');
  };

  return (
    <div className="order-panel">
      <div className="panel-header">New Order</div>
      <div className="op-body">
        <div className="op-row">
          <label>Symbol</label>
          <span className="op-value sym">{activeSymbol}</span>
        </div>
        <div className="op-row">
          <label>Bid / Ask</label>
          <span className="op-value">
            <span className="bid">{formatPrice(activeSymbol, quote.bid)}</span>
            {' / '}
            <span className="ask">{formatPrice(activeSymbol, quote.ask)}</span>
          </span>
        </div>

        <div className="op-divider" />

        <div className="op-row">
          <label>Order Type</label>
          <select
            className="op-select"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            {ORDER_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="op-row">
          <label>Lot Size</label>
          <input
            className="op-input"
            type="number"
            min={0.01}
            step={0.01}
            value={lots}
            onChange={(e) => setLots(e.target.value)}
          />
        </div>

        <div className="op-quick-lots">
          {LOT_SIZES.map((l) => (
            <button key={l} className="lot-btn" onClick={() => setLots(l)}>
              {l}
            </button>
          ))}
        </div>

        {!isMarket && (
          <div className="op-row">
            <label>Price</label>
            <input
              className="op-input"
              type="number"
              step="0.00001"
              placeholder={formatPrice(activeSymbol, isBuy ? quote.ask : quote.bid)}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        )}

        <div className="op-row">
          <label>Stop Loss</label>
          <input
            className="op-input"
            type="number"
            step="0.00001"
            placeholder="0"
            value={sl}
            onChange={(e) => setSl(e.target.value)}
          />
        </div>

        <div className="op-row">
          <label>Take Profit</label>
          <input
            className="op-input"
            type="number"
            step="0.00001"
            placeholder="0"
            value={tp}
            onChange={(e) => setTp(e.target.value)}
          />
        </div>

        <div className="op-row">
          <label>Comment</label>
          <input
            className="op-input"
            type="text"
            maxLength={32}
            placeholder="optional"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="op-divider" />

        <div className="op-row">
          <label>Req. Margin</label>
          <span className="op-value">${requiredMargin.toFixed(2)}</span>
        </div>
        <div className="op-row">
          <label>Open Price</label>
          <span className="op-value">{formatPrice(activeSymbol, openPrice) || '—'}</span>
        </div>

        <div className="op-actions">
          <button
            className={`op-btn buy${!canTrade ? ' disabled' : ''}`}
            onClick={() => submitOrder(isMarket ? 'BUY' : orderType)}
            disabled={!canTrade}
          >
            ▲ BUY
          </button>
          <button
            className={`op-btn sell${!canTrade ? ' disabled' : ''}`}
            onClick={() => submitOrder(isMarket ? 'SELL' : orderType)}
            disabled={!canTrade}
          >
            ▼ SELL
          </button>
        </div>
        {!canTrade && openPrice > 0 && (
          <div className="op-warn">Insufficient margin</div>
        )}
      </div>
    </div>
  );
};

export default OrderPanel;
```

---

## src/components/Positions/Positions.js

```jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeOrder, addLog, updateAccount } from '../../store/actions';
import { formatPrice, formatProfit, formatDateTime } from '../../utils/formatters';
import './Positions.css';

const TABS = ['Positions', 'Orders', 'History'];

const Positions = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('Positions');
  const { openOrders, pendingOrders, history } = useSelector((s) => s.orders);
  const { quotes } = useSelector((s) => s.market);
  const { balance } = useSelector((s) => s.account);

  const handleClose = (ticket, symbol, type, lots, openPrice) => {
    const q = quotes[symbol] || {};
    const closePrice = type === 'BUY' ? q.bid : q.ask;
    const order = openOrders.find((o) => o.ticket === ticket);
    const profit = order ? order.profit : 0;
    const newBalance = parseFloat((balance + profit).toFixed(2));
    dispatch(closeOrder(ticket));
    dispatch(updateAccount({ balance: newBalance }));
    dispatch(
      addLog('info', `Closed #${ticket} ${type} ${lots} ${symbol} @ ${formatPrice(symbol, closePrice)}, P&L: ${formatProfit(profit)}`)
    );
  };

  const totalProfit = openOrders.reduce((sum, o) => sum + (o.profit || 0), 0);

  return (
    <div className="positions-panel">
      <div className="pos-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`pos-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Positions' && openOrders.length > 0 && (
              <span className="badge">{openOrders.length}</span>
            )}
          </button>
        ))}
        <div className="pos-total">
          Float P&L:{' '}
          <span className={totalProfit >= 0 ? 'positive' : 'negative'}>
            {formatProfit(totalProfit)}
          </span>
        </div>
      </div>

      <div className="pos-table-wrap">
        {tab === 'Positions' && (
          <table className="pos-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Open Price</th>
                <th>SL</th>
                <th>TP</th>
                <th>Profit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {openOrders.length === 0 ? (
                <tr><td colSpan={9} className="empty">No open positions</td></tr>
              ) : (
                openOrders.map((o) => (
                  <tr key={o.ticket}>
                    <td>{o.ticket}</td>
                    <td className="sym">{o.symbol}</td>
                    <td className={o.type === 'BUY' ? 'buy-type' : 'sell-type'}>{o.type}</td>
                    <td>{o.lots}</td>
                    <td>{formatPrice(o.symbol, o.openPrice)}</td>
                    <td className="sl">{o.sl ? formatPrice(o.symbol, o.sl) : '—'}</td>
                    <td className="tp">{o.tp ? formatPrice(o.symbol, o.tp) : '—'}</td>
                    <td className={o.profit >= 0 ? 'positive' : 'negative'}>
                      {formatProfit(o.profit)}
                    </td>
                    <td>
                      <button
                        className="close-btn"
                        onClick={() => handleClose(o.ticket, o.symbol, o.type, o.lots, o.openPrice)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'Orders' && (
          <table className="pos-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Price</th>
                <th>SL</th>
                <th>TP</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.length === 0 ? (
                <tr><td colSpan={8} className="empty">No pending orders</td></tr>
              ) : (
                pendingOrders.map((o) => (
                  <tr key={o.ticket}>
                    <td>{o.ticket}</td>
                    <td className="sym">{o.symbol}</td>
                    <td>{o.type}</td>
                    <td>{o.lots}</td>
                    <td>{formatPrice(o.symbol, o.openPrice)}</td>
                    <td>{o.sl ? formatPrice(o.symbol, o.sl) : '—'}</td>
                    <td>{o.tp ? formatPrice(o.symbol, o.tp) : '—'}</td>
                    <td>{formatDateTime(o.openTime)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'History' && (
          <table className="pos-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Open Price</th>
                <th>Close Time</th>
                <th>Profit</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={7} className="empty">No history</td></tr>
              ) : (
                history.map((o) => (
                  <tr key={`${o.ticket}-${o.closeTime}`}>
                    <td>{o.ticket}</td>
                    <td className="sym">{o.symbol}</td>
                    <td className={o.type === 'BUY' ? 'buy-type' : 'sell-type'}>{o.type}</td>
                    <td>{o.lots}</td>
                    <td>{formatPrice(o.symbol, o.openPrice)}</td>
                    <td>{formatDateTime(o.closeTime)}</td>
                    <td className={o.profit >= 0 ? 'positive' : 'negative'}>
                      {formatProfit(o.profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Positions;
```

---

## src/components/AccountInfo/AccountInfo.js

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import './AccountInfo.css';

const AccountInfo = () => {
  const account = useSelector((s) => s.account);
  const { status, broker, pingMs } = useSelector((s) => s.connection);

  const items = [
    { label: 'Login', value: account.login },
    { label: 'Server', value: account.server },
    { label: 'Balance', value: `$${account.balance.toFixed(2)}` },
    { label: 'Equity', value: `$${account.equity.toFixed(2)}` },
    { label: 'Margin', value: `$${account.margin.toFixed(2)}` },
    { label: 'Free Margin', value: `$${account.freeMargin.toFixed(2)}` },
    {
      label: 'Margin Level',
      value: account.marginLevel > 0 ? `${account.marginLevel.toFixed(1)}%` : '—',
    },
    { label: 'Float P&L', value: `$${account.profit >= 0 ? '+' : ''}${account.profit.toFixed(2)}`, isProfit: true, profit: account.profit },
    { label: 'Leverage', value: `1:${account.leverage}` },
  ];

  return (
    <div className="account-info">
      <div className="panel-header">
        Account
        <span className={`conn-dot conn-${status}`} title={broker || status}>
          {status === 'connected' ? '●' : status === 'connecting' ? '◌' : '○'}
        </span>
        {pingMs !== null && <span className="ping">{pingMs}ms</span>}
      </div>
      <div className="ai-grid">
        {items.map(({ label, value, isProfit, profit }) => (
          <div key={label} className="ai-item">
            <span className="ai-label">{label}</span>
            <span className={`ai-value${isProfit ? (profit >= 0 ? ' positive' : ' negative') : ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="ai-footer">
        <span className={`status-${status}`}>
          {status === 'connected' ? `Connected – ${broker}` :
           status === 'connecting' ? `Connecting…` :
           status === 'error' ? 'Connection error' :
           'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default AccountInfo;
```

---

## src/components/Terminal/Terminal.js

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearLog } from '../../store/actions';
import './Terminal.css';

const LEVEL_CLASS = { info: 'log-info', warn: 'log-warn', error: 'log-error', debug: 'log-debug' };

const Terminal = () => {
  const dispatch = useDispatch();
  const entries = useSelector((s) => s.terminal.entries);

  return (
    <div className="terminal-panel">
      <div className="panel-header">
        Terminal Log
        <button className="clear-btn" onClick={() => dispatch(clearLog())}>Clear</button>
      </div>
      <div className="terminal-body">
        {entries.map((e, i) => (
          <div key={i} className={`log-entry ${LEVEL_CLASS[e.level] || ''}`}>
            <span className="log-time">{new Date(e.time).toLocaleTimeString()}</span>
            <span className="log-level">[{(e.level || 'info').toUpperCase()}]</span>
            <span className="log-msg">{e.message}</span>
          </div>
        ))}
        {entries.length === 0 && <div className="log-empty">No log entries.</div>}
      </div>
    </div>
  );
};

export default Terminal;
```

---

## Source Code — CRM Components

---

## src/components/CRM/CRMView.js

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSetView, crmSetRepFilter, crmSetStageFilter } from '../../store/actions';
import CRMDashboard from './Dashboard/CRMDashboard';
import ClientList from './Clients/ClientList';
import Pipeline from './Pipeline/Pipeline';
import './CRMView.css';

const NAV_ITEMS = [
  { view: 'dashboard', icon: '📊', label: 'Dashboard' },
  { view: 'clients',   icon: '👥', label: 'Clients'   },
  { view: 'pipeline',  icon: '🔀', label: 'Pipeline'  },
];

const CRMView = () => {
  const dispatch = useDispatch();
  const { activeView, clients, repFilter } = useSelector((s) => s.crm);

  const activeCount = clients.filter((c) => c.stage === 'Active').length;

  const REPS = ['Alice K.', 'Bob T.', 'Carol M.'];

  const handleRepClick = (rep) => {
    const next = repFilter === rep ? 'All' : rep;
    dispatch(crmSetRepFilter(next));
    dispatch(crmSetStageFilter('All'));
    dispatch(crmSetView('clients'));
  };

  return (
    <div className="crm-root">
      <div className="crm-body">
        {/* ── Left navigation ─────────────────────────── */}
        <nav className="crm-nav">
          {NAV_ITEMS.map(({ view, icon, label }) => (
            <button
              key={view}
              className={`crm-nav-item${activeView === view ? ' active' : ''}`}
              onClick={() => dispatch(crmSetView(view))}
            >
              <span className="crm-nav-icon">{icon}</span>
              {label}
              {view === 'clients' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#5566aa' }}>
                  {clients.length}
                </span>
              )}
              {view === 'dashboard' && activeCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: '#66bb6a' }}>
                  {activeCount} live
                </span>
              )}
            </button>
          ))}

          <div className="crm-nav-divider" />

          <div style={{ padding: '6px 16px', fontSize: 10, color: '#3a4a6a' }}>
            ASSIGNED TO
          </div>
          {REPS.map((rep) => {
            const count = clients.filter((c) => c.assignedTo === rep).length;
            const isActive = repFilter === rep;
            return (
              <button
                key={rep}
                className={`crm-nav-item${isActive ? ' active' : ''}`}
                style={{ fontSize: 12, paddingLeft: 20 }}
                onClick={() => handleRepClick(rep)}
              >
                <span className="crm-nav-icon" style={{ fontSize: 11 }}>👤</span>
                {rep}
                <span style={{ marginLeft: 'auto', fontSize: 10, color: isActive ? '#4fc3f7' : '#3a4a6a' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Main content ────────────────────────────── */}
        <div className="crm-content">
          {activeView === 'dashboard' && <CRMDashboard />}
          {activeView === 'clients'   && <ClientList />}
          {activeView === 'pipeline'  && <Pipeline />}
        </div>
      </div>
    </div>
  );
};

export default CRMView;
```

---

## src/components/CRM/CRMDashboard.js

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient } from '../../../store/actions';
import './CRMDashboard.css';

const STAGES = ['New Lead', 'Contacted', 'KYC Submitted', 'KYC Verified', 'Funded', 'Active', 'Inactive'];

const STAGE_COLORS = {
  'New Lead':      '#5566aa',
  'Contacted':     '#4fc3f7',
  'KYC Submitted': '#ffa726',
  'KYC Verified':  '#ab47bc',
  'Funded':        '#29b6f6',
  'Active':        '#66bb6a',
  'Inactive':      '#ef5350',
};

const fmt = (n) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

const CRMDashboard = () => {
  const dispatch = useDispatch();
  const { clients } = useSelector((s) => s.crm);

  const totalClients      = clients.length;
  const activeClients     = clients.filter((c) => c.stage === 'Active').length;
  const totalDeposits     = clients.reduce((s, c) => s + c.totalDeposits, 0);
  const totalWithdrawals  = clients.reduce((s, c) => s + c.totalWithdrawals, 0);
  const netDeposits       = totalDeposits - totalWithdrawals;
  const totalOpenPL       = clients.reduce((s, c) => s + (c.openPL || 0), 0);
  // Conversion rate = Active ÷ all clients who entered the funnel (excluding Inactive)
  const funnelClients     = clients.filter((c) => c.stage !== 'Inactive').length;
  const conversionRate    = funnelClients > 0 ? ((activeClients / funnelClients) * 100).toFixed(1) : '0.0';

  // Stage counts
  const stageCounts = Object.fromEntries(STAGES.map((s) => [s, 0]));
  clients.forEach((c) => { if (stageCounts[c.stage] !== undefined) stageCounts[c.stage]++; });
  const maxStageCount = Math.max(...Object.values(stageCounts), 1);

  // Top 5 clients by balance
  const topClients = [...clients]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  // Recent activity — last 5 notes across all clients
  const recentNotes = clients
    .flatMap((c) => c.notes.map((n) => ({ ...n, clientName: `${c.firstName} ${c.lastName}`, clientId: c.id })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="crm-dash">
      {/* ── Stat cards ─────────────────────────────── */}
      <div className="dash-stats">
        <div className="stat-card">
          <span className="stat-card-label">Total Clients</span>
          <span className="stat-card-value accent">{totalClients}</span>
          <span className="stat-card-sub">{activeClients} active</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Total Deposits</span>
          <span className="stat-card-value positive">{fmt(totalDeposits)}</span>
          <span className="stat-card-sub">all time</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Total Withdrawals</span>
          <span className="stat-card-value">{fmt(totalWithdrawals)}</span>
          <span className="stat-card-sub">all time</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Net Funds</span>
          <span className={`stat-card-value ${netDeposits >= 0 ? 'positive' : ''}`}>{fmt(netDeposits)}</span>
          <span className="stat-card-sub">deposits − withdrawals</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Open P&amp;L</span>
          <span className={`stat-card-value ${totalOpenPL >= 0 ? 'positive' : 'negative'}`}>
            {totalOpenPL >= 0 ? '+' : ''}{fmt(Math.abs(totalOpenPL))}
          </span>
          <span className="stat-card-sub">across all accounts</span>
        </div>
        <div className="stat-card">
          <span className="stat-card-label">Conversion Rate</span>
          <span className="stat-card-value accent">{conversionRate}%</span>
          <span className="stat-card-sub">leads → active</span>
        </div>
      </div>

      {/* ── Two-column section ──────────────────────── */}
      <div className="dash-grid">
        {/* Stage breakdown */}
        <div className="dash-panel">
          <div className="dash-panel-header">Pipeline Stages</div>
          <div className="dash-panel-body">
            {STAGES.map((stage) => (
              <div key={stage} className="stage-row">
                <span className="stage-label">{stage}</span>
                <div className="stage-bar-wrap">
                  <div
                    className="stage-bar-fill"
                    style={{
                      width: `${(stageCounts[stage] / maxStageCount) * 100}%`,
                      background: STAGE_COLORS[stage],
                    }}
                  />
                </div>
                <span className="stage-count">{stageCounts[stage]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top clients by balance */}
        <div className="dash-panel">
          <div className="dash-panel-header">Top Clients by Balance</div>
          <div className="dash-panel-body">
            <table className="top-clients-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Balance</th>
                  <th>Float P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {topClients.map((c) => (
                  <tr
                    key={c.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => dispatch(crmSelectClient(c.id))}
                  >
                    <td>{c.firstName} {c.lastName}</td>
                    <td className="positive">{fmt(c.balance)}</td>
                    <td className={c.openPL >= 0 ? 'positive' : 'negative'}>
                      {c.openPL >= 0 ? '+' : ''}{fmt(Math.abs(c.openPL))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent activity */}
        <div className="dash-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="dash-panel-header">Recent Activity</div>
          <div className="dash-panel-body">
            {recentNotes.length === 0 ? (
              <div style={{ padding: '12px', color: '#5566aa', fontSize: 12 }}>No recent activity</div>
            ) : (
              <table className="top-clients-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Note</th>
                    <th>Author</th>
                  </tr>
                </thead>
                <tbody>
                  {recentNotes.map((n) => (
                    <tr
                      key={n.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => dispatch(crmSelectClient(n.clientId))}
                    >
                      <td style={{ whiteSpace: 'nowrap', color: '#5566aa' }}>
                        {new Date(n.date).toLocaleDateString()}
                      </td>
                      <td>{n.clientName}</td>
                      <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.text}</td>
                      <td style={{ color: '#5566aa' }}>{n.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMDashboard;
```

---

## src/components/CRM/ClientList.js

```jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient, crmSetSearch, crmSetStageFilter, crmAddClient, crmDeleteClient, crmSetRepFilter } from '../../../store/actions';
import ClientProfile from './ClientProfile';
import './ClientList.css';

const STAGES_FILTER = ['All', 'New Lead', 'Contacted', 'KYC Submitted', 'KYC Verified', 'Funded', 'Active', 'Inactive'];

const stageBadgeClass = (stage) =>
  'badge badge-' + stage.replace(/\s+/g, '-');

const kycBadgeClass = (kyc) =>
  `badge badge-kyc-${kyc}`;

const ClientList = () => {
  const dispatch = useDispatch();
  const { clients, searchQuery, stageFilter, repFilter, selectedClientId } = useSelector((s) => s.crm);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: '', assignedTo: 'Alice K.',
  });

  // ── Filter & search ──
  const filtered = clients.filter((c) => {
    const matchStage = stageFilter === 'All' || c.stage === stageFilter;
    const matchRep   = repFilter === 'All' || c.assignedTo === repFilter;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    return matchStage && matchRep && matchSearch;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newClient.firstName || !newClient.lastName) return;
    dispatch(crmAddClient(newClient));
    setNewClient({ firstName: '', lastName: '', email: '', phone: '', country: '', assignedTo: 'Alice K.' });
    setShowAddModal(false);
  };

  // ── If a client is selected, show the profile ──
  if (selectedClientId) {
    return <ClientProfile />;
  }

  return (
    <div className="client-list">
      {/* ── Toolbar ── */}
      <div className="cl-toolbar">
        <input
          className="cl-search"
          placeholder="Search name, email, country…"
          value={searchQuery}
          onChange={(e) => dispatch(crmSetSearch(e.target.value))}
        />
        <select
          className="cl-filter"
          value={stageFilter}
          onChange={(e) => dispatch(crmSetStageFilter(e.target.value))}
        >
          {STAGES_FILTER.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="cl-add-btn" onClick={() => setShowAddModal(true)}>
          + Add Client
        </button>
      </div>

      {/* ── Table ── */}
      <div className="cl-table-wrap">
        <table className="cl-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Country</th>
              <th>Stage</th>
              <th>KYC</th>
              <th>Balance</th>
              <th>Assigned</th>
              <th>Last Activity</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="cl-empty">No clients match the current filter.</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="cl-row"
                  onClick={() => dispatch(crmSelectClient(c.id))}
                >
                  <td style={{ color: '#5566aa' }}>{c.id}</td>
                  <td><strong>{c.firstName} {c.lastName}</strong></td>
                  <td style={{ color: '#8899bb' }}>{c.email}</td>
                  <td>{c.country}</td>
                  <td><span className={stageBadgeClass(c.stage)}>{c.stage}</span></td>
                  <td><span className={kycBadgeClass(c.kycStatus)}>{c.kycStatus}</span></td>
                  <td className={c.balance > 0 ? 'positive' : ''}>
                    {c.balance > 0 ? `$${c.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td style={{ color: '#5566aa' }}>{c.assignedTo}</td>
                  <td style={{ color: '#5566aa' }}>
                    {new Date(c.lastActivity).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="cl-delete-btn"
                      title="Delete client"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete ${c.firstName} ${c.lastName}?`)) {
                          dispatch(crmDeleteClient(c.id));
                        }
                      }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add Client Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Client</h3>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-row">
                <div className="modal-field">
                  <label>First Name *</label>
                  <input
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="modal-field">
                  <label>Last Name *</label>
                  <input
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-field">
                <label>Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Phone</label>
                  <input
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>
                <div className="modal-field">
                  <label>Country</label>
                  <input
                    value={newClient.country}
                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-field">
                <label>Assigned To</label>
                <select
                  value={newClient.assignedTo}
                  onChange={(e) => setNewClient({ ...newClient, assignedTo: e.target.value })}
                >
                  <option>Alice K.</option>
                  <option>Bob T.</option>
                  <option>Carol M.</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;
```

---

## src/components/CRM/ClientProfile.js

```jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient, crmUpdateClient, crmAddNote, crmAddTransaction } from '../../../store/actions';
import './ClientList.css';
import './ClientProfile.css';

const STAGES = ['New Lead', 'Contacted', 'KYC Submitted', 'KYC Verified', 'Funded', 'Active', 'Inactive'];
const KYC_STATUSES = ['pending', 'submitted', 'verified', 'rejected'];
const TABS = ['Overview', 'Accounts', 'Transactions', 'Notes'];

const stageBadgeClass = (stage) =>
  'badge badge-' + stage.replace(/\s+/g, '-');

const kycBadgeClass = (kyc) =>
  `badge badge-kyc-${kyc}`;

const fmt = (n) =>
  `$${(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

const ClientProfile = () => {
  const dispatch = useDispatch();
  const { clients, selectedClientId } = useSelector((s) => s.crm);
  const client = clients.find((c) => c.id === selectedClientId);

  const [tab, setTab] = useState('Overview');
  const [noteText, setNoteText] = useState('');
  const [txType, setTxType] = useState('Deposit');
  const [txAmount, setTxAmount] = useState('');

  if (!client) return null;

  const handleStageChange = (e) =>
    dispatch(crmUpdateClient(client.id, { stage: e.target.value }));

  const handleKycChange = (e) =>
    dispatch(crmUpdateClient(client.id, { kycStatus: e.target.value }));

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    dispatch(crmAddNote(client.id, noteText.trim(), 'Agent'));
    setNoteText('');
  };

  const handleTxSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (!amt || amt <= 0) return;
    dispatch(crmAddTransaction(client.id, txType, amt));
    setTxAmount('');
  };

  return (
    <div className="client-profile">
      {/* ── Header ── */}
      <div className="cp-header">
        <button className="cp-back-btn" onClick={() => dispatch(crmSelectClient(null))}>
          ← Back
        </button>
        <div>
          <div className="cp-name">{client.firstName} {client.lastName}</div>
          <div className="cp-id">{client.id}</div>
        </div>
        <div className="cp-header-badges">
          <span className={stageBadgeClass(client.stage)}>{client.stage}</span>
          <span className={kycBadgeClass(client.kycStatus)}>KYC: {client.kycStatus}</span>
        </div>
        <span className="cp-assigned">👤 {client.assignedTo}</span>
      </div>

      {/* ── Tabs ── */}
      <div className="cp-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`cp-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Notes'        && client.notes.length > 0        && ` (${client.notes.length})`}
            {t === 'Transactions' && client.transactions.length > 0 && ` (${client.transactions.length})`}
            {t === 'Accounts'     && client.accounts.length > 0     && ` (${client.accounts.length})`}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="cp-tab-content">
        {tab === 'Overview' && (
          <div className="cp-overview-grid">
            {/* Contact info */}
            <div className="cp-section">
              <div className="cp-section-title">Contact Information</div>
              <div className="cp-kv"><span className="cp-kv-label">Email</span>    <span className="cp-kv-val">{client.email || '—'}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Phone</span>    <span className="cp-kv-val">{client.phone || '—'}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Country</span>  <span className="cp-kv-val">{client.country || '—'}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Created</span>  <span className="cp-kv-val">{new Date(client.createdAt).toLocaleDateString()}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Last Active</span><span className="cp-kv-val">{new Date(client.lastActivity).toLocaleDateString()}</span></div>
            </div>

            {/* Financials */}
            <div className="cp-section">
              <div className="cp-section-title">Financials</div>
              <div className="cp-kv"><span className="cp-kv-label">Balance</span>          <span className="cp-kv-val positive">{fmt(client.balance)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Total Deposits</span>   <span className="cp-kv-val">{fmt(client.totalDeposits)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Total Withdrawals</span><span className="cp-kv-val">{fmt(client.totalWithdrawals)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Net Deposits</span>     <span className={`cp-kv-val ${client.totalDeposits - client.totalWithdrawals >= 0 ? 'positive' : 'negative'}`}>{fmt(client.totalDeposits - client.totalWithdrawals)}</span></div>
              <div className="cp-kv"><span className="cp-kv-label">Float P&amp;L</span>    <span className={`cp-kv-val ${client.openPL >= 0 ? 'positive' : 'negative'}`}>{fmt(Math.abs(client.openPL))} {client.openPL >= 0 ? '↑' : '↓'}</span></div>
            </div>

            {/* Status controls */}
            <div className="cp-section">
              <div className="cp-section-title">Status Management</div>
              <div className="cp-kv">
                <span className="cp-kv-label">Pipeline Stage</span>
                <select className="cp-stage-select" value={client.stage} onChange={handleStageChange}>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="cp-kv">
                <span className="cp-kv-label">KYC Status</span>
                <select className="cp-kyc-select" value={client.kycStatus} onChange={handleKycChange}>
                  {KYC_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="cp-kv">
                <span className="cp-kv-label">Assigned To</span>
                <select
                  className="cp-stage-select"
                  value={client.assignedTo}
                  onChange={(e) => dispatch(crmUpdateClient(client.id, { assignedTo: e.target.value }))}
                >
                  {['Alice K.', 'Bob T.', 'Carol M.'].map((rep) => (
                    <option key={rep} value={rep}>{rep}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Record transaction */}
            <div className="cp-section">
              <div className="cp-section-title">Record Transaction</div>
              <form onSubmit={handleTxSubmit}>
                <div className="cp-kv" style={{ borderBottom: 'none', gap: 8, flexWrap: 'wrap' }}>
                  <select
                    className="cp-stage-select"
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    style={{ width: 110 }}
                  >
                    <option value="Deposit">Deposit</option>
                    <option value="Withdrawal">Withdrawal</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Amount ($)"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    style={{
                      flex: 1,
                      background: '#1a1a2e',
                      border: '1px solid #2a2a4a',
                      color: '#c8d0e0',
                      padding: '4px 8px',
                      fontSize: 12,
                      borderRadius: 4,
                      outline: 'none',
                    }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '4px 14px' }}>
                    Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === 'Accounts' && (
          <div>
            <div style={{ fontSize: 12, color: '#5566aa', marginBottom: 12 }}>
              MT4 trading accounts linked to this client.
            </div>
            {client.accounts.length === 0 ? (
              <div className="cp-no-accounts">No trading accounts linked yet.</div>
            ) : (
              client.accounts.map((acc) => (
                <div key={acc} className="cp-account-item">
                  <span className="cp-account-icon">💼</span>
                  <span>MT4 Account: <strong>{acc}</strong></span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'Transactions' && (
          <table className="cp-tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {client.transactions.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 14, color: '#5566aa' }}>No transactions yet.</td></tr>
              ) : (
                client.transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: '#5566aa' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td className={tx.type.toLowerCase()}>{tx.type}</td>
                    <td className={tx.type === 'Deposit' ? 'deposit' : 'withdrawal'}>
                      {tx.type === 'Deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                    <td className={tx.status}>{tx.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {tab === 'Notes' && (
          <div>
            <form className="cp-note-form" onSubmit={handleNoteSubmit}>
              <textarea
                className="cp-note-input"
                placeholder="Add a note…"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <button type="submit" className="cp-note-submit">Add Note</button>
            </form>
            {client.notes.length === 0 ? (
              <div className="cp-no-notes">No notes yet.</div>
            ) : (
              client.notes.map((n) => (
                <div key={n.id} className="cp-note-item">
                  <div className="cp-note-meta">
                    {n.author} · {new Date(n.date).toLocaleString()}
                  </div>
                  <div className="cp-note-text">{n.text}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfile;
```

---

## src/components/CRM/Pipeline.js

```jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { crmSelectClient } from '../../../store/actions';
import './Pipeline.css';

const STAGES = [
  { key: 'New Lead',      color: '#5566aa', border: '#5566aa' },
  { key: 'Contacted',     color: '#4fc3f7', border: '#4fc3f7' },
  { key: 'KYC Submitted', color: '#ffa726', border: '#ffa726' },
  { key: 'KYC Verified',  color: '#ce93d8', border: '#ab47bc' },
  { key: 'Funded',        color: '#29b6f6', border: '#29b6f6' },
  { key: 'Active',        color: '#66bb6a', border: '#66bb6a' },
  { key: 'Inactive',      color: '#ef5350', border: '#ef5350' },
];

const Pipeline = () => {
  const dispatch = useDispatch();
  const { clients } = useSelector((s) => s.crm);

  const byStage = Object.fromEntries(
    STAGES.map(({ key }) => [key, clients.filter((c) => c.stage === key)])
  );

  return (
    <div className="pipeline">
      <div className="pipeline-header">
        Sales Pipeline · {clients.length} total client{clients.length !== 1 ? 's' : ''}
      </div>

      <div className="pipeline-board">
        {STAGES.map(({ key, color, border }) => {
          const colClients = byStage[key];
          return (
            <div key={key} className="pipeline-col">
              <div
                className="pipeline-col-header"
                style={{ color, borderBottomColor: border }}
              >
                <span>{key}</span>
                <span className="pipeline-col-count" style={{ color }}>{colClients.length}</span>
              </div>
              <div className="pipeline-cards">
                {colClients.length === 0 ? (
                  <div className="pipeline-empty">No clients</div>
                ) : (
                  colClients.map((c) => (
                    <div
                      key={c.id}
                      className="pipeline-card"
                      onClick={() => dispatch(crmSelectClient(c.id))}
                    >
                      <div className="pc-name">{c.firstName} {c.lastName}</div>
                      <div className="pc-country">{c.country}</div>
                      <div className="pc-footer">
                        <span className="pc-balance">
                          {c.balance > 0
                            ? `$${c.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                            : 'No funds'}
                        </span>
                        <span className={`pc-kyc pc-kyc-${c.kycStatus}`}>{c.kycStatus}</span>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span className="pc-assigned">{c.assignedTo}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;
```

---

## Tests

---

## src/__tests__/crmReducer.test.js

```js
import crmReducer from '../store/reducers/crmReducer';
import {
  CRM_SET_VIEW,
  CRM_SELECT_CLIENT,
  CRM_ADD_CLIENT,
  CRM_UPDATE_CLIENT,
  CRM_SET_SEARCH,
  CRM_SET_STAGE_FILTER,
  CRM_ADD_NOTE,
  CRM_ADD_TRANSACTION,
  CRM_DELETE_CLIENT,
  CRM_SET_REP_FILTER,
} from '../store/actions/actionTypes';

describe('crmReducer', () => {
  const initial = crmReducer(undefined, {});

  it('returns default state', () => {
    expect(initial.activeView).toBe('dashboard');
    expect(initial.selectedClientId).toBeNull();
    expect(Array.isArray(initial.clients)).toBe(true);
    expect(initial.clients.length).toBeGreaterThan(0);
    expect(initial.searchQuery).toBe('');
    expect(initial.stageFilter).toBe('All');
    expect(initial.repFilter).toBe('All');
  });

  it('handles CRM_SET_VIEW', () => {
    const state = crmReducer(initial, { type: CRM_SET_VIEW, payload: 'clients' });
    expect(state.activeView).toBe('clients');
    expect(state.selectedClientId).toBeNull();
  });

  it('CRM_SET_VIEW resets selectedClientId', () => {
    const withSelected = { ...initial, selectedClientId: 'CLT001' };
    const state = crmReducer(withSelected, { type: CRM_SET_VIEW, payload: 'pipeline' });
    expect(state.selectedClientId).toBeNull();
  });

  it('handles CRM_SELECT_CLIENT', () => {
    const state = crmReducer(initial, { type: CRM_SELECT_CLIENT, payload: 'CLT002' });
    expect(state.selectedClientId).toBe('CLT002');
    expect(state.activeView).toBe('clients');
  });

  it('handles CRM_SET_SEARCH', () => {
    const state = crmReducer(initial, { type: CRM_SET_SEARCH, payload: 'James' });
    expect(state.searchQuery).toBe('James');
  });

  it('handles CRM_SET_STAGE_FILTER', () => {
    const state = crmReducer(initial, { type: CRM_SET_STAGE_FILTER, payload: 'Active' });
    expect(state.stageFilter).toBe('Active');
  });

  it('handles CRM_ADD_CLIENT', () => {
    const payload = {
      firstName: 'Test', lastName: 'User', email: 'test@example.com',
      phone: '+1 555 000 0000', country: 'USA', assignedTo: 'Alice K.',
    };
    const state = crmReducer(initial, { type: CRM_ADD_CLIENT, payload });
    expect(state.clients.length).toBe(initial.clients.length + 1);
    const added = state.clients.find((c) => c.email === 'test@example.com');
    expect(added).toBeDefined();
    expect(added.firstName).toBe('Test');
    expect(added.stage).toBe('New Lead');
    expect(added.kycStatus).toBe('pending');
    expect(added.balance).toBe(0);
    expect(added.id).toMatch(/^CLT\d+$/);
    expect(state.selectedClientId).toBe(added.id);
    expect(state.activeView).toBe('clients');
  });

  it('handles CRM_UPDATE_CLIENT', () => {
    const state = crmReducer(initial, {
      type: CRM_UPDATE_CLIENT,
      payload: { id: 'CLT001', changes: { stage: 'Inactive', kycStatus: 'rejected' } },
    });
    const client = state.clients.find((c) => c.id === 'CLT001');
    expect(client.stage).toBe('Inactive');
    expect(client.kycStatus).toBe('rejected');
    // other fields unchanged
    expect(client.firstName).toBe('James');
  });

  it('CRM_UPDATE_CLIENT updates lastActivity', () => {
    const before = initial.clients.find((c) => c.id === 'CLT001').lastActivity;
    const state = crmReducer(initial, {
      type: CRM_UPDATE_CLIENT,
      payload: { id: 'CLT001', changes: { stage: 'Active' } },
    });
    const after = state.clients.find((c) => c.id === 'CLT001').lastActivity;
    expect(after).not.toBe(before);
  });

  it('handles CRM_ADD_NOTE', () => {
    const state = crmReducer(initial, {
      type: CRM_ADD_NOTE,
      payload: { clientId: 'CLT001', text: 'Follow-up scheduled.', author: 'Bob T.' },
    });
    const client = state.clients.find((c) => c.id === 'CLT001');
    expect(client.notes[0].text).toBe('Follow-up scheduled.');
    expect(client.notes[0].author).toBe('Bob T.');
    expect(client.notes[0].id).toBeDefined();
    expect(client.notes[0].date).toBeDefined();
  });

  it('CRM_ADD_NOTE prepends new note', () => {
    const stateWith = crmReducer(initial, {
      type: CRM_ADD_NOTE,
      payload: { clientId: 'CLT001', text: 'First note.', author: 'Alice K.' },
    });
    const stateWith2 = crmReducer(stateWith, {
      type: CRM_ADD_NOTE,
      payload: { clientId: 'CLT001', text: 'Second note.', author: 'Alice K.' },
    });
    const notes = stateWith2.clients.find((c) => c.id === 'CLT001').notes;
    expect(notes[0].text).toBe('Second note.');
  });

  it('handles CRM_ADD_TRANSACTION (Deposit)', () => {
    const state = crmReducer(initial, {
      type: CRM_ADD_TRANSACTION,
      payload: { clientId: 'CLT007', txType: 'Deposit', amount: 5000 },
    });
    const client = state.clients.find((c) => c.id === 'CLT007');
    expect(client.transactions[0].type).toBe('Deposit');
    expect(client.transactions[0].amount).toBe(5000);
    expect(client.transactions[0].status).toBe('completed');
    expect(client.totalDeposits).toBe(5000);
    expect(client.totalWithdrawals).toBe(0);
    expect(client.balance).toBe(5000);
  });

  it('handles CRM_ADD_TRANSACTION (Withdrawal)', () => {
    const state = crmReducer(initial, {
      type: CRM_ADD_TRANSACTION,
      payload: { clientId: 'CLT001', txType: 'Withdrawal', amount: 2000 },
    });
    const client = state.clients.find((c) => c.id === 'CLT001');
    expect(client.transactions[0].type).toBe('Withdrawal');
    expect(client.transactions[0].amount).toBe(2000);
    expect(client.totalWithdrawals).toBe(8500); // 6500 + 2000
    expect(client.balance).toBe(client.totalDeposits - client.totalWithdrawals);
  });

  it('does not mutate state on unknown action', () => {
    const state = crmReducer(initial, { type: '@@UNKNOWN' });
    expect(state).toBe(initial);
  });

  it('handles CRM_SET_REP_FILTER', () => {
    const state = crmReducer(initial, { type: CRM_SET_REP_FILTER, payload: 'Alice K.' });
    expect(state.repFilter).toBe('Alice K.');
  });

  it('handles CRM_DELETE_CLIENT', () => {
    const state = crmReducer(initial, { type: CRM_DELETE_CLIENT, payload: 'CLT001' });
    expect(state.clients.find((c) => c.id === 'CLT001')).toBeUndefined();
    expect(state.clients.length).toBe(initial.clients.length - 1);
  });

  it('CRM_DELETE_CLIENT clears selectedClientId when deleting selected client', () => {
    const withSelected = { ...initial, selectedClientId: 'CLT001' };
    const state = crmReducer(withSelected, { type: CRM_DELETE_CLIENT, payload: 'CLT001' });
    expect(state.selectedClientId).toBeNull();
  });

  it('CRM_DELETE_CLIENT preserves selectedClientId when deleting a different client', () => {
    const withSelected = { ...initial, selectedClientId: 'CLT002' };
    const state = crmReducer(withSelected, { type: CRM_DELETE_CLIENT, payload: 'CLT001' });
    expect(state.selectedClientId).toBe('CLT002');
  });

  it('seed data contains expected client ids', () => {
    const ids = initial.clients.map((c) => c.id);
    expect(ids).toContain('CLT001');
    expect(ids).toContain('CLT010');
  });

  it('seed data has Active clients with non-zero balance', () => {
    const active = initial.clients.filter((c) => c.stage === 'Active');
    expect(active.length).toBeGreaterThan(0);
    active.forEach((c) => expect(c.totalDeposits).toBeGreaterThan(0));
  });
});
```

---

## src/__tests__/formatters.test.js

```js
import { formatPrice, formatProfit, formatDateTime } from '../utils/formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('formats EURUSD to 5 decimal places', () => {
      expect(formatPrice('EURUSD', 1.08501)).toBe('1.08501');
    });

    it('formats USDJPY to 3 decimal places', () => {
      expect(formatPrice('USDJPY', 149.503)).toBe('149.503');
    });

    it('formats XAUUSD to 2 decimal places', () => {
      expect(formatPrice('XAUUSD', 2020.5)).toBe('2020.50');
    });

    it('returns dash for null price', () => {
      expect(formatPrice('EURUSD', null)).toBe('—');
    });

    it('handles price of 0', () => {
      expect(formatPrice('EURUSD', 0)).toBe('0.00000');
    });
  });

  describe('formatProfit', () => {
    it('adds + prefix for positive values', () => {
      expect(formatProfit(123.45)).toBe('+123.45');
    });

    it('shows negative sign for negative values', () => {
      expect(formatProfit(-50.1)).toBe('-50.10');
    });

    it('returns dash for undefined', () => {
      expect(formatProfit(undefined)).toBe('—');
    });

    it('shows 0 as positive', () => {
      expect(formatProfit(0)).toBe('+0.00');
    });
  });

  describe('formatDateTime', () => {
    it('returns empty string for null', () => {
      expect(formatDateTime(null)).toBe('');
    });

    it('returns a non-empty string for a valid ISO string', () => {
      const result = formatDateTime('2024-01-15T10:30:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
```

---

## src/__tests__/marketSimulator.test.js

```js
import { generateSimulatedCandles, simulateNextCandle } from '../utils/marketSimulator';

describe('marketSimulator', () => {
  describe('generateSimulatedCandles', () => {
    it('generates the requested number of candles', () => {
      const candles = generateSimulatedCandles('EURUSD', 'H1', 100);
      expect(candles).toHaveLength(100);
    });

    it('each candle has required OHLCV fields', () => {
      const candles = generateSimulatedCandles('GBPUSD', 'M15', 10);
      candles.forEach((c) => {
        expect(typeof c.time).toBe('number');
        expect(typeof c.open).toBe('number');
        expect(typeof c.high).toBe('number');
        expect(typeof c.low).toBe('number');
        expect(typeof c.close).toBe('number');
        expect(typeof c.volume).toBe('number');
      });
    });

    it('high >= open, close and low <= open, close', () => {
      const candles = generateSimulatedCandles('EURUSD', 'H1', 50);
      candles.forEach((c) => {
        expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close) - 0.0001);
        expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close) + 0.0001);
      });
    });

    it('candle timestamps are sequential and spaced by timeframe', () => {
      const candles = generateSimulatedCandles('USDJPY', 'H1', 5);
      for (let i = 1; i < candles.length; i++) {
        expect(candles[i].time - candles[i - 1].time).toBe(3600);
      }
    });
  });

  describe('simulateNextCandle', () => {
    it('returns newCandle and quote objects', () => {
      const candles = generateSimulatedCandles('EURUSD', 'H1', 10);
      const result = simulateNextCandle('EURUSD', 'H1', candles);
      expect(result).toHaveProperty('newCandle');
      expect(result).toHaveProperty('quote');
    });

    it('quote has bid, ask and time', () => {
      const candles = generateSimulatedCandles('XAUUSD', 'H1', 10);
      const { quote } = simulateNextCandle('XAUUSD', 'H1', candles);
      expect(typeof quote.bid).toBe('number');
      expect(typeof quote.ask).toBe('number');
      expect(typeof quote.time).toBe('string');
    });

    it('ask is greater than bid (positive spread)', () => {
      const candles = generateSimulatedCandles('BTCUSD', 'H1', 10);
      const { quote } = simulateNextCandle('BTCUSD', 'H1', candles);
      expect(quote.ask).toBeGreaterThan(quote.bid);
    });
  });
});
```

---

## src/__tests__/reducers.test.js

```js
import marketReducer from '../store/reducers/marketReducer';
import ordersReducer from '../store/reducers/ordersReducer';
import accountReducer from '../store/reducers/accountReducer';
import { UPDATE_QUOTE, SET_ACTIVE_SYMBOL, SET_TIMEFRAME, PLACE_ORDER, CLOSE_ORDER, UPDATE_ACCOUNT } from '../store/actions/actionTypes';

describe('marketReducer', () => {
  const initial = marketReducer(undefined, {});

  it('returns default state', () => {
    expect(initial.activeSymbol).toBe('EURUSD');
    expect(initial.timeframe).toBe('H1');
    expect(Array.isArray(initial.symbols)).toBe(true);
  });

  it('handles UPDATE_QUOTE', () => {
    const state = marketReducer(initial, {
      type: UPDATE_QUOTE,
      payload: { symbol: 'EURUSD', bid: 1.0850, ask: 1.0851, time: '2024-01-01T00:00:00Z' },
    });
    expect(state.quotes['EURUSD'].bid).toBe(1.0850);
    expect(state.quotes['EURUSD'].ask).toBe(1.0851);
  });

  it('handles SET_ACTIVE_SYMBOL', () => {
    const state = marketReducer(initial, { type: SET_ACTIVE_SYMBOL, payload: 'GBPUSD' });
    expect(state.activeSymbol).toBe('GBPUSD');
  });

  it('handles SET_TIMEFRAME', () => {
    const state = marketReducer(initial, { type: SET_TIMEFRAME, payload: 'M5' });
    expect(state.timeframe).toBe('M5');
  });
});

describe('ordersReducer', () => {
  const initial = ordersReducer(undefined, {});

  it('returns default empty state', () => {
    expect(initial.openOrders).toHaveLength(0);
    expect(initial.pendingOrders).toHaveLength(0);
    expect(initial.history).toHaveLength(0);
  });

  it('handles PLACE_ORDER (market BUY)', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085, sl: null, tp: null };
    const state = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    expect(state.openOrders).toHaveLength(1);
    expect(state.openOrders[0].symbol).toBe('EURUSD');
    expect(state.openOrders[0].ticket).toBeDefined();
  });

  it('handles PLACE_ORDER (pending BUY LIMIT)', () => {
    const order = { symbol: 'EURUSD', type: 'BUY LIMIT', lots: 0.1, openPrice: 1.080 };
    const state = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    expect(state.pendingOrders).toHaveLength(1);
    expect(state.openOrders).toHaveLength(0);
  });

  it('handles CLOSE_ORDER', () => {
    const order = { symbol: 'EURUSD', type: 'BUY', lots: 0.1, openPrice: 1.085 };
    const stateWithOrder = ordersReducer(initial, { type: PLACE_ORDER, payload: order });
    const ticket = stateWithOrder.openOrders[0].ticket;
    const closedState = ordersReducer(stateWithOrder, { type: CLOSE_ORDER, payload: ticket });
    expect(closedState.openOrders).toHaveLength(0);
    expect(closedState.history).toHaveLength(1);
  });
});

describe('accountReducer', () => {
  const initial = accountReducer(undefined, {});

  it('returns default state', () => {
    expect(initial.balance).toBe(10000.0);
    expect(initial.leverage).toBe(100);
    expect(initial.currency).toBe('USD');
  });

  it('handles UPDATE_ACCOUNT', () => {
    const state = accountReducer(initial, {
      type: UPDATE_ACCOUNT,
      payload: { balance: 12000, equity: 12500 },
    });
    expect(state.balance).toBe(12000);
    expect(state.equity).toBe(12500);
    expect(state.leverage).toBe(100); // unchanged
  });
});
```

---

## CRM System — Standalone Repo Files

> The `crm-system/` folder contains a fully self-contained React app intended to
> be published to its own GitHub repository (`vda-crm-system`). The files below
> are pre-written helpers and guides for that process.

---

## crm-system/README.md

```
# VDA CRM System

A standalone **Client Relationship Management** app built with React and Redux. 📋

---

> ### 🚀 Want to put this online? Read the easy guide first!
> **[➡ DEPLOY.md — Step-by-step go-live guide (plain English)](./DEPLOY.md)**
> *(Or run `./go-live.sh https://github.com/YOUR-USERNAME/vda-crm-system.git` to do it in one command!)*

---

## 👀 Live app

> 👉 **[https://virtuex-digital-assets.github.io/vda-crm-system](https://virtuex-digital-assets.github.io/vda-crm-system)**

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | KPI cards (clients, deposits, withdrawals, net funds, P&L, conversion rate), pipeline stage breakdown, top clients by balance, recent activity feed |
| **Client List** | Searchable and filterable table with stage + KYC badges, quick delete |
| **Client Profile** | Tabs: Overview · Accounts · Transactions · Notes. Edit stage, KYC status, assigned rep inline. Record deposits and withdrawals. Add notes. |
| **Pipeline Board** | Kanban board with 7 stages: New Lead → Contacted → KYC Submitted → KYC Verified → Funded → Active → Inactive |
| **Rep Filter** | Sidebar quick-filter by sales rep (Alice K., Bob T., Carol M.) |
| **Seed Data** | 10 realistic demo clients loaded on first run |

---

## 💻 Run locally

```
npm install
npm start
```

Open **[http://localhost:3000](http://localhost:3000)**

---

## 🏗️ Build

```
npm run build
```

---

## 🚀 Deploy to GitHub Pages

📖 **[Full step-by-step guide → DEPLOY.md](./DEPLOY.md)**

**Quick version:**

1. Create a new repo called `vda-crm-system` on GitHub (public, empty)
2. Run the helper script:
   ```bash
   chmod +x go-live.sh
   ./go-live.sh https://github.com/YOUR-USERNAME/vda-crm-system.git
   ```
3. Watch the **Actions** tab — the robot builds and deploys automatically (~2 min)
4. Go to **Settings → Pages → Branch → `gh-pages` → Save**
5. Open 🎉 `https://YOUR-USERNAME.github.io/vda-crm-system`

> **First deploy only:** You need to set the Pages branch to `gh-pages` once in Settings.

---

## 🗂️ Project structure

```
src/
├── App.js                     # Root component — header + CRMView
├── App.css                    # App shell styles
├── index.js                   # React entry point with Redux Provider
├── components/
│   ├── shared.css             # Shared panel styles
│   └── CRM/
│       ├── CRMView.js         # Left nav + view switcher
│       ├── CRMView.css
│       ├── Dashboard/
│       │   ├── CRMDashboard.js    # KPIs, stage bars, top clients, activity
│       │   └── CRMDashboard.css
│       ├── Clients/
│       │   ├── ClientList.js      # Filterable client table + add modal
│       │   ├── ClientList.css
│       │   ├── ClientProfile.js   # Full client record with tabs
│       │   └── ClientProfile.css
│       └── Pipeline/
│           ├── Pipeline.js        # Kanban board
│           └── Pipeline.css
└── store/
    ├── index.js               # Redux store
    ├── rootReducer.js         # combineReducers (CRM only)
    ├── actions/
    │   ├── actionTypes.js
    │   └── index.js
    └── reducers/
        └── crmReducer.js      # Full CRM state + 10 seed clients
```

---

## 🛠️ Tech stack

- **React 17** + **Redux 4** + **react-redux 7**
- **Create React App 4** (no eject)
- **GitHub Actions** → **GitHub Pages** (automatic deployment)

---

## License

MIT © Virtuex Digital Assets
```

---

## crm-system/DEPLOY.md

```
# 🚀 How to make VDA CRM go LIVE — step by step (super easy!)

Don't worry — we'll do this together, one tiny step at a time. 🐣

---

## What is going to happen?

We are going to put the CRM app on the internet so **anyone in the world** can open it
in a browser. It will live at this address:

> **https://virtuex-digital-assets.github.io/vda-crm-system**

GitHub gives us free hosting — we just need to push the code there. Here's how. 👇

---

## Before you start — things you need

| Thing | Why you need it | Do you have it? |
|---|---|---|
| A computer with internet | To do everything | ✅ Yes |
| A GitHub account | The code will live there | Need to check → [github.com](https://github.com) |
| Git installed | To send code to GitHub | [download here](https://git-scm.com/downloads) |
| Node.js (v18) installed | Only needed if running locally | [download here](https://nodejs.org) |

> 💡 **Git** is already installed if you can open a Terminal (or Command Prompt on Windows)
> and type `git --version` and it shows a number.

---

## STEP 1 — Create a new GitHub repository

Think of a GitHub "repository" (repo) like a folder on the internet where your code lives.

1. Open your browser and go to **[github.com](https://github.com)**
2. Click the big green **"New"** button (top-left, next to the 🐱 logo)
3. Fill in the form:
   - **Repository name:** `vda-crm-system` ← type exactly this
   - **Description:** `VDA CRM System` ← optional but nice
   - **Public** ← make sure this circle is selected (not Private)
   - ❌ Do NOT tick "Add a README file"
   - ❌ Do NOT tick "Add .gitignore"
   - ❌ Do NOT tick "Choose a license"
4. Click the green **"Create repository"** button

✅ You now have an empty repo. Leave this browser tab open — you'll need the URL in Step 3.

---

## STEP 2 — Open a Terminal on your computer

A Terminal is a black (or white) window where you type commands.

- **Mac:** Press `Cmd + Space`, type `Terminal`, press Enter
- **Windows:** Press `Win` key, type `cmd` or `PowerShell`, press Enter
- **Linux:** Press `Ctrl + Alt + T`

You'll see a blinking cursor. That's normal! 😊

---

## STEP 3 — Go into the crm-system folder

The CRM app code is inside a folder called `crm-system`. You need to tell the Terminal
to go into that folder.

> ⚠️ Replace the path below with wherever **you** saved the `vda-trading-terminal` project.

```bash
cd /path/to/vda-trading-terminal/crm-system
```

**Example on Mac:**
```bash
cd ~/Documents/vda-trading-terminal/crm-system
```

**Example on Windows (PowerShell):**
```powershell
cd C:\Users\YourName\Documents\vda-trading-terminal\crm-system
```

Check you're in the right place by typing:
```bash
ls
```
You should see files like `package.json`, `README.md`, `src`, `public`. ✅

---

## STEP 4 — Set up Git inside the crm-system folder

Now we tell Git "hey, this folder is a project I want to track".

Type each line below and press **Enter** after each one:

```bash
git init
```
*(This makes the folder a "git project")*

```bash
git add .
```
*(The dot means "add ALL the files")*

```bash
git commit -m "first commit"
```
*(This saves a snapshot of all the files)*

---

## STEP 5 — Connect your folder to GitHub

Remember that empty GitHub repo you made in Step 1?
Go back to that browser tab. You'll see a URL that looks like:

```
https://github.com/YOUR-USERNAME/vda-crm-system.git
```

Copy that URL. Now in the Terminal type:

```bash
git remote add origin https://github.com/YOUR-USERNAME/vda-crm-system.git
```

*(Replace `YOUR-USERNAME` with your actual GitHub username)*

Then type:
```bash
git branch -M main
git push -u origin main
```

It will ask for your GitHub username and password.

> 💡 **If it asks for a password and nothing works:** GitHub now uses "tokens" instead of passwords.
> Go to GitHub → Settings → Developer Settings → Personal access tokens → Generate new token (classic).
> Give it `repo` permission. Copy the token and use it as your password.

✅ If it says "Writing objects... done." — your code is now on GitHub! 🎉

---

## STEP 6 — Turn on GitHub Pages

Now we tell GitHub "please show this as a website".

1. Go to your repo on GitHub: `https://github.com/YOUR-USERNAME/vda-crm-system`
2. Click **⚙️ Settings** (near the top of the page)
3. Click **Pages** in the left sidebar
4. Under **"Source"**, click the dropdown that says **"Deploy from a branch"**
   - It might already say that. Leave it as-is.
5. Under **"Branch"**, change the branch from `main` to **`gh-pages`**
   - (If you don't see `gh-pages` yet, skip to "Wait for the robot" below first!)
6. Click **Save**

---

## STEP 7 — Wait for the robot 🤖

When you pushed your code in Step 5, GitHub automatically started a "robot" that:
- Installs the app
- Builds it
- Puts it on the internet for you

This takes about **2–3 minutes**. You can watch it happen:

1. Go to your repo: `https://github.com/YOUR-USERNAME/vda-crm-system`
2. Click the **Actions** tab (near the top)
3. You'll see a job called **"Deploy CRM to GitHub Pages"**
4. Click on it — you can watch each step turn green ✅

> 💛 Yellow circle = still working
> ✅ Green tick = done!
> ❌ Red X = something went wrong (scroll down to see the error message)

---

## STEP 8 — Go back and set the gh-pages branch (if you skipped it earlier)

After the robot finishes in Step 7, a new branch called `gh-pages` will appear.
Go back to **Settings → Pages** and set the branch to `gh-pages`. Click Save.

---

## STEP 9 — Open your live CRM! 🎉

Wait about **1 more minute** after setting the branch, then open:

> **https://YOUR-USERNAME.github.io/vda-crm-system**

You should see the VDA CRM System dashboard with demo client data! 🥳

---

## 🔁 How to update the app in the future

Every time you want to push new changes:

```bash
git add .
git commit -m "describe what you changed"
git push
```

The robot will automatically rebuild and redeploy in ~2 minutes. Easy!

---

## 😰 Something went wrong?

| Problem | Fix |
|---|---|
| `git: command not found` | Install Git from [git-scm.com](https://git-scm.com/downloads) |
| `npm: command not found` | Install Node.js from [nodejs.org](https://nodejs.org) |
| `Permission denied (publickey)` | Use HTTPS URL (not SSH) — make sure your URL starts with `https://` |
| `remote: Repository not found` | Double-check the GitHub URL you used in Step 5 |
| Page shows 404 after deploy | Wait 2 more minutes, then hard-refresh the page (`Ctrl+Shift+R`) |
| Actions tab shows red ❌ | Click on the failed job → scroll to the red step → read the error message |

---

## 🆘 Need help?

Open an issue in the repo and describe what step you're stuck on:
[https://github.com/virtuex-digital-assets/vda-crm-system/issues](https://github.com/virtuex-digital-assets/vda-crm-system/issues)

---

*You did it! The CRM is live. Tell your friends.* 🚀
```

---

## crm-system/go-live.sh

```bash
#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# go-live.sh  —  One-command helper to push vda-crm-system to a new GitHub repo
#
# Usage:
#   chmod +x go-live.sh
#   ./go-live.sh https://github.com/YOUR-USERNAME/vda-crm-system.git
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Stop immediately if anything goes wrong

REMOTE_URL="$1"

# ── Check that a URL was provided ─────────────────────────────────────────────
if [ -z "$REMOTE_URL" ]; then
  echo ""
  echo "❌  Oops! You forgot to give me the GitHub URL."
  echo ""
  echo "    Usage:  ./go-live.sh https://github.com/YOUR-USERNAME/vda-crm-system.git"
  echo ""
  echo "    👉  Replace YOUR-USERNAME with your actual GitHub username."
  echo ""
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  🚀  VDA CRM System  —  Go Live Helper"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Step 1: Make sure we are inside the crm-system directory ─────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
echo "📁  Working directory: $SCRIPT_DIR"
echo ""

# ── Step 2: Init git (safe to run even if already a git repo) ─────────────────
if [ ! -d ".git" ]; then
  echo "⚙️   Setting up Git..."
  git init
  echo ""
fi

# ── Step 3: Stage all files ────────────────────────────────────────────────────
echo "📦  Adding all files..."
git add .
echo ""

# ── Step 4: Commit ────────────────────────────────────────────────────────────
echo "💾  Saving a snapshot (commit)..."
git commit -m "feat: initial VDA CRM System" 2>/dev/null || echo "   (nothing new to commit — already up to date)"
echo ""

# ── Step 5: Point to GitHub ───────────────────────────────────────────────────
echo "🔗  Connecting to GitHub: $REMOTE_URL"
# Remove existing remote if present (safe re-run)
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
echo ""

# ── Step 6: Push ──────────────────────────────────────────────────────────────
echo "🚢  Pushing code to GitHub..."
git branch -M main
git push -u origin main
echo ""

# ── Done ──────────────────────────────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════"
echo "  ✅  Code is on GitHub!"
echo ""
echo "  👉  Next steps:"
echo "      1.  Go to: $REMOTE_URL"
echo "          (remove the .git from the end)"
echo ""
echo "      2.  Click the  Actions  tab — watch the robot build"
echo "          your app (takes ~2 minutes)"
echo ""
echo "      3.  After Actions finishes:"
echo "          Go to Settings → Pages → Branch → select gh-pages"
echo "          → Save"
echo ""
echo "      4.  Wait 1 minute, then open your live app! 🎉"
echo "          https://YOUR-USERNAME.github.io/vda-crm-system"
echo ""
echo "  📖  Full guide: DEPLOY.md"
echo "═══════════════════════════════════════════════════════"
echo ""
```

---

## Backend Server (Node.js / Express + WebSocket)

The trading terminal includes a full backend server built with Express.js, JWT
authentication, WebSocket price streaming, and an in-memory trading engine.

**Start the backend:**
```
cd backend
npm install
npm start
```

**Run backend tests:**
```
cd backend
npm test
```

## backend/package.json

```json
{
  "name": "vda-trading-terminal-backend",
  "version": "1.0.0",
  "description": "VDA Trading Terminal – Node.js backend with Express REST API, WebSocket price feed, JWT authentication, and in-memory trading engine.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --watchAll=false"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^8.3.1",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^9.0.1",
    "ws": "^8.17.1"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "nodemon": "^3.1.4",
    "supertest": "^7.0.0"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": [
      "**/__tests__/**/*.test.js"
    ]
  }
}

```

## backend/.env.example

```bash
# VDA Trading Terminal – Backend Environment Variables
# Copy this file to .env and adjust values before starting the server.

# Server port (REST API)
PORT=5000

# JWT
JWT_SECRET=change-this-to-a-long-random-string-in-production
JWT_EXPIRES_IN=24h

# Demo account defaults
DEFAULT_BALANCE=10000
DEFAULT_LEVERAGE=100

# Simulator tick rate (milliseconds)
TICK_INTERVAL_MS=500
CANDLE_HISTORY_COUNT=200

# Comma-separated list of origins allowed to call the API
CORS_ORIGINS=http://localhost:3000

```

## backend/server.js

```js
/**
 * VDA Trading Terminal – Backend Server
 *
 * Starts an Express REST API + WebSocket server that powers the trading
 * platform.
 *
 * REST API base: http://localhost:5000/api
 * WebSocket:     ws://localhost:5000  (upgrade from HTTP)
 *
 * Default demo credentials:
 *   Admin:  admin@vda.trade / Admin1234!
 *   Trader: demo@vda.trade  / Demo1234!
 *
 * Set REACT_APP_MT4_BRIDGE_URL=ws://localhost:5000 in the React app to
 * connect the frontend to this backend instead of the built-in simulator.
 */

require('dotenv').config();
const http   = require('http');
const express = require('express');
const cors    = require('cors');
const config  = require('./config/config');

// Routes
const authRoutes    = require('./routes/auth');
const orderRoutes   = require('./routes/orders');
const accountRoutes = require('./routes/account');
const symbolRoutes  = require('./routes/symbols');
const adminRoutes   = require('./routes/admin');

// Middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(cors({
  origin: config.corsOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Request logger ─────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/orders',  orderRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/symbols', symbolRoutes);
app.use('/api/admin',   adminRoutes);

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── 404 handler ────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Error handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ── HTTP + WebSocket server ────────────────────────────────────────────────
const httpServer = http.createServer(app);

const { startWsServer } = require('./services/wsServer');
startWsServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`VDA Trading Terminal – Backend Server`);
  console.log(`  REST API  → http://localhost:${config.port}/api`);
  console.log(`  WebSocket → ws://localhost:${config.port}`);
  console.log(`  Demo:  admin@vda.trade / Admin1234!`);
  console.log(`  Demo:  demo@vda.trade  / Demo1234!`);
});

module.exports = app; // exported for testing

```

## backend/config/config.js

```js
/**
 * Backend configuration.
 * All values can be overridden via environment variables.
 */
require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '5000', 10),
  wsPort: parseInt(process.env.WS_PORT || '5001', 10),

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'vda-trading-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // Demo account defaults
  defaultBalance: parseFloat(process.env.DEFAULT_BALANCE || '10000'),
  defaultLeverage: parseInt(process.env.DEFAULT_LEVERAGE || '100', 10),

  // Simulator
  tickIntervalMs: parseInt(process.env.TICK_INTERVAL_MS || '500', 10),
  candleHistoryCount: parseInt(process.env.CANDLE_HISTORY_COUNT || '200', 10),

  // CORS – origins allowed to call the REST API
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
};

```

---

## Backend — Middleware

## backend/middleware/auth.js

```js
/**
 * JWT authentication middleware.
 *
 * Attaches the decoded user payload to `req.user` when a valid Bearer token
 * is present, or returns 401 when the token is missing / invalid.
 */
const { verifyToken } = require('../utils/jwt');
const { getUserById } = require('../models');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = verifyToken(token);
    const user = getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Only allow users with role === 'admin'. */
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };

```

## backend/middleware/rateLimiter.js

```js
/**
 * Rate limiters for sensitive routes.
 *
 * – authLimiter:   strict limit on login/register to prevent brute-force attacks
 * – apiLimiter:    general limit on authenticated API endpoints
 * – adminLimiter:  tighter limit on admin endpoints
 */
const rateLimit = require('express-rate-limit');

/** Strict limiter for authentication endpoints (login / register). */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/** General limiter for authenticated API calls. */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

/** Tighter limiter for admin endpoints. */
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

module.exports = { authLimiter, apiLimiter, adminLimiter };

```

## backend/middleware/errorHandler.js

```js
/**
 * Centralised error-handling middleware.
 * Must be registered AFTER all routes (4-argument function).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}: ${message}`);
  res.status(status).json({ error: message });
}

module.exports = errorHandler;

```

---

## Backend — Routes

## backend/routes/auth.js

```js
const express = require('express');
const router  = express.Router();
const { register, login, me } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.get('/me',        apiLimiter, authMiddleware, me);

module.exports = router;

```

## backend/routes/orders.js

```js
const express = require('express');
const router  = express.Router();
const { listOrders, placeOrder, closeOrder, modifyOrder, getHistory } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter, authMiddleware);

router.get('/',           listOrders);
router.post('/',          placeOrder);
router.get('/history',    getHistory);
router.delete('/:ticket', closeOrder);
router.patch('/:ticket',  modifyOrder);

module.exports = router;

```

## backend/routes/account.js

```js
const express = require('express');
const router  = express.Router();
const { getAccount, setLeverage } = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter, authMiddleware);

router.get('/',           getAccount);
router.patch('/leverage', setLeverage);

module.exports = router;

```

## backend/routes/admin.js

```js
const express = require('express');
const router  = express.Router();
const { getRisk, listAccounts, listAllOrders, forceCloseOrder } = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');

router.use(adminLimiter, authMiddleware, adminOnly);

router.get('/risk',                  getRisk);
router.get('/accounts',              listAccounts);
router.get('/orders',                listAllOrders);
router.post('/orders/:ticket/close', forceCloseOrder);

module.exports = router;

```

## backend/routes/symbols.js

```js
const express = require('express');
const router  = express.Router();
const { listSymbols, getCandles } = require('../controllers/symbolController');

// Public endpoints – no authentication required for market data
router.get('/',                  listSymbols);
router.get('/:symbol/candles',   getCandles);

module.exports = router;

```

---

## Backend — Controllers

## backend/controllers/authController.js

```js
const bcrypt     = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const db         = require('../models');

/**
 * POST /api/auth/register
 * Body: { email, password, name }
 */
async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'email, password, and name are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (db.getUserByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const user    = db.createUser(email, password, name, 'trader');
    const account = db.createAccount(user.id);
    const token   = signToken({ id: user.id, role: user.role });
    res.status(201).json({
      token,
      user:    { id: user.id, email: user.email, name: user.name, role: user.role },
      account: sanitiseAccount(account),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const user = db.getUserByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token   = signToken({ id: user.id, role: user.role });
    const account = db.getAccountByUserId(user.id);
    res.json({
      token,
      user:    { id: user.id, email: user.email, name: user.name, role: user.role },
      account: account ? sanitiseAccount(account) : null,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 */
function me(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  res.json({
    user:    req.user,
    account: account ? sanitiseAccount(account) : null,
  });
}

function sanitiseAccount(a) {
  // eslint-disable-next-line no-unused-vars
  const { userId, ...rest } = a;
  return rest;
}

module.exports = { register, login, me };

```

## backend/controllers/orderController.js

```js
const db             = require('../models');
const tradingEngine  = require('../services/tradingEngine');
const { broadcast }  = require('../services/wsServer');

function getAccountId(req) {
  return db.getAccountByUserId(req.user.id)?.id || null;
}

/**
 * GET /api/orders
 * Returns open + pending orders for the authenticated account.
 */
function listOrders(req, res) {
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const open    = [...db.openOrders.values()].filter((o) => o.accountId === accountId);
  const pending = [...db.pendingOrders.values()].filter((o) => o.accountId === accountId);
  res.json({ open, pending });
}

/**
 * POST /api/orders
 * Body: { symbol, type, lots, price?, sl?, tp?, comment? }
 */
function placeOrder(req, res) {
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const { symbol, type, lots, price, sl, tp, comment } = req.body;
  const result = tradingEngine.placeOrder({ accountId, symbol, type, lots, price, sl, tp, comment });

  if (!result.ok) return res.status(400).json({ error: result.error });

  broadcast({ type: 'order', action: 'open', order: result.order },
    (client) => client._accountId === accountId);
  res.status(201).json(result.order);
}

/**
 * DELETE /api/orders/:ticket
 * Close an open market order, or cancel a pending order.
 */
function closeOrder(req, res) {
  const ticket    = parseInt(req.params.ticket, 10);
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  // Verify ownership
  const openOrder    = db.openOrders.get(ticket);
  const pendingOrder = db.pendingOrders.get(ticket);
  const order        = openOrder || pendingOrder;
  if (!order) return res.status(404).json({ error: `Order #${ticket} not found` });
  if (order.accountId !== accountId) return res.status(403).json({ error: 'Not your order' });

  const result = openOrder
    ? tradingEngine.closeOrder(ticket)
    : tradingEngine.cancelOrder(ticket);

  if (!result.ok) return res.status(400).json({ error: result.error });

  broadcast({ type: 'order', action: 'close', order: result.closedOrder || result.order },
    (client) => client._accountId === accountId);
  res.json(result.closedOrder || result.order);
}

/**
 * PATCH /api/orders/:ticket
 * Modify SL/TP of an existing order.
 * Body: { sl?, tp? }
 */
function modifyOrder(req, res) {
  const ticket    = parseInt(req.params.ticket, 10);
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const order = db.openOrders.get(ticket) || db.pendingOrders.get(ticket);
  if (!order) return res.status(404).json({ error: `Order #${ticket} not found` });
  if (order.accountId !== accountId) return res.status(403).json({ error: 'Not your order' });

  const result = tradingEngine.modifyOrder(ticket, req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });

  broadcast({ type: 'order', action: 'modify', order: result.order },
    (client) => client._accountId === accountId);
  res.json(result.order);
}

/**
 * GET /api/orders/history
 * Returns closed order history for the authenticated account.
 */
function getHistory(req, res) {
  const accountId = getAccountId(req);
  if (!accountId) return res.status(404).json({ error: 'No trading account found' });

  const history = [...db.closedOrders.values()]
    .filter((o) => o.accountId === accountId)
    .sort((a, b) => new Date(b.closeTime) - new Date(a.closeTime));
  res.json(history);
}

module.exports = { listOrders, placeOrder, closeOrder, modifyOrder, getHistory };

```

## backend/controllers/accountController.js

```js
const db = require('../models');

/**
 * GET /api/account
 * Returns the authenticated user's trading account.
 */
function getAccount(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });
  // eslint-disable-next-line no-unused-vars
  const { userId, ...safe } = account;
  res.json(safe);
}

/**
 * PATCH /api/account/leverage
 * Body: { leverage: number }
 * Only allowed when no open orders exist.
 */
function setLeverage(req, res) {
  const account = db.getAccountByUserId(req.user.id);
  if (!account) return res.status(404).json({ error: 'No trading account found' });

  const leverage = parseInt(req.body.leverage, 10);
  if (!leverage || leverage < 1 || leverage > 1000) {
    return res.status(400).json({ error: 'Leverage must be between 1 and 1000' });
  }

  const openCount = [...db.openOrders.values()].filter((o) => o.accountId === account.id).length;
  if (openCount > 0) {
    return res.status(400).json({ error: 'Cannot change leverage while orders are open' });
  }

  account.leverage = leverage;
  res.json({ leverage });
}

module.exports = { getAccount, setLeverage };

```

## backend/controllers/adminController.js

```js
const db            = require('../models');
const tradingEngine = require('../services/tradingEngine');

/**
 * GET /api/admin/risk
 * Returns broker-level risk metrics: symbol exposure + account summaries.
 * Requires admin role.
 */
function getRisk(req, res) {
  const risk = tradingEngine.getBrokerRisk();
  res.json(risk);
}

/**
 * GET /api/admin/accounts
 * Returns all trading accounts with their current status.
 */
function listAccounts(req, res) {
  const accounts = [...db.accounts.values()].map((a) => {
    // eslint-disable-next-line no-unused-vars
    const { userId, ...safe } = a;
    return safe;
  });
  res.json(accounts);
}

/**
 * GET /api/admin/orders
 * Returns all open orders across all accounts.
 */
function listAllOrders(req, res) {
  const open    = [...db.openOrders.values()];
  const pending = [...db.pendingOrders.values()];
  res.json({ open, pending });
}

/**
 * POST /api/admin/close/:ticket
 * Force-close any open order (admin override).
 */
function forceCloseOrder(req, res) {
  const ticket = parseInt(req.params.ticket, 10);
  const result = tradingEngine.closeOrder(ticket);
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json(result.closedOrder);
}

module.exports = { getRisk, listAccounts, listAllOrders, forceCloseOrder };

```

## backend/controllers/symbolController.js

```js
const db = require('../models');

/**
 * GET /api/symbols
 * Returns the list of available symbols with latest quotes.
 */
function listSymbols(req, res) {
  const symbols = [];
  db.quotes.forEach((quote, symbol) => {
    symbols.push({ symbol, ...quote });
  });
  res.json(symbols);
}

/**
 * GET /api/symbols/:symbol/candles?timeframe=H1&count=200
 * Returns OHLCV candle history for a symbol.
 */
function getCandles(req, res) {
  const { symbol } = req.params;
  const timeframe  = req.query.timeframe || 'H1';
  const count      = Math.min(parseInt(req.query.count || '200', 10), 500);

  const key     = `${symbol}_${timeframe}`;
  const candles = db.candles.get(key);
  if (!candles) {
    return res.status(404).json({ error: `No candles found for ${symbol} ${timeframe}` });
  }
  res.json(candles.slice(-count));
}

module.exports = { listSymbols, getCandles };

```

---

## Backend — Models

## backend/models/index.js

```js
/**
 * In-memory data store.
 *
 * Provides a simple, session-scoped store for all platform data.
 * In a production deployment this would be replaced by a database
 * (PostgreSQL / MongoDB – see /database/schema.sql for the schema).
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

// ── Users ──────────────────────────────────────────────────────────────────

const users = new Map();

// ── Accounts ───────────────────────────────────────────────────────────────

const accounts = new Map();

// ── Orders ─────────────────────────────────────────────────────────────────

const openOrders = new Map();    // ticket → order
const pendingOrders = new Map(); // ticket → order
const closedOrders = new Map();  // ticket → order

let ticketCounter = 1000;
function nextTicket() {
  return ++ticketCounter;
}

// ── Price feed cache ───────────────────────────────────────────────────────

// symbol → { bid, ask, time, change, changePercent }
const quotes = new Map();

// symbol_timeframe → candle[]
const candles = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────

function getUserByEmail(email) {
  for (const u of users.values()) {
    if (u.email === email) return u;
  }
  return null;
}

function getUserById(id) {
  return users.get(id) || null;
}

function getAccountByUserId(userId) {
  for (const a of accounts.values()) {
    if (a.userId === userId) return a;
  }
  return null;
}

function getAccountById(id) {
  return accounts.get(id) || null;
}

function createAccount(userId, overrides = {}) {
  const id = uuidv4();
  const loginNum = String(10000 + accounts.size + 1);
  const account = {
    id,
    userId,
    login: loginNum,
    server: 'VDA-Demo',
    balance: config.defaultBalance,
    equity: config.defaultBalance,
    margin: 0,
    freeMargin: config.defaultBalance,
    marginLevel: 0,
    profit: 0,
    leverage: config.defaultLeverage,
    currency: 'USD',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
  accounts.set(id, account);
  return account;
}

function createUser(email, password, name, role = 'trader') {
  const id = uuidv4();
  const user = {
    id,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role,
    name,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  return user;
}

// ── Seed default accounts ──────────────────────────────────────────────────
// Runs after all helpers are defined.
(function seedUsers() {
  const adminUser  = createUser('admin@vda.trade', 'Admin1234!', 'VDA Admin',    'admin');
  const traderUser = createUser('demo@vda.trade',  'Demo1234!',  'Demo Trader',  'trader');
  createAccount(traderUser.id);
  // Suppress unused-variable warning – adminUser is seeded for login only
  void adminUser;
})();

module.exports = {
  users,
  accounts,
  openOrders,
  pendingOrders,
  closedOrders,
  quotes,
  candles,
  nextTicket,
  getUserByEmail,
  getUserById,
  getAccountByUserId,
  getAccountById,
  createAccount,
  createUser,
};

```

---

## Backend — Services

## backend/services/tradingEngine.js

```js
/**
 * Core trading engine.
 *
 * Handles order placement, modification, closure, margin calculation,
 * P&L updates, and stop-loss / take-profit trigger logic.
 *
 * All methods are synchronous and operate on the in-memory store.
 */

const db = require('../models');
const { calculateMargin, calculatePnL } = require('../utils/margin');

/**
 * Place a new order.
 *
 * @param {object} params
 * @param {string} params.accountId
 * @param {string} params.symbol
 * @param {string} params.type       BUY | SELL | BUY LIMIT | SELL LIMIT | BUY STOP | SELL STOP
 * @param {number} params.lots
 * @param {number} [params.price]    Required for pending orders
 * @param {number} [params.sl]       Stop-loss price
 * @param {number} [params.tp]       Take-profit price
 * @param {string} [params.comment]
 * @returns {{ ok: boolean, order?: object, error?: string }}
 */
function placeOrder({ accountId, symbol, type, lots, price, sl, tp, comment }) {
  const account = db.getAccountById(accountId);
  if (!account) return { ok: false, error: 'Account not found' };

  const quote = db.quotes.get(symbol);
  if (!quote) return { ok: false, error: `No quote available for ${symbol}` };

  const isMarket = type === 'BUY' || type === 'SELL';
  const isBuy    = type.startsWith('BUY');

  const execPrice = isMarket
    ? (isBuy ? quote.ask : quote.bid)
    : (price || 0);

  if (!execPrice || execPrice <= 0) {
    return { ok: false, error: 'Invalid execution price' };
  }
  if (!lots || lots <= 0) {
    return { ok: false, error: 'Invalid lot size' };
  }

  const margin = calculateMargin(symbol, lots, execPrice, account.leverage);

  if (isMarket && account.freeMargin < margin) {
    return { ok: false, error: `Insufficient free margin (required: $${margin}, available: $${account.freeMargin})` };
  }

  const ticket = db.nextTicket();
  const order = {
    ticket,
    accountId,
    symbol,
    type,
    lots: parseFloat(lots),
    openPrice: parseFloat(execPrice.toFixed(5)),
    sl:   sl  ? parseFloat(sl)  : null,
    tp:   tp  ? parseFloat(tp)  : null,
    comment: comment || '',
    openTime: new Date().toISOString(),
    profit: 0,
    swap: 0,
    commission: 0,
  };

  if (isMarket) {
    db.openOrders.set(ticket, order);
    // Deduct margin from account
    const newMargin      = parseFloat((account.margin + margin).toFixed(2));
    const newFreeMargin  = parseFloat((account.equity - newMargin).toFixed(2));
    const marginLevel    = newMargin > 0 ? parseFloat(((account.equity / newMargin) * 100).toFixed(2)) : 0;
    Object.assign(account, { margin: newMargin, freeMargin: newFreeMargin, marginLevel });
  } else {
    db.pendingOrders.set(ticket, order);
  }

  return { ok: true, order };
}

/**
 * Close an open market order at current market price.
 *
 * @param {number} ticket
 * @returns {{ ok: boolean, closedOrder?: object, error?: string }}
 */
function closeOrder(ticket) {
  const order = db.openOrders.get(ticket);
  if (!order) return { ok: false, error: `Open order #${ticket} not found` };

  const account = db.getAccountById(order.accountId);
  if (!account) return { ok: false, error: 'Account not found' };

  const quote = db.quotes.get(order.symbol);
  const closePrice = quote
    ? (order.type === 'BUY' ? quote.bid : quote.ask)
    : order.openPrice;

  const profit = calculatePnL(order.type, order.symbol, order.lots, order.openPrice, closePrice);
  const margin = calculateMargin(order.symbol, order.lots, order.openPrice, account.leverage);

  const closedOrder = {
    ...order,
    closePrice: parseFloat(closePrice.toFixed(5)),
    closeTime:  new Date().toISOString(),
    profit:     parseFloat(profit.toFixed(2)),
  };

  db.openOrders.delete(ticket);
  db.closedOrders.set(ticket, closedOrder);

  // Update account
  const newBalance    = parseFloat((account.balance + profit).toFixed(2));
  const newMargin     = Math.max(0, parseFloat((account.margin - margin).toFixed(2)));
  const newEquity     = parseFloat((newBalance + totalFloatingProfit(account.id)).toFixed(2));
  const newFreeMargin = parseFloat((newEquity - newMargin).toFixed(2));
  const marginLevel   = newMargin > 0 ? parseFloat(((newEquity / newMargin) * 100).toFixed(2)) : 0;

  Object.assign(account, {
    balance:     newBalance,
    equity:      newEquity,
    margin:      newMargin,
    freeMargin:  newFreeMargin,
    marginLevel,
    profit:      parseFloat(totalFloatingProfit(account.id).toFixed(2)),
  });

  return { ok: true, closedOrder };
}

/**
 * Cancel a pending order.
 */
function cancelOrder(ticket) {
  const order = db.pendingOrders.get(ticket);
  if (!order) return { ok: false, error: `Pending order #${ticket} not found` };
  db.pendingOrders.delete(ticket);
  const closed = { ...order, closeTime: new Date().toISOString(), status: 'cancelled', profit: 0 };
  db.closedOrders.set(ticket, closed);
  return { ok: true, order: closed };
}

/**
 * Modify stop-loss and/or take-profit of an existing order.
 */
function modifyOrder(ticket, { sl, tp }) {
  const order = db.openOrders.get(ticket) || db.pendingOrders.get(ticket);
  if (!order) return { ok: false, error: `Order #${ticket} not found` };
  if (sl !== undefined) order.sl = sl ? parseFloat(sl) : null;
  if (tp !== undefined) order.tp = tp ? parseFloat(tp) : null;
  return { ok: true, order };
}

/**
 * Recalculate floating P&L for all open orders of an account and update
 * equity / free margin.  Called on every price tick.
 *
 * @param {string} accountId
 */
function recalculateAccount(accountId) {
  const account = db.getAccountById(accountId);
  if (!account) return;

  let totalProfit = 0;
  const ordersToClose = [];

  db.openOrders.forEach((order) => {
    if (order.accountId !== accountId) return;
    const quote = db.quotes.get(order.symbol);
    if (!quote) return;

    const closePrice = order.type === 'BUY' ? quote.bid : quote.ask;
    const profit     = calculatePnL(order.type, order.symbol, order.lots, order.openPrice, closePrice);
    order.profit     = parseFloat(profit.toFixed(2));
    totalProfit      += order.profit;

    // Check SL/TP
    if (order.sl && ((order.type === 'BUY' && closePrice <= order.sl) ||
                     (order.type === 'SELL' && closePrice >= order.sl))) {
      ordersToClose.push({ ticket: order.ticket, reason: 'sl' });
    } else if (order.tp && ((order.type === 'BUY' && closePrice >= order.tp) ||
                             (order.type === 'SELL' && closePrice <= order.tp))) {
      ordersToClose.push({ ticket: order.ticket, reason: 'tp' });
    }
  });

  // Trigger pending orders
  db.pendingOrders.forEach((order) => {
    if (order.accountId !== accountId) return;
    const quote = db.quotes.get(order.symbol);
    if (!quote) return;
    let triggered = false;
    if (order.type === 'BUY LIMIT'  && quote.ask <= order.openPrice) triggered = true;
    if (order.type === 'SELL LIMIT' && quote.bid >= order.openPrice) triggered = true;
    if (order.type === 'BUY STOP'   && quote.ask >= order.openPrice) triggered = true;
    if (order.type === 'SELL STOP'  && quote.bid <= order.openPrice) triggered = true;
    if (triggered) {
      const newType = order.type.startsWith('BUY') ? 'BUY' : 'SELL';
      db.pendingOrders.delete(order.ticket);
      db.openOrders.set(order.ticket, { ...order, type: newType, openTime: new Date().toISOString() });
    }
  });

  // Auto-close SL/TP orders
  ordersToClose.forEach(({ ticket }) => closeOrder(ticket));

  // Update account equity
  const equity      = parseFloat((account.balance + totalProfit).toFixed(2));
  const freeMargin  = parseFloat((equity - account.margin).toFixed(2));
  const marginLevel = account.margin > 0 ? parseFloat(((equity / account.margin) * 100).toFixed(2)) : 0;

  Object.assign(account, { equity, profit: parseFloat(totalProfit.toFixed(2)), freeMargin, marginLevel });

  // Margin call: close all orders if margin level < 50%
  if (account.margin > 0 && marginLevel < 50) {
    db.openOrders.forEach((order) => {
      if (order.accountId === accountId) closeOrder(order.ticket);
    });
  }
}

/** Sum floating profit for all open orders belonging to an account. */
function totalFloatingProfit(accountId) {
  let total = 0;
  db.openOrders.forEach((o) => {
    if (o.accountId === accountId) total += o.profit || 0;
  });
  return total;
}

/**
 * Broker-level risk summary across ALL accounts.
 */
function getBrokerRisk() {
  const symbolExposure = {};   // symbol → { buyLots, sellLots, netLots, unrealisedPnL }
  const accountSummary = [];   // per-account snapshot

  db.openOrders.forEach((order) => {
    if (!symbolExposure[order.symbol]) {
      symbolExposure[order.symbol] = { buyLots: 0, sellLots: 0, netLots: 0, unrealisedPnL: 0 };
    }
    const exp = symbolExposure[order.symbol];
    if (order.type === 'BUY') {
      exp.buyLots  = parseFloat((exp.buyLots  + order.lots).toFixed(2));
    } else {
      exp.sellLots = parseFloat((exp.sellLots + order.lots).toFixed(2));
    }
    exp.netLots      = parseFloat((exp.buyLots - exp.sellLots).toFixed(2));
    exp.unrealisedPnL = parseFloat((exp.unrealisedPnL + (order.profit || 0)).toFixed(2));
  });

  db.accounts.forEach((account) => {
    accountSummary.push({
      accountId:  account.id,
      login:      account.login,
      balance:    account.balance,
      equity:     account.equity,
      margin:     account.margin,
      marginLevel: account.marginLevel,
      profit:     account.profit,
      openOrders: [...db.openOrders.values()].filter((o) => o.accountId === account.id).length,
    });
  });

  return { symbolExposure, accountSummary };
}

module.exports = {
  placeOrder,
  closeOrder,
  cancelOrder,
  modifyOrder,
  recalculateAccount,
  getBrokerRisk,
};

```

## backend/services/wsServer.js

```js
/**
 * WebSocket broadcast server.
 *
 * Clients connect and receive a stream of real-time events:
 *   { type: 'quote',    symbol, bid, ask, time }
 *   { type: 'candle',   symbol, timeframe, candle }
 *   { type: 'account',  accountId, ...accountFields }
 *   { type: 'order',    action: 'open'|'close'|'modify', order }
 *   { type: 'risk',     ...brokerRisk }
 *
 * Clients may optionally authenticate by sending:
 *   { type: 'auth', token: '<jwt>' }
 *
 * After authentication, position and account updates are scoped to the
 * authenticated account.
 */

const WebSocket = require('ws');
const config    = require('../config/config');
const { verifyToken } = require('../utils/jwt');
const { getUserById, getAccountByUserId } = require('../models');
const { recalculateAccount, getBrokerRisk } = require('./tradingEngine');
const {
  DEFAULT_SYMBOLS,
  generateSimulatedCandles,
  simulateNextCandle,
  getSpread,
  getDecimals,
} = require('./marketSimulator');
const db = require('../models');

let wss = null;

/**
 * Broadcast a JSON message to all connected clients (or a subset).
 * @param {object} payload
 * @param {(ws: WebSocket) => boolean} [filter]
 */
function broadcast(payload, filter) {
  if (!wss) return;
  const msg = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (!filter || filter(client)) {
        client.send(msg);
      }
    }
  });
}

/** Send a message to a single client. */
function send(ws, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

/** Seed candle history for all symbols on startup. */
function seedCandles() {
  const timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
  DEFAULT_SYMBOLS.forEach((sym) => {
    timeframes.forEach((tf) => {
      const key = `${sym}_${tf}`;
      if (!db.candles.has(key)) {
        const candles = generateSimulatedCandles(sym, tf, config.candleHistoryCount);
        db.candles.set(key, candles);
      }
    });
    // Seed initial quotes from H1 candles
    const h1 = db.candles.get(`${sym}_H1`) || [];
    if (h1.length > 0) {
      const last   = h1[h1.length - 1];
      const dec    = getDecimals(sym);
      const bid    = parseFloat(last.close.toFixed(dec));
      const ask    = parseFloat((bid + getSpread(sym)).toFixed(dec));
      db.quotes.set(sym, { bid, ask, time: new Date().toISOString(), change: 0, changePercent: 0 });
    }
  });
}

/** Run every tick (500 ms): update prices, recalculate accounts, broadcast. */
function tick() {
  const timeframe = 'M1'; // default tick timeframe

  DEFAULT_SYMBOLS.forEach((sym) => {
    const key      = `${sym}_${timeframe}`;
    const candles  = db.candles.get(key) || [];
    if (candles.length === 0) return;

    const { newCandle, quote } = simulateNextCandle(sym, timeframe, candles);

    // Update candle store
    const updated =
      candles[candles.length - 1] && candles[candles.length - 1].time === newCandle.time
        ? [...candles.slice(0, -1), newCandle]
        : [...candles, newCandle];
    db.candles.set(key, updated.slice(-config.candleHistoryCount));

    // Update quote store
    const prev           = db.quotes.get(sym) || {};
    const change         = quote.bid - (prev.bid || quote.bid);
    const changePercent  = prev.bid ? (change / prev.bid) * 100 : 0;
    db.quotes.set(sym, { ...quote, change, changePercent });

    // Broadcast quote
    broadcast({ type: 'quote', symbol: sym, ...quote, change, changePercent });
    broadcast({ type: 'candle', symbol: sym, timeframe, candle: newCandle });
  });

  // Recalculate every account
  db.accounts.forEach((account) => {
    recalculateAccount(account.id);
    broadcast(
      { type: 'account', ...account },
      (client) => client._accountId === account.id
    );
  });

  // Broadcast broker risk to admin clients every 5 ticks
  tick._count = ((tick._count || 0) + 1);
  if (tick._count % 10 === 0) {
    const risk = getBrokerRisk();
    broadcast({ type: 'risk', ...risk }, (client) => client._role === 'admin');
  }
}

/**
 * Start the WebSocket server.
 * @param {import('http').Server} httpServer  Attach to existing HTTP server (same port).
 */
function startWsServer(httpServer) {
  wss = new WebSocket.Server({ server: httpServer });

  seedCandles();

  wss.on('connection', (ws) => {
    ws._role      = 'guest';
    ws._accountId = null;

    send(ws, { type: 'welcome', message: 'VDA Trading Terminal WebSocket v1.0' });

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        send(ws, { type: 'error', message: 'Invalid JSON' });
        return;
      }

      if (msg.type === 'auth' && msg.token) {
        try {
          const decoded = verifyToken(msg.token);
          const user    = getUserById(decoded.id);
          if (!user) {
            send(ws, { type: 'auth_error', message: 'User not found' });
            return;
          }
          ws._role = user.role;
          const account = getAccountByUserId(user.id);
          if (account) {
            ws._accountId = account.id;
            // Send current state to the newly authenticated client
            send(ws, { type: 'account', ...account });
          }
          send(ws, { type: 'auth_ok', role: user.role, name: user.name });

          // Send current quotes
          db.quotes.forEach((q, sym) => {
            send(ws, { type: 'quote', symbol: sym, ...q });
          });
        } catch {
          send(ws, { type: 'auth_error', message: 'Invalid or expired token' });
        }
      }

      // Subscribe to candle history for a symbol/timeframe
      if (msg.type === 'subscribe_candles' && msg.symbol && msg.timeframe) {
        const key     = `${msg.symbol}_${msg.timeframe}`;
        const history = db.candles.get(key) || [];
        send(ws, { type: 'candles', symbol: msg.symbol, timeframe: msg.timeframe, data: history });
      }
    });

    ws.on('error', (err) => {
      console.error('[WS] client error:', err.message);
    });
  });

  // Start price simulation tick
  setInterval(tick, config.tickIntervalMs);

  console.log('[WS] WebSocket server attached to HTTP server');
}

module.exports = { startWsServer, broadcast };

```

## backend/services/marketSimulator.js

```js
/**
 * Server-side market data simulator.
 *
 * Generates realistic-looking OHLCV candle data and bid/ask quotes using a
 * Gaussian random-walk model.  Used when no live MT4 bridge is connected.
 */

const SEED_PRICES = {
  EURUSD:  1.0850,
  GBPUSD:  1.2650,
  USDJPY:  149.50,
  XAUUSD:  2020.0,
  USDCHF:  0.8950,
  AUDUSD:  0.6520,
  USDCAD:  1.3580,
  NZDUSD:  0.6090,
  BTCUSD:  52000.0,
  ETHUSD:  2800.0,
};

const VOLATILITY = {
  EURUSD:  0.0008,
  GBPUSD:  0.001,
  USDJPY:  0.1,
  XAUUSD:  1.5,
  USDCHF:  0.0008,
  AUDUSD:  0.0009,
  USDCAD:  0.0009,
  NZDUSD:  0.0009,
  BTCUSD:  200,
  ETHUSD:  30,
};

const SPREADS = {
  EURUSD:  0.0001,
  GBPUSD:  0.0002,
  USDJPY:  0.02,
  XAUUSD:  0.3,
  USDCHF:  0.0002,
  AUDUSD:  0.0002,
  USDCAD:  0.0002,
  NZDUSD:  0.0003,
  BTCUSD:  5.0,
  ETHUSD:  0.5,
};

const TIMEFRAME_SECONDS = {
  M1:  60,
  M5:  300,
  M15: 900,
  M30: 1800,
  H1:  3600,
  H4:  14400,
  D1:  86400,
  W1:  604800,
};

const DEFAULT_SYMBOLS = Object.keys(SEED_PRICES);

/** Gaussian random (Box-Muller transform). */
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function barTime(ts, tfSeconds) {
  return Math.floor(ts / tfSeconds) * tfSeconds;
}

function getSpread(symbol) {
  return SPREADS[symbol] || 0.0001;
}

function getDecimals(symbol) {
  if (symbol.includes('JPY')) return 3;
  if (symbol === 'XAUUSD') return 2;
  if (symbol === 'BTCUSD') return 2;
  if (symbol === 'ETHUSD') return 2;
  return 5;
}

/**
 * Generate `count` historical candles for a symbol/timeframe combination
 * ending at "now".
 */
function generateSimulatedCandles(symbol, timeframe, count = 200) {
  const tfSec = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol   = VOLATILITY[symbol] || 0.001;
  let price   = SEED_PRICES[symbol] || 1.0;

  const nowSec   = Math.floor(Date.now() / 1000);
  const startTime = barTime(nowSec, tfSec) - (count - 1) * tfSec;

  const result = [];
  for (let i = 0; i < count; i++) {
    const time  = startTime + i * tfSec;
    price       = Math.max(0.0001, price + randn() * vol);
    const open  = price;
    const close = Math.max(0.0001, price + randn() * vol * 0.5);
    const high  = Math.max(open, close) + Math.abs(randn() * vol * 0.3);
    const low   = Math.min(open, close) - Math.abs(randn() * vol * 0.3);
    const volume = Math.floor(100 + Math.random() * 900);
    result.push({ time, open, high, low, close, volume });
    price = close;
  }
  return result;
}

/**
 * Advance the simulator by one tick.
 * Returns `{ newCandle, quote }`.
 */
function simulateNextCandle(symbol, timeframe, existingCandles) {
  const tfSec   = TIMEFRAME_SECONDS[timeframe] || 3600;
  const vol     = VOLATILITY[symbol] || 0.001;
  const spread  = getSpread(symbol);
  const dec     = getDecimals(symbol);

  const nowSec         = Math.floor(Date.now() / 1000);
  const currentBarTime = barTime(nowSec, tfSec);

  const lastCandle = existingCandles[existingCandles.length - 1];
  const prevClose  = lastCandle ? lastCandle.close : (SEED_PRICES[symbol] || 1.0);

  const tick = Math.max(0.0001, prevClose + randn() * vol * 0.15);

  let newCandle;
  if (lastCandle && lastCandle.time === currentBarTime) {
    newCandle = {
      ...lastCandle,
      high:   Math.max(lastCandle.high, tick),
      low:    Math.min(lastCandle.low, tick),
      close:  tick,
      volume: lastCandle.volume + Math.floor(Math.random() * 10),
    };
  } else {
    newCandle = {
      time:   currentBarTime,
      open:   prevClose,
      high:   Math.max(prevClose, tick),
      low:    Math.min(prevClose, tick),
      close:  tick,
      volume: Math.floor(10 + Math.random() * 50),
    };
  }

  const bid = parseFloat(newCandle.close.toFixed(dec));
  const ask = parseFloat((bid + spread).toFixed(dec));

  return {
    newCandle,
    quote: { bid, ask, time: new Date().toISOString() },
  };
}

module.exports = {
  DEFAULT_SYMBOLS,
  SEED_PRICES,
  VOLATILITY,
  SPREADS,
  TIMEFRAME_SECONDS,
  generateSimulatedCandles,
  simulateNextCandle,
  getSpread,
  getDecimals,
};

```

---

## Backend — Utilities

## backend/utils/jwt.js

```js
/**
 * JWT utilities – sign and verify tokens.
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');

function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, verifyToken };

```

## backend/utils/margin.js

```js
/**
 * Margin and P&L utilities.
 */

// Symbols whose base currency is USD – no price conversion needed for margin.
const USD_BASE_SYMBOLS = new Set(['USDJPY', 'USDCHF', 'USDCAD']);

// Precious metals – contract size is in ounces/units, not 100k.
const METAL_CONTRACT = { XAUUSD: 100 }; // 1 lot = 100 oz gold

/**
 * Calculate the required margin for a position (result in USD).
 *
 * Rules:
 *  • USD/xxx pairs (USDJPY, USDCHF, USDCAD): contract is 100,000 USD units →
 *      margin = lots × 100,000 / leverage
 *  • xxx/USD pairs (EURUSD, GBPUSD, …): margin = lots × 100,000 × price / leverage
 *  • XAUUSD: 1 lot = 100 oz → margin = lots × 100 × price / leverage
 *  • BTCUSD / ETHUSD: 1 lot = 1 coin → margin = lots × price / leverage
 *
 * @param {string} symbol
 * @param {number} lots
 * @param {number} openPrice
 * @param {number} leverage
 * @returns {number} required margin in USD
 */
function calculateMargin(symbol, lots, openPrice, leverage) {
  let notionalUSD;

  if (symbol === 'BTCUSD' || symbol === 'ETHUSD') {
    notionalUSD = lots * openPrice;
  } else if (METAL_CONTRACT[symbol]) {
    notionalUSD = lots * METAL_CONTRACT[symbol] * openPrice;
  } else if (USD_BASE_SYMBOLS.has(symbol)) {
    // Base currency = USD: notional is already in USD
    notionalUSD = lots * 100000;
  } else {
    // Base currency is foreign (EURUSD, GBPUSD, …): price converts to USD
    notionalUSD = lots * 100000 * openPrice;
  }

  return parseFloat((notionalUSD / leverage).toFixed(2));
}

/**
 * Calculate the floating P&L for an open position (result in USD).
 *
 * @param {string} type     'BUY' | 'SELL'
 * @param {string} symbol
 * @param {number} lots
 * @param {number} openPrice
 * @param {number} currentPrice  Current bid (for BUY) or ask (for SELL)
 * @returns {number} profit/loss in USD
 */
function calculatePnL(type, symbol, lots, openPrice, currentPrice) {
  const isCrypto = symbol === 'BTCUSD' || symbol === 'ETHUSD';
  const isJPY    = symbol.includes('JPY');
  const isXAU    = symbol === 'XAUUSD';

  let priceDiff  = currentPrice - openPrice;
  if (type === 'SELL') priceDiff = -priceDiff;

  let pnl;
  if (isCrypto) {
    pnl = lots * priceDiff;
  } else if (isXAU) {
    pnl = lots * METAL_CONTRACT.XAUUSD * priceDiff;
  } else if (USD_BASE_SYMBOLS.has(symbol)) {
    // USD is base: P&L denominated in quote currency, convert back to USD
    const pipValue = isJPY ? 0.01 : 0.0001;
    const pips     = priceDiff / pipValue;
    // Each pip for USD-base pair = $1 per mini-lot (10,000 units) → $10 per std lot
    // More precisely: P&L_in_quote = priceDiff × lots × 100,000
    // P&L_in_USD = P&L_in_quote / currentPrice
    pnl = (priceDiff * lots * 100000) / currentPrice;
  } else {
    // xxx/USD pair: priceDiff is already in USD
    pnl = priceDiff * lots * 100000;
  }

  return parseFloat(pnl.toFixed(2));
}

module.exports = { calculateMargin, calculatePnL };

```

---

## Backend — Tests

## backend/__tests__/tradingEngine.test.js

```js
/**
 * Tests for the core trading engine (order placement, closure, margin calc).
 */

const { calculateMargin, calculatePnL } = require('../utils/margin');
const tradingEngine = require('../services/tradingEngine');
const db = require('../models');

// Seed a test account + quotes before tests
let testAccountId;

beforeAll(() => {
  // Create a test user + account
  const user = db.createUser('test@vda.trade', 'Test1234!', 'Test Trader', 'trader');
  const account = db.createAccount(user.id, { balance: 10000, equity: 10000, freeMargin: 10000, leverage: 100 });
  testAccountId = account.id;

  // Seed quotes
  db.quotes.set('EURUSD', { bid: 1.08500, ask: 1.08510, time: new Date().toISOString() });
  db.quotes.set('USDJPY', { bid: 149.500, ask: 149.520, time: new Date().toISOString() });
  db.quotes.set('BTCUSD', { bid: 52000.0, ask: 52005.0, time: new Date().toISOString() });
});

// ── Margin calculator ──────────────────────────────────────────────────────

describe('calculateMargin', () => {
  test('EURUSD 0.1 lots @ 1.0850 with 100:1 leverage', () => {
    const margin = calculateMargin('EURUSD', 0.1, 1.0850, 100);
    expect(margin).toBeCloseTo(108.50, 1);
  });

  test('USDJPY 1 lot @ 149.50 with 100:1 leverage', () => {
    // USD is base currency → margin = 1 × 100,000 / 100 = 1,000 USD
    const margin = calculateMargin('USDJPY', 1.0, 149.50, 100);
    expect(margin).toBeCloseTo(1000.00, 1);
  });

  test('BTCUSD 0.1 lots @ 52000 with 10:1 leverage', () => {
    // contract size = 1 for crypto
    const margin = calculateMargin('BTCUSD', 0.1, 52000, 10);
    expect(margin).toBeCloseTo(520.00, 1);
  });
});

// ── P&L calculator ─────────────────────────────────────────────────────────

describe('calculatePnL', () => {
  test('BUY EURUSD 1 lot: +10 pip profit', () => {
    const pnl = calculatePnL('BUY', 'EURUSD', 1.0, 1.08500, 1.08600);
    expect(pnl).toBeCloseTo(100, 0);
  });

  test('SELL EURUSD 1 lot: 10 pip profit (price goes down)', () => {
    const pnl = calculatePnL('SELL', 'EURUSD', 1.0, 1.08600, 1.08500);
    expect(pnl).toBeCloseTo(100, 0);
  });

  test('BUY EURUSD 1 lot: loss when price drops', () => {
    const pnl = calculatePnL('BUY', 'EURUSD', 1.0, 1.08600, 1.08500);
    expect(pnl).toBeCloseTo(-100, 0);
  });

  test('SELL USDJPY 1 lot: profit when price drops', () => {
    const pnl = calculatePnL('SELL', 'USDJPY', 1.0, 149.50, 149.40);
    expect(pnl).toBeGreaterThan(0);
  });
});

// ── Order placement ────────────────────────────────────────────────────────

describe('tradingEngine.placeOrder', () => {
  test('places a BUY market order successfully', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    expect(result.ok).toBe(true);
    expect(result.order).toBeDefined();
    expect(result.order.type).toBe('BUY');
    expect(result.order.symbol).toBe('EURUSD');
    expect(result.order.lots).toBe(0.1);
    expect(db.openOrders.has(result.order.ticket)).toBe(true);
  });

  test('places a SELL market order successfully', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'SELL',
      lots: 0.05,
    });
    expect(result.ok).toBe(true);
    expect(result.order.type).toBe('SELL');
  });

  test('rejects order with invalid lots', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/invalid lot/i);
  });

  test('rejects order for unknown account', () => {
    const result = tradingEngine.placeOrder({
      accountId: 'non-existent',
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/account not found/i);
  });

  test('places a pending BUY LIMIT order', () => {
    const result = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY LIMIT',
      lots: 0.1,
      price: 1.08000,
    });
    expect(result.ok).toBe(true);
    expect(db.pendingOrders.has(result.order.ticket)).toBe(true);
  });
});

// ── Order closure ──────────────────────────────────────────────────────────

describe('tradingEngine.closeOrder', () => {
  test('closes an open order and records profit', () => {
    // First place an order
    const { order } = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    expect(order).toBeDefined();

    const result = tradingEngine.closeOrder(order.ticket);
    expect(result.ok).toBe(true);
    expect(db.openOrders.has(order.ticket)).toBe(false);
    expect(db.closedOrders.has(order.ticket)).toBe(true);
  });

  test('returns error for non-existent ticket', () => {
    const result = tradingEngine.closeOrder(99999);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});

// ── Order modification ─────────────────────────────────────────────────────

describe('tradingEngine.modifyOrder', () => {
  test('modifies SL/TP of an open order', () => {
    const { order } = tradingEngine.placeOrder({
      accountId: testAccountId,
      symbol: 'EURUSD',
      type: 'BUY',
      lots: 0.1,
    });
    const result = tradingEngine.modifyOrder(order.ticket, { sl: 1.08000, tp: 1.09000 });
    expect(result.ok).toBe(true);
    expect(result.order.sl).toBe(1.08000);
    expect(result.order.tp).toBe(1.09000);
  });
});

```

---

## Database (PostgreSQL)

SQL files for creating the database schema, running migrations, and seeding
demo data. Use these with a PostgreSQL database.

```
psql -U postgres -d vda_trading -f database/schema.sql
psql -U postgres -d vda_trading -f database/seeds.sql
```

## database/schema.sql

```sql
-- VDA Trading Terminal – PostgreSQL Database Schema
-- ====================================================
-- This schema describes the production database structure.
-- The backend/models/index.js provides an equivalent in-memory
-- implementation that works without a database connection.

-- ── Extensions ──────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'trader' CHECK (role IN ('admin', 'trader', 'manager')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

-- ── Trading accounts ─────────────────────────────────────────────────────
CREATE TABLE accounts (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login         VARCHAR(20)  NOT NULL UNIQUE,
    server        VARCHAR(100) NOT NULL DEFAULT 'VDA-Demo',
    currency      CHAR(3)      NOT NULL DEFAULT 'USD',
    leverage      INTEGER      NOT NULL DEFAULT 100 CHECK (leverage BETWEEN 1 AND 3000),
    balance       NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    equity        NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    free_margin   NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin_level  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    profit        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_user_id ON accounts (user_id);
CREATE INDEX idx_accounts_login   ON accounts (login);

-- ── Symbols ──────────────────────────────────────────────────────────────
CREATE TABLE symbols (
    id            SERIAL       PRIMARY KEY,
    name          VARCHAR(20)  NOT NULL UNIQUE,
    description   VARCHAR(100),
    digits        INTEGER      NOT NULL DEFAULT 5,
    contract_size INTEGER      NOT NULL DEFAULT 100000,
    spread        NUMERIC(10,5) NOT NULL DEFAULT 0.0001,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

INSERT INTO symbols (name, description, digits, contract_size, spread) VALUES
    ('EURUSD', 'Euro vs US Dollar',       5, 100000, 0.00010),
    ('GBPUSD', 'Pound vs US Dollar',      5, 100000, 0.00020),
    ('USDJPY', 'US Dollar vs Yen',        3, 100000, 0.020),
    ('XAUUSD', 'Gold vs US Dollar',       2, 100,    0.30),
    ('USDCHF', 'US Dollar vs Swiss Franc',5, 100000, 0.00020),
    ('AUDUSD', 'Aussie vs US Dollar',     5, 100000, 0.00020),
    ('USDCAD', 'US Dollar vs Canadian',   5, 100000, 0.00020),
    ('NZDUSD', 'NZD vs US Dollar',        5, 100000, 0.00030),
    ('BTCUSD', 'Bitcoin vs US Dollar',    2, 1,      5.00),
    ('ETHUSD', 'Ethereum vs US Dollar',   2, 1,      0.50);

-- ── Price feed (tick data) ────────────────────────────────────────────────
CREATE TABLE price_feed (
    id         BIGSERIAL    PRIMARY KEY,
    symbol     VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    bid        NUMERIC(18,5) NOT NULL,
    ask        NUMERIC(18,5) NOT NULL,
    time       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_feed_symbol_time ON price_feed (symbol, time DESC);

-- ── OHLCV Candles ─────────────────────────────────────────────────────────
CREATE TABLE candles (
    id         BIGSERIAL    PRIMARY KEY,
    symbol     VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    timeframe  VARCHAR(5)   NOT NULL,
    open_time  BIGINT       NOT NULL,  -- Unix timestamp (seconds)
    open       NUMERIC(18,5) NOT NULL,
    high       NUMERIC(18,5) NOT NULL,
    low        NUMERIC(18,5) NOT NULL,
    close      NUMERIC(18,5) NOT NULL,
    volume     INTEGER      NOT NULL DEFAULT 0,
    UNIQUE (symbol, timeframe, open_time)
);

CREATE INDEX idx_candles_lookup ON candles (symbol, timeframe, open_time DESC);

-- ── Orders ───────────────────────────────────────────────────────────────
CREATE TYPE order_type AS ENUM (
    'BUY', 'SELL',
    'BUY LIMIT', 'SELL LIMIT',
    'BUY STOP', 'SELL STOP'
);

CREATE TYPE order_status AS ENUM ('open', 'pending', 'closed', 'cancelled');

CREATE TABLE orders (
    ticket      BIGINT       PRIMARY KEY,
    account_id  UUID         NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol      VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    type        order_type   NOT NULL,
    status      order_status NOT NULL DEFAULT 'open',
    lots        NUMERIC(10,2) NOT NULL CHECK (lots > 0),
    open_price  NUMERIC(18,5) NOT NULL,
    close_price NUMERIC(18,5),
    sl          NUMERIC(18,5),
    tp          NUMERIC(18,5),
    profit      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    swap        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    comment     VARCHAR(100)  DEFAULT '',
    open_time   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    close_time  TIMESTAMPTZ
);

CREATE INDEX idx_orders_account_status ON orders (account_id, status);
CREATE INDEX idx_orders_symbol         ON orders (symbol);
CREATE INDEX idx_orders_open_time      ON orders (open_time DESC);

-- ── Trade history (materialised closed orders) ────────────────────────────
CREATE TABLE trade_history (
    id            BIGSERIAL    PRIMARY KEY,
    ticket        BIGINT       NOT NULL REFERENCES orders(ticket),
    account_id    UUID         NOT NULL REFERENCES accounts(id),
    symbol        VARCHAR(20)  NOT NULL,
    type          VARCHAR(20)  NOT NULL,
    lots          NUMERIC(10,2) NOT NULL,
    open_price    NUMERIC(18,5) NOT NULL,
    close_price   NUMERIC(18,5) NOT NULL,
    profit        NUMERIC(18,2) NOT NULL,
    swap          NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission    NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    open_time     TIMESTAMPTZ  NOT NULL,
    close_time    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trade_history_account ON trade_history (account_id, close_time DESC);

-- ── Margin records ────────────────────────────────────────────────────────
CREATE TABLE margin_records (
    id            BIGSERIAL    PRIMARY KEY,
    account_id    UUID         NOT NULL REFERENCES accounts(id),
    balance       NUMERIC(18,2) NOT NULL,
    equity        NUMERIC(18,2) NOT NULL,
    margin        NUMERIC(18,2) NOT NULL,
    free_margin   NUMERIC(18,2) NOT NULL,
    margin_level  NUMERIC(10,2) NOT NULL,
    recorded_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_margin_account_time ON margin_records (account_id, recorded_at DESC);

-- ── Broker exposure (risk snapshot) ──────────────────────────────────────
CREATE TABLE broker_exposure (
    id             BIGSERIAL    PRIMARY KEY,
    symbol         VARCHAR(20)  NOT NULL REFERENCES symbols(name),
    buy_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    sell_lots      NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    unrealised_pnl NUMERIC(18,2) NOT NULL DEFAULT 0,
    snapshot_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_broker_exposure_time ON broker_exposure (snapshot_at DESC);

-- ── Sessions (JWT refresh token store) ───────────────────────────────────
CREATE TABLE sessions (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(512) NOT NULL UNIQUE,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked      BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_sessions_user    ON sessions (user_id);
CREATE INDEX idx_sessions_token   ON sessions (refresh_token);

-- ── updated_at trigger helper ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

```

## database/seeds.sql

```sql
-- VDA Trading Terminal – Demo / Development Seed Data
-- =====================================================
-- Populates the database with a set of demo users, trading accounts,
-- symbols, open orders, and trade history so the platform is immediately
-- usable after a fresh schema migration.
--
-- Usage:
--   psql -d vda_trading -f database/schema.sql   # run once to create tables
--   psql -d vda_trading -f database/seeds.sql    # load demo data
--
-- This script runs inside a single transaction.  Any error automatically
-- triggers a full ROLLBACK so the database is never left in a partial state.
--
-- ⚠  CRITICAL: These credentials are for LOCAL DEVELOPMENT ONLY.
--    Change ALL passwords immediately before deploying to any environment
--    other than local development (staging, production, or any internet-
--    accessible server).
--
-- Demo credentials:
--   Super-admin:  superadmin@vda.trade  / SuperAdmin1234!
--   Admin/Broker: admin@vda.trade       / Admin1234!
--   Trader 1:     demo@vda.trade        / Demo1234!
--   Trader 2:     trader2@vda.trade     / Trader1234!

BEGIN;

-- ── Extension needed for password hashing ────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Wipe existing seed data (idempotent re-run) ───────────────────────────
DELETE FROM trade_history;
DELETE FROM broker_exposure;
DELETE FROM margin_records;
DELETE FROM orders;
DELETE FROM price_feed;
DELETE FROM candles;
DELETE FROM sessions;
DELETE FROM accounts;
DELETE FROM users;

-- ── Users ─────────────────────────────────────────────────────────────────

INSERT INTO users (id, email, password_hash, name, role, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'superadmin@vda.trade',
   crypt('SuperAdmin1234!', gen_salt('bf', 10)),
   'Super Admin',
   'admin',
   TRUE),

  ('00000000-0000-0000-0000-000000000002',
   'admin@vda.trade',
   crypt('Admin1234!', gen_salt('bf', 10)),
   'VDA Admin',
   'admin',
   TRUE),

  ('00000000-0000-0000-0000-000000000003',
   'demo@vda.trade',
   crypt('Demo1234!', gen_salt('bf', 10)),
   'Demo Trader',
   'trader',
   TRUE),

  ('00000000-0000-0000-0000-000000000004',
   'trader2@vda.trade',
   crypt('Trader1234!', gen_salt('bf', 10)),
   'Jane Trader',
   'trader',
   TRUE);

-- ── Trading accounts ──────────────────────────────────────────────────────

INSERT INTO accounts (id, user_id, login, server, currency, leverage,
                      balance, equity, margin, free_margin, margin_level, profit) VALUES
  ('00000000-0000-0000-0001-000000000001',
   '00000000-0000-0000-0000-000000000003',
   '10001', 'VDA-Demo', 'USD', 100,
   10000.00, 10150.50, 200.00, 9950.50, 5075.25, 150.50),

  ('00000000-0000-0000-0001-000000000002',
   '00000000-0000-0000-0000-000000000004',
   '10002', 'VDA-Demo', 'USD', 200,
   25000.00, 24820.00, 500.00, 24320.00, 4964.00, -180.00);

-- ── Additional symbols (top-ups beyond schema.sql seed) ───────────────────
-- The schema.sql INSERT uses ON CONFLICT DO NOTHING, so these are safe.

INSERT INTO symbols (name, description, digits, contract_size, spread) VALUES
  ('USDJPY', 'US Dollar vs Yen',          3, 100000, 0.02000),
  ('XAUUSD', 'Gold vs US Dollar',         2,    100, 0.30000),
  ('USDCHF', 'US Dollar vs Swiss Franc',  5, 100000, 0.00020),
  ('AUDUSD', 'Aussie vs US Dollar',       5, 100000, 0.00020),
  ('USDCAD', 'US Dollar vs Canadian',     5, 100000, 0.00020),
  ('NZDUSD', 'NZD vs US Dollar',          5, 100000, 0.00030),
  ('BTCUSD', 'Bitcoin vs US Dollar',      2,      1, 5.00000),
  ('ETHUSD', 'Ethereum vs US Dollar',     2,      1, 0.50000)
ON CONFLICT (name) DO NOTHING;

-- ── Sample price feed (latest tick per symbol) ────────────────────────────

INSERT INTO price_feed (symbol, bid, ask, time) VALUES
  ('EURUSD', 1.08520, 1.08532, NOW() - INTERVAL '5 seconds'),
  ('GBPUSD', 1.26840, 1.26858, NOW() - INTERVAL '5 seconds'),
  ('USDJPY', 149.520, 149.542, NOW() - INTERVAL '5 seconds'),
  ('XAUUSD', 2312.40, 2312.70, NOW() - INTERVAL '5 seconds'),
  ('USDCHF', 0.89720, 0.89740, NOW() - INTERVAL '5 seconds'),
  ('AUDUSD', 0.65480, 0.65498, NOW() - INTERVAL '5 seconds'),
  ('USDCAD', 1.35620, 1.35640, NOW() - INTERVAL '5 seconds'),
  ('NZDUSD', 0.59860, 0.59889, NOW() - INTERVAL '5 seconds'),
  ('BTCUSD', 67450.00, 67455.00, NOW() - INTERVAL '5 seconds'),
  ('ETHUSD', 3120.50, 3121.00, NOW() - INTERVAL '5 seconds');

-- ── Open orders ───────────────────────────────────────────────────────────

INSERT INTO orders (ticket, account_id, symbol, type, status, lots,
                    open_price, sl, tp, profit, swap, commission, comment, open_time) VALUES
  (1001,
   '00000000-0000-0000-0001-000000000001',
   'EURUSD', 'BUY', 'open', 0.10,
   1.08450, 1.08000, 1.09000,
   7.20, -0.10, -0.70, 'Demo long EURUSD', NOW() - INTERVAL '2 hours'),

  (1002,
   '00000000-0000-0000-0001-000000000001',
   'XAUUSD', 'BUY', 'open', 0.05,
   2308.00, 2280.00, 2360.00,
   143.30, -0.20, -1.00, 'Gold long', NOW() - INTERVAL '1 hour'),

  (1003,
   '00000000-0000-0000-0001-000000000002',
   'GBPUSD', 'SELL', 'open', 0.20,
   1.26950, 1.27500, 1.26500,
   -180.00, -0.30, -1.40, 'Short GBP', NOW() - INTERVAL '3 hours');

-- ── Closed trade history ──────────────────────────────────────────────────

INSERT INTO orders (ticket, account_id, symbol, type, status, lots,
                    open_price, close_price, sl, tp, profit, swap, commission,
                    comment, open_time, close_time) VALUES
  (900,
   '00000000-0000-0000-0001-000000000001',
   'EURUSD', 'BUY', 'closed', 0.10,
   1.07800, 1.08200, 1.07500, 1.08500,
   40.00, -0.50, -0.70, 'Closed profit', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

  (901,
   '00000000-0000-0000-0001-000000000001',
   'USDJPY', 'SELL', 'closed', 0.10,
   150.200, 149.500, 150.800, 149.000,
   47.00, -0.20, -0.70, 'JPY short win', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

  (902,
   '00000000-0000-0000-0001-000000000002',
   'XAUUSD', 'BUY', 'closed', 0.05,
   2295.00, 2310.00, 2280.00, 2330.00,
   75.00, -0.30, -1.00, 'Gold scalp', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');

INSERT INTO trade_history (ticket, account_id, symbol, type, lots,
                           open_price, close_price, profit, swap, commission,
                           open_time, close_time)
-- orders.type is the order_type enum; trade_history.type is VARCHAR(20).
-- The explicit cast converts the enum value to its text representation.
SELECT ticket, account_id, symbol, type::text, lots,
       open_price, close_price, profit, swap, commission,
       open_time, close_time
FROM   orders
WHERE  status = 'closed';

-- ── Margin snapshots ──────────────────────────────────────────────────────

INSERT INTO margin_records (account_id, balance, equity, margin,
                            free_margin, margin_level, recorded_at) VALUES
  ('00000000-0000-0000-0001-000000000001',
   10000.00, 10150.50, 200.00, 9950.50, 5075.25, NOW() - INTERVAL '1 hour'),
  ('00000000-0000-0000-0001-000000000002',
   25000.00, 24820.00, 500.00, 24320.00, 4964.00, NOW() - INTERVAL '1 hour');

-- ── Broker exposure snapshot ──────────────────────────────────────────────

INSERT INTO broker_exposure (symbol, buy_lots, sell_lots, net_lots,
                             unrealised_pnl, snapshot_at) VALUES
  ('EURUSD', 0.10, 0.00, 0.10,   7.20, NOW()),
  ('GBPUSD', 0.00, 0.20, -0.20,-180.00, NOW()),
  ('XAUUSD', 0.05, 0.00, 0.05, 143.30, NOW());

COMMIT;

```

## database/migrations/001_create_users.sql

```sql
-- 001 – Create users table
-- Run: psql -d vda_trading -f 001_create_users.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL DEFAULT 'trader'
                               CHECK (role IN ('admin', 'trader', 'manager')),
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

```

## database/migrations/002_create_accounts_symbols.sql

```sql
-- 002 – Create accounts + symbols tables

CREATE TABLE IF NOT EXISTS accounts (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login         VARCHAR(20)   NOT NULL UNIQUE,
    server        VARCHAR(100)  NOT NULL DEFAULT 'VDA-Demo',
    currency      CHAR(3)       NOT NULL DEFAULT 'USD',
    leverage      INTEGER       NOT NULL DEFAULT 100,
    balance       NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    equity        NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    free_margin   NUMERIC(18,2) NOT NULL DEFAULT 10000.00,
    margin_level  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    profit        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS symbols (
    id            SERIAL        PRIMARY KEY,
    name          VARCHAR(20)   NOT NULL UNIQUE,
    description   VARCHAR(100),
    digits        INTEGER       NOT NULL DEFAULT 5,
    contract_size INTEGER       NOT NULL DEFAULT 100000,
    spread        NUMERIC(10,5) NOT NULL DEFAULT 0.0001,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO symbols (name, description, digits, contract_size, spread)
VALUES
    ('EURUSD','Euro vs US Dollar',       5,100000,0.00010),
    ('GBPUSD','Pound vs US Dollar',      5,100000,0.00020),
    ('USDJPY','US Dollar vs Yen',        3,100000,0.020),
    ('XAUUSD','Gold vs US Dollar',       2,100,   0.30),
    ('USDCHF','US Dollar vs Swiss Franc',5,100000,0.00020),
    ('AUDUSD','Aussie vs US Dollar',     5,100000,0.00020),
    ('USDCAD','US Dollar vs Canadian',   5,100000,0.00020),
    ('NZDUSD','NZD vs US Dollar',        5,100000,0.00030),
    ('BTCUSD','Bitcoin vs US Dollar',    2,1,     5.00),
    ('ETHUSD','Ethereum vs US Dollar',   2,1,     0.50)
ON CONFLICT (name) DO NOTHING;

```

## database/migrations/003_create_orders_history.sql

```sql
-- 003 – Create orders, price feed, candles, trade history, broker exposure

CREATE TYPE IF NOT EXISTS order_type AS ENUM (
    'BUY','SELL','BUY LIMIT','SELL LIMIT','BUY STOP','SELL STOP');

CREATE TYPE IF NOT EXISTS order_status AS ENUM (
    'open','pending','closed','cancelled');

CREATE TABLE IF NOT EXISTS orders (
    ticket      BIGINT        PRIMARY KEY,
    account_id  UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    symbol      VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    type        order_type    NOT NULL,
    status      order_status  NOT NULL DEFAULT 'open',
    lots        NUMERIC(10,2) NOT NULL CHECK (lots > 0),
    open_price  NUMERIC(18,5) NOT NULL,
    close_price NUMERIC(18,5),
    sl          NUMERIC(18,5),
    tp          NUMERIC(18,5),
    profit      NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    swap        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    comment     VARCHAR(100)  DEFAULT '',
    open_time   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    close_time  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS price_feed (
    id      BIGSERIAL     PRIMARY KEY,
    symbol  VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    bid     NUMERIC(18,5) NOT NULL,
    ask     NUMERIC(18,5) NOT NULL,
    time    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candles (
    id        BIGSERIAL     PRIMARY KEY,
    symbol    VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    timeframe VARCHAR(5)    NOT NULL,
    open_time BIGINT        NOT NULL,
    open      NUMERIC(18,5) NOT NULL,
    high      NUMERIC(18,5) NOT NULL,
    low       NUMERIC(18,5) NOT NULL,
    close     NUMERIC(18,5) NOT NULL,
    volume    INTEGER       NOT NULL DEFAULT 0,
    UNIQUE (symbol, timeframe, open_time)
);

CREATE TABLE IF NOT EXISTS trade_history (
    id          BIGSERIAL     PRIMARY KEY,
    ticket      BIGINT        NOT NULL REFERENCES orders(ticket),
    account_id  UUID          NOT NULL REFERENCES accounts(id),
    symbol      VARCHAR(20)   NOT NULL,
    type        VARCHAR(20)   NOT NULL,
    lots        NUMERIC(10,2) NOT NULL,
    open_price  NUMERIC(18,5) NOT NULL,
    close_price NUMERIC(18,5) NOT NULL,
    profit      NUMERIC(18,2) NOT NULL,
    swap        NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    commission  NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    open_time   TIMESTAMPTZ   NOT NULL,
    close_time  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS broker_exposure (
    id             BIGSERIAL     PRIMARY KEY,
    symbol         VARCHAR(20)   NOT NULL REFERENCES symbols(name),
    buy_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    sell_lots      NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_lots       NUMERIC(12,2) NOT NULL DEFAULT 0,
    unrealised_pnl NUMERIC(18,2) NOT NULL DEFAULT 0,
    snapshot_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS margin_records (
    id           BIGSERIAL     PRIMARY KEY,
    account_id   UUID          NOT NULL REFERENCES accounts(id),
    balance      NUMERIC(18,2) NOT NULL,
    equity       NUMERIC(18,2) NOT NULL,
    margin       NUMERIC(18,2) NOT NULL,
    free_margin  NUMERIC(18,2) NOT NULL,
    margin_level NUMERIC(10,2) NOT NULL,
    recorded_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

```

---

## Docker & Deployment

Docker configuration for running the full stack (frontend + backend + database +
nginx) with a single command:

```
docker-compose up --build
```

## Dockerfile.frontend

```dockerfile
# ── Stage 1: Build React frontend ────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY public/ ./public/
COPY src/    ./src/

ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# ── Stage 2: Production image (nginx) ────────────────────────────────────
FROM nginx:1.27-alpine AS frontend

COPY --from=frontend-builder /app/build /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

```

## Dockerfile.backend

```dockerfile
# VDA Trading Terminal – Backend API Server
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# Copy source
COPY backend/ .

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]

```

## docker-compose.yml

```yaml
version: "3.9"

services:
  # ── Backend API + WebSocket server ──────────────────────────────────────
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: vda-backend
    restart: unless-stopped
    env_file: backend/.env.example   # copy to backend/.env for production
    environment:
      NODE_ENV: production
      PORT: "5000"
    ports:
      - "5000:5000"
    networks:
      - vda-net
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

  # ── React frontend (nginx) ────────────────────────────────────────────
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: vda-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - vda-net

networks:
  vda-net:
    driver: bridge

```

## docker/nginx.conf

```nginx
server {
    listen       80;
    server_name  _;
    root         /usr/share/nginx/html;
    index        index.html;

    # Security headers
    add_header X-Content-Type-Options "nosniff"            always;
    add_header X-Frame-Options        "DENY"               always;
    add_header X-XSS-Protection       "1; mode=block"      always;
    add_header Referrer-Policy        "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1024;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React SPA – serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to backend service
    location /api/ {
        proxy_pass         http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass         http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "Upgrade";
        proxy_set_header   Host $host;
        proxy_read_timeout 86400;
    }
}

```

---

## Source Code — Additional UI Components

## src/components/Login/Login.js

```js
import React, { useState } from 'react';
import './Login.css';

/**
 * Login – Authentication screen.
 *
 * In demo (standalone) mode the form accepts any credentials and immediately
 * calls onLogin('demo').
 *
 * When a REACT_APP_API_URL env var is set the form POSTs to the backend
 * /api/auth/login endpoint and stores the returned JWT in localStorage.
 *
 * Props:
 *   onLogin(role)  – called after successful authentication ('super_admin'|'admin'|'trader')
 */
const API_URL = process.env.REACT_APP_API_URL || '';

const Login = ({ onLogin }) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [isDemo,   setIsDemo]   = useState(!API_URL);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // ── Demo (no backend) mode ────────────────────────────────────────────
    // NOTE: Role detection from email is intentionally simple for demo/offline
    // mode only. Production must validate roles server-side via JWT claims and
    // NEVER trust client-supplied role data.
    if (isDemo) {
      setTimeout(() => {
        setLoading(false);
        // Role detection from email prefix
        const e = email.toLowerCase();
        if (e.includes('superadmin') || e.includes('super_admin') || e.includes('root')) {
          onLogin('super_admin');
        } else if (e.includes('admin')) {
          onLogin('admin');
        } else {
          onLogin('trader');
        }
      }, 400);
      return;
    }

    // ── Live API mode ─────────────────────────────────────────────────────
    try {
      const res  = await fetch(`${API_URL}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      localStorage.setItem('vda_token', data.token);
      localStorage.setItem('vda_user',  JSON.stringify(data.user));
      onLogin(data.user.role);
    } catch {
      setError('Cannot reach server. Switching to demo mode.');
      setIsDemo(true);
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'super_admin') { setEmail('superadmin@vda.trade'); setPassword('SuperAdmin1!'); }
    else if (role === 'admin')  { setEmail('admin@vda.trade');      setPassword('Admin1234!'); }
    else                        { setEmail('demo@vda.trade');        setPassword('Demo1234!'); }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        {/* ── Logo ─────────────────────────────────────────────────── */}
        <div className="login-logo">
          <span className="login-logo-vda">VDA</span>
          <span className="login-logo-sub">Trading Terminal</span>
        </div>

        {/* ── Demo / Live badge ─────────────────────────────────── */}
        <div className={`login-mode-badge ${isDemo ? 'demo' : 'live'}`}>
          {isDemo ? '● DEMO MODE' : '● LIVE BACKEND'}
        </div>

        {/* ── Form ─────────────────────────────────────────────────── */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              placeholder={isDemo ? 'any email to enter demo' : 'trader@broker.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder={isDemo ? 'any password' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className={`login-btn${loading ? ' loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Connecting…' : 'Login'}
          </button>
        </form>

        {/* ── Demo shortcuts ─────────────────────────────────────── */}
        <div className="login-demo-row">
          <span className="login-demo-label">Quick login:</span>
          <button className="login-demo-btn" onClick={() => fillDemo('trader')}>Demo Trader</button>
          <button className="login-demo-btn admin" onClick={() => fillDemo('admin')}>Demo Admin</button>
          <button className="login-demo-btn superadmin" onClick={() => fillDemo('super_admin')}>Super Admin</button>
        </div>

        <p className="login-hint">
          {isDemo
            ? 'Running in offline demo mode – no server required.'
            : `Connecting to ${API_URL}`}
        </p>
      </div>
    </div>
  );
};

export default Login;

```

## src/components/BrokerMonitor/BrokerMonitor.js

```js
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { formatProfit } from '../../utils/formatters';
import './BrokerMonitor.css';

/**
 * BrokerMonitor – Admin / Broker risk monitoring dashboard.
 *
 * Aggregates all open positions across all accounts to show:
 *  • Symbol-level buy/sell exposure and net lots
 *  • Per-account equity snapshot
 *  • Total floating P&L
 *
 * In standalone mode this reads from the Redux store (all positions are
 * single-account).  When connected to the backend the data is supplemented
 * via the /api/admin/risk endpoint.
 */
const BrokerMonitor = () => {
  const { openOrders } = useSelector((s) => s.orders);
  const account        = useSelector((s) => s.account);
  const { quotes }     = useSelector((s) => s.market);
  const [tab, setTab]  = useState('exposure'); // 'exposure' | 'accounts' | 'marginCall'

  // ── Aggregate symbol exposure ────────────────────────────────────────────
  const exposureMap = {};
  openOrders.forEach((order) => {
    if (!exposureMap[order.symbol]) {
      exposureMap[order.symbol] = { symbol: order.symbol, buyLots: 0, sellLots: 0, netLots: 0, pnl: 0 };
    }
    const exp = exposureMap[order.symbol];
    if (order.type === 'BUY') exp.buyLots  = +(exp.buyLots  + order.lots).toFixed(2);
    else                      exp.sellLots = +(exp.sellLots + order.lots).toFixed(2);
    exp.netLots = +(exp.buyLots - exp.sellLots).toFixed(2);
    exp.pnl     = +(exp.pnl + (order.profit || 0)).toFixed(2);
  });
  const exposureRows = Object.values(exposureMap);

  const totalPnL   = openOrders.reduce((s, o) => s + (o.profit || 0), 0);
  const totalLots  = openOrders.reduce((s, o) => s + o.lots, 0);
  const atRisk     = account.marginLevel > 0 && account.marginLevel < 150;

  // ── Account snapshot (single account in frontend mode) ──────────────────
  const accountRows = [{
    login:       account.login,
    balance:     account.balance,
    equity:      account.equity,
    margin:      account.margin,
    marginLevel: account.marginLevel,
    profit:      account.profit,
    openOrders:  openOrders.length,
  }];

  // ── Margin-call risk orders (SL very close to current price) ─────────────
  const marginRiskOrders = openOrders.filter((o) => {
    if (!o.sl) return false;
    const q = quotes[o.symbol];
    if (!q) return false;
    const currentPrice = o.type === 'BUY' ? q.bid : q.ask;
    const dist = Math.abs(currentPrice - o.sl) / currentPrice;
    return dist < 0.005; // within 0.5% of SL
  });

  return (
    <div className="broker-monitor">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="bm-header">
        <span className="bm-title">🛡 Broker Risk Monitor</span>
        <div className="bm-stats">
          <span className="bm-stat">
            Open Positions: <strong>{openOrders.length}</strong>
          </span>
          <span className="bm-stat">
            Total Lots: <strong>{totalLots.toFixed(2)}</strong>
          </span>
          <span className={`bm-stat${totalPnL >= 0 ? ' positive' : ' negative'}`}>
            Float P&L: <strong>{formatProfit(totalPnL)}</strong>
          </span>
          {atRisk && (
            <span className="bm-alert">⚠ LOW MARGIN LEVEL: {account.marginLevel.toFixed(1)}%</span>
          )}
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="bm-tabs">
        {['exposure', 'accounts', 'marginCall'].map((t) => (
          <button
            key={t}
            className={`bm-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'exposure'   ? '📊 Symbol Exposure' :
             t === 'accounts'   ? '👤 Accounts' :
                                  `⚠ Margin Risk${marginRiskOrders.length > 0 ? ` (${marginRiskOrders.length})` : ''}`}
          </button>
        ))}
      </div>

      {/* ── Symbol exposure table ──────────────────────────────────────── */}
      {tab === 'exposure' && (
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Buy Lots</th>
                <th>Sell Lots</th>
                <th>Net Lots</th>
                <th>Float P&L</th>
                <th>Bid</th>
                <th>Ask</th>
              </tr>
            </thead>
            <tbody>
              {exposureRows.length === 0 ? (
                <tr><td colSpan={7} className="empty">No open positions</td></tr>
              ) : (
                exposureRows.map((row) => {
                  const q = quotes[row.symbol] || {};
                  return (
                    <tr key={row.symbol} className={Math.abs(row.netLots) > 2 ? 'high-risk' : ''}>
                      <td className="sym">{row.symbol}</td>
                      <td className="buy-type">{row.buyLots}</td>
                      <td className="sell-type">{row.sellLots}</td>
                      <td className={row.netLots > 0 ? 'buy-type' : row.netLots < 0 ? 'sell-type' : ''}>
                        {row.netLots > 0 ? '+' : ''}{row.netLots}
                      </td>
                      <td className={row.pnl >= 0 ? 'positive' : 'negative'}>
                        {formatProfit(row.pnl)}
                      </td>
                      <td>{q.bid ? q.bid.toFixed(5) : '—'}</td>
                      <td>{q.ask ? q.ask.toFixed(5) : '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {exposureRows.length > 0 && (
              <tfoot>
                <tr className="totals-row">
                  <td><strong>TOTAL</strong></td>
                  <td>{exposureRows.reduce((s, r) => +(s + r.buyLots).toFixed(2), 0)}</td>
                  <td>{exposureRows.reduce((s, r) => +(s + r.sellLots).toFixed(2), 0)}</td>
                  <td></td>
                  <td className={totalPnL >= 0 ? 'positive' : 'negative'}>
                    <strong>{formatProfit(totalPnL)}</strong>
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* ── Account snapshot table ─────────────────────────────────────── */}
      {tab === 'accounts' && (
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>Login</th>
                <th>Balance</th>
                <th>Equity</th>
                <th>Margin</th>
                <th>Margin Level</th>
                <th>Float P&L</th>
                <th>Open Orders</th>
              </tr>
            </thead>
            <tbody>
              {accountRows.map((a, i) => (
                <tr key={i} className={a.marginLevel > 0 && a.marginLevel < 150 ? 'high-risk' : ''}>
                  <td>{a.login}</td>
                  <td>${a.balance.toFixed(2)}</td>
                  <td>${a.equity.toFixed(2)}</td>
                  <td>${a.margin.toFixed(2)}</td>
                  <td className={a.marginLevel < 100 ? 'negative' : a.marginLevel < 200 ? 'warn' : 'positive'}>
                    {a.marginLevel > 0 ? `${a.marginLevel.toFixed(1)}%` : '—'}
                  </td>
                  <td className={a.profit >= 0 ? 'positive' : 'negative'}>
                    {formatProfit(a.profit)}
                  </td>
                  <td>{a.openOrders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Margin risk orders ─────────────────────────────────────────── */}
      {tab === 'marginCall' && (
        <div className="bm-table-wrap">
          <table className="bm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Open Price</th>
                <th>SL</th>
                <th>Current</th>
                <th>Dist to SL</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {marginRiskOrders.length === 0 ? (
                <tr><td colSpan={9} className="empty">No orders near stop-loss</td></tr>
              ) : (
                marginRiskOrders.map((o) => {
                  const q = quotes[o.symbol] || {};
                  const currentPrice = o.type === 'BUY' ? q.bid : q.ask;
                  const dist = o.sl ? Math.abs(currentPrice - o.sl) : null;
                  return (
                    <tr key={o.ticket} className="high-risk">
                      <td>{o.ticket}</td>
                      <td className="sym">{o.symbol}</td>
                      <td className={o.type === 'BUY' ? 'buy-type' : 'sell-type'}>{o.type}</td>
                      <td>{o.lots}</td>
                      <td>{o.openPrice}</td>
                      <td className="sl">{o.sl}</td>
                      <td>{currentPrice ? currentPrice.toFixed(5) : '—'}</td>
                      <td className="negative">{dist ? dist.toFixed(5) : '—'}</td>
                      <td className={o.profit >= 0 ? 'positive' : 'negative'}>
                        {formatProfit(o.profit)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BrokerMonitor;

```

## src/components/MarketFeed/MarketFeed.js

```js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MarketFeed.css';

/* ── Static feed data ─────────────────────────────────────────────────────── */

const FEED_CARDS = [
  {
    id: 1,
    symbol: 'EUR/USD',
    direction: 'BUY',
    price: '1.08423',
    change: '+0.42%',
    positive: true,
    signalType: 'Breakout Signal',
    analyst: '@MarketHawk',
    avatar: '🦅',
    time: '2 min ago',
    description:
      'EUR/USD broke above key resistance at 1.0840. RSI momentum confirms bullish continuation. Next target: 1.0880.',
    tags: ['#forex', '#breakout', '#eurusd'],
    likes: 1247,
    comments: 84,
    bookmarks: 312,
    shares: 218,
    sparkline: [40, 38, 42, 39, 44, 47, 45, 50, 53, 55, 52, 58],
    gradient: ['#0d47a1', '#1565c0'],
    accent: '#42a5f5',
  },
  {
    id: 2,
    symbol: 'BTC/USD',
    direction: 'SELL',
    price: '67,210',
    change: '-1.83%',
    positive: false,
    signalType: 'Reversal Alert',
    analyst: '@CryptoVision',
    avatar: '🔮',
    time: '5 min ago',
    description:
      'Bitcoin rejected at $68,000 resistance for the third time. Bearish engulfing pattern on 4H chart. Watch for a pullback to $64,500.',
    tags: ['#bitcoin', '#crypto', '#reversal'],
    likes: 3891,
    comments: 256,
    bookmarks: 904,
    shares: 531,
    sparkline: [70, 72, 71, 74, 73, 69, 65, 63, 67, 65, 62, 60],
    gradient: ['#4a148c', '#6a1b9a'],
    accent: '#ce93d8',
  },
  {
    id: 3,
    symbol: 'GOLD',
    direction: 'BUY',
    price: '2,334.50',
    change: '+0.77%',
    positive: true,
    signalType: 'Safe Haven Flow',
    analyst: '@GoldBull',
    avatar: '🏆',
    time: '11 min ago',
    description:
      'Gold surging on geopolitical tensions. Inverse correlation with USD strengthening. Institutional buying confirmed above $2,320. Strong momentum toward $2,360.',
    tags: ['#gold', '#commodities', '#safehaven'],
    likes: 2156,
    comments: 147,
    bookmarks: 530,
    shares: 276,
    sparkline: [30, 32, 34, 31, 35, 38, 40, 42, 39, 44, 46, 48],
    gradient: ['#e65100', '#bf360c'],
    accent: '#ffcc02',
  },
  {
    id: 4,
    symbol: 'GBP/JPY',
    direction: 'SELL',
    price: '191.340',
    change: '-0.55%',
    positive: false,
    signalType: 'Overbought RSI',
    analyst: '@FX_Maestro',
    avatar: '🎯',
    time: '18 min ago',
    description:
      'GBP/JPY RSI hit 78 — deep overbought territory. MACD divergence appearing on 1H. Risk-off sentiment building across JPY pairs.',
    tags: ['#gbpjpy', '#rsi', '#forex'],
    likes: 897,
    comments: 63,
    bookmarks: 218,
    shares: 104,
    sparkline: [60, 62, 64, 66, 65, 63, 61, 59, 57, 55, 54, 52],
    gradient: ['#1b5e20', '#2e7d32'],
    accent: '#81c784',
  },
  {
    id: 5,
    symbol: 'S&P 500',
    direction: 'BUY',
    price: '5,241.0',
    change: '+0.31%',
    positive: true,
    signalType: 'Trend Continuation',
    analyst: '@WallStreetEdge',
    avatar: '📊',
    time: '24 min ago',
    description:
      'S&P 500 holding above 5,200 support — bullish structure intact. Tech sector leading gains. Q1 earnings season beat expectations by 8%. Watch 5,260 as next resistance.',
    tags: ['#sp500', '#stocks', '#usa'],
    likes: 5432,
    comments: 378,
    bookmarks: 1201,
    shares: 689,
    sparkline: [45, 43, 47, 48, 46, 49, 51, 50, 52, 54, 53, 56],
    gradient: ['#006064', '#00838f'],
    accent: '#4dd0e1',
  },
  {
    id: 6,
    symbol: 'USD/JPY',
    direction: 'BUY',
    price: '149.870',
    change: '+0.19%',
    positive: true,
    signalType: 'Carry Trade',
    analyst: '@MacroTrader',
    avatar: '🌐',
    time: '31 min ago',
    description:
      'USD/JPY carry trade back in play as Fed holds rates. BOJ signals no imminent hike. Watch for intervention risk above 151.00 — manage your size carefully.',
    tags: ['#usdjpy', '#carrytrade', '#forex'],
    likes: 1634,
    comments: 112,
    bookmarks: 445,
    shares: 203,
    sparkline: [50, 51, 52, 50, 53, 54, 52, 55, 56, 54, 57, 58],
    gradient: ['#37474f', '#455a64'],
    accent: '#b0bec5',
  },
];

/* ── Sparkline SVG ────────────────────────────────────────────────────────── */

const Sparkline = ({ data, positive, accent }) => {
  const w = 160;
  const h = 50;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(' ');
  const fillPts = `0,${h} ${pts} ${w},${h}`;

  return (
    <svg width={w} height={h} className="sparkline-svg">
      <defs>
        <linearGradient id={`sg-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.4" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#sg-${positive})`} />
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ── Single card ──────────────────────────────────────────────────────────── */

const FeedCard = ({ card, active }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(card.likes);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const handleLike = () => {
    setLiked((l) => !l);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const formatCount = (n) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <div
      className={`feed-card${active ? ' feed-card--active' : ''}`}
      style={{ background: `linear-gradient(160deg, ${card.gradient[0]} 0%, ${card.gradient[1]} 100%)` }}
    >
      {/* ── Background glow ─── */}
      <div className="feed-card-glow" style={{ background: card.accent }} />

      {/* ── Main content ─── */}
      <div className="feed-card-content">
        {/* Signal badge */}
        <div className="feed-signal-badge" style={{ borderColor: card.accent, color: card.accent }}>
          {card.signalType}
        </div>

        {/* Symbol + price */}
        <div className="feed-symbol-row">
          <span className="feed-symbol">{card.symbol}</span>
          <span className={`feed-direction-tag feed-direction-tag--${card.direction.toLowerCase()}`}>
            {card.direction}
          </span>
        </div>

        <div className="feed-price-row">
          <span className="feed-price">{card.price}</span>
          <span className={`feed-change ${card.positive ? 'positive' : 'negative'}`}>
            {card.change}
          </span>
        </div>

        {/* Sparkline chart */}
        <div className="feed-chart">
          <Sparkline data={card.sparkline} positive={card.positive} accent={card.accent} />
        </div>

        {/* Description */}
        <p className="feed-description">{card.description}</p>

        {/* Tags */}
        <div className="feed-tags">
          {card.tags.map((t) => (
            <span key={t} className="feed-tag" style={{ color: card.accent }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Right action bar ─── */}
      <div className="feed-actions">
        <div className="feed-action-item">
          <button
            className={`feed-action-btn${liked ? ' liked' : ''}`}
            onClick={handleLike}
            aria-label="Like"
          >
            {liked ? '❤️' : '🤍'}
          </button>
          <span className="feed-action-count">{formatCount(likeCount)}</span>
        </div>

        <div className="feed-action-item">
          <button
            className={`feed-action-btn${showComment ? ' active' : ''}`}
            onClick={() => setShowComment((s) => !s)}
            aria-label="Comment"
          >
            💬
          </button>
          <span className="feed-action-count">{formatCount(card.comments)}</span>
        </div>

        <div className="feed-action-item">
          <button
            className={`feed-action-btn${saved ? ' saved' : ''}`}
            onClick={() => setSaved((s) => !s)}
            aria-label="Bookmark"
          >
            {saved ? '🔖' : '📌'}
          </button>
          <span className="feed-action-count">{formatCount(card.bookmarks)}</span>
        </div>

        <div className="feed-action-item">
          <button className="feed-action-btn" aria-label="Share">📤</button>
          <span className="feed-action-count">{formatCount(card.shares)}</span>
        </div>
      </div>

      {/* ── Bottom: analyst info + trade button ─── */}
      <div className="feed-bottom">
        <div className="feed-analyst">
          <span className="feed-analyst-avatar">{card.avatar}</span>
          <div className="feed-analyst-info">
            <span className="feed-analyst-name">{card.analyst}</span>
            <span className="feed-analyst-time">{card.time}</span>
          </div>
        </div>
        <button
          className="feed-trade-btn"
          style={{ background: card.accent, color: '#0a0a1a' }}
        >
          ⚡ Trade Now
        </button>
      </div>

      {/* ── Comment input overlay ─── */}
      {showComment && (
        <div className="feed-comment-overlay">
          <input
            className="feed-comment-input"
            placeholder="Add a comment…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && comment.trim()) {
                setComment('');
                setShowComment(false);
              }
            }}
            autoFocus
          />
          <button
            className="feed-comment-send"
            onClick={() => { setComment(''); setShowComment(false); }}
          >
            ↩
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Bottom navigation bar ────────────────────────────────────────────────── */

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home',    icon: '🏠', label: 'Feed'    },
    { id: 'explore', icon: '🔍', label: 'Explore' },
    { id: 'signals', icon: '⚡', label: 'Signals' },
    { id: 'inbox',   icon: '💬', label: 'Inbox'   },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <nav className="feed-bottom-nav">
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`feed-nav-btn${activeTab === t.id ? ' feed-nav-btn--active' : ''}`}
          onClick={() => onTabChange(t.id)}
        >
          <span className="feed-nav-icon">{t.icon}</span>
          <span className="feed-nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
};

/* ── Main MarketFeed component ────────────────────────────────────────────── */

const MarketFeed = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const feedRef = useRef(null);

  /* Snap scroll: detect which card is centred */
  const onScroll = useCallback(() => {
    if (!feedRef.current) return;
    const el = feedRef.current;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    setActiveIndex(idx);
  }, []);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown') {
        const next = Math.min(activeIndex + 1, FEED_CARDS.length - 1);
        feedRef.current?.scrollTo({ top: next * feedRef.current.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp') {
        const prev = Math.max(activeIndex - 1, 0);
        feedRef.current?.scrollTo({ top: prev * feedRef.current.clientHeight, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex]);

  return (
    <div className="market-feed-wrapper">
      {/* Progress dots */}
      <div className="feed-progress-dots">
        {FEED_CARDS.map((_, i) => (
          <button
            key={i}
            className={`feed-dot${i === activeIndex ? ' feed-dot--active' : ''}`}
            onClick={() =>
              feedRef.current?.scrollTo({ top: i * feedRef.current.clientHeight, behavior: 'smooth' })
            }
            aria-label={`Go to card ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll container */}
      <div className="feed-scroll-container" ref={feedRef}>
        {FEED_CARDS.map((card, i) => (
          <FeedCard key={card.id} card={card} active={i === activeIndex} />
        ))}
      </div>

      {/* Bottom navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MarketFeed;

```

## src/components/SuperAdmin/SuperAdmin.js

```js
import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { formatProfit } from '../../utils/formatters';
import {
  CRM_ADD_CLIENT,
  CRM_DELETE_CLIENT,
  CRM_UPDATE_CLIENT,
  UPDATE_ACCOUNT,
  ADD_LOG,
} from '../../store/actions/actionTypes';
import './SuperAdmin.css';

/**
 * SuperAdmin – Super-Administrator control panel.
 *
 * Provides privileged operations beyond the broker dashboard:
 *  • Global platform statistics
 *  • User / broker account management (create, suspend, adjust balance)
 *  • Symbol configuration (spread, leverage cap)
 *  • Trade history review
 *  • System settings
 *
 * Access: "super_admin" role only (set via Login component).
 */

// ── Symbol configuration defaults ──────────────────────────────────────────
const DEFAULT_SYMBOLS = [
  { symbol: 'EURUSD',  spread: 1.0, leverageCap: 500, active: true  },
  { symbol: 'GBPUSD',  spread: 1.2, leverageCap: 500, active: true  },
  { symbol: 'USDJPY',  spread: 1.0, leverageCap: 500, active: true  },
  { symbol: 'USDCHF',  spread: 1.5, leverageCap: 500, active: true  },
  { symbol: 'AUDUSD',  spread: 1.3, leverageCap: 500, active: true  },
  { symbol: 'USDCAD',  spread: 1.4, leverageCap: 500, active: true  },
  { symbol: 'NZDUSD',  spread: 1.6, leverageCap: 500, active: true  },
  { symbol: 'XAUUSD',  spread: 3.0, leverageCap: 100, active: true  },
  { symbol: 'XAGUSD',  spread: 4.0, leverageCap: 100, active: true  },
  { symbol: 'BTCUSD',  spread: 50,  leverageCap: 10,  active: false },
];

const TABS = ['overview', 'accounts', 'symbols', 'trades', 'settings'];
const TAB_LABELS = {
  overview: '📊 Overview',
  accounts: '👤 Accounts',
  symbols:  '📈 Symbols',
  trades:   '📋 Trades',
  settings: '⚙️ Settings',
};

// ── Demo client names ────────────────────────────────────────────────────────
const DEMO_CLIENT_NAMES = ['Alice Johnson', 'Bob Chen', 'Carlos Ruiz', 'Diana Park', 'Ethan Walsh'];

// ── Helpers ──────────────────────────────────────────────────────────────────
// Use Web Crypto API when available; fall back for environments that don't support it.
const newId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  }
  return Math.random().toString(36).slice(2, 10).toUpperCase();
};

const SuperAdmin = () => {
  const dispatch   = useDispatch();
  const orders     = useSelector((s) => s.orders);
  const account    = useSelector((s) => s.account);
  const crmClients = useSelector((s) => s.crm.clients);

  const [tab, setTab]              = useState('overview');
  const [symbols, setSymbols]      = useState(DEFAULT_SYMBOLS);
  const [brokers, setBrokers]      = useState([
    { id: 'B001', name: 'VDA Prime Broker', email: 'broker@vda.trade',  role: 'broker',      status: 'active',    clients: crmClients.length, balance: 250000 },
    { id: 'B002', name: 'Alpha Capital',    email: 'alpha@cap.trade',   role: 'broker',      status: 'active',    clients: 34,                balance: 180000 },
    { id: 'B003', name: 'TestBroker',       email: 'test@broker.com',   role: 'broker',      status: 'suspended', clients: 2,                 balance: 5000   },
  ]);
  const [settings, setSettings]    = useState({
    maxLeverage:       500,
    minDeposit:        100,
    maintenanceMode:   false,
    registrationOpen:  true,
    defaultCurrency:   'USD',
    platformName:      'VDA Trading Terminal',
    supportEmail:      'support@vda.trade',
  });
  const [newBroker, setNewBroker]  = useState({ name: '', email: '', role: 'broker' });
  const [adjTarget, setAdjTarget]  = useState('');
  const [adjAmount, setAdjAmount]  = useState('');
  const [adjNote,   setAdjNote]    = useState('');
  const [msg,       setMsg]        = useState('');

  // ── Flash message helper ─────────────────────────────────────────────────
  const flash = useCallback((text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }, []);

  // ── Computed overview stats ──────────────────────────────────────────────
  const totalOpenOrders  = orders.openOrders.length;
  const totalPnL         = orders.openOrders.reduce((s, o) => s + (o.profit || 0), 0);
  const closedOrders     = orders.closedOrders || [];
  const totalVolume      = [...orders.openOrders, ...closedOrders].reduce((s, o) => s + o.lots, 0);
  const activeAccounts   = brokers.filter((b) => b.status === 'active').length;
  const suspendedCount   = brokers.filter((b) => b.status === 'suspended').length;
  const totalClients     = brokers.reduce((s, b) => s + b.clients, 0);

  // ── Create broker account ────────────────────────────────────────────────
  const handleCreateBroker = () => {
    if (!newBroker.name.trim() || !newBroker.email.trim()) {
      flash('Name and email are required.');
      return;
    }
    const broker = {
      id:      `B${newId()}`,
      name:    newBroker.name.trim(),
      email:   newBroker.email.trim(),
      role:    newBroker.role,
      status:  'active',
      clients: 0,
      balance: 0,
    };
    setBrokers((prev) => [...prev, broker]);
    dispatch({ type: ADD_LOG, payload: `[ADMIN] Created broker "${broker.name}" (${broker.email})` });
    setNewBroker({ name: '', email: '', role: 'broker' });
    flash(`Broker "${broker.name}" created.`);
  };

  // ── Suspend / reinstate account ──────────────────────────────────────────
  const handleToggleSuspend = (id) => {
    setBrokers((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === 'active' ? 'suspended' : 'active' }
          : b
      )
    );
    const broker = brokers.find((b) => b.id === id);
    if (broker) {
      const next = broker.status === 'active' ? 'suspended' : 'active';
      dispatch({ type: ADD_LOG, payload: `[ADMIN] Account "${broker.name}" set to ${next}` });
      flash(`"${broker.name}" is now ${next}.`);
    }
  };

  // ── Balance adjustment (demo account) ────────────────────────────────────
  const handleAdjustBalance = () => {
    const amount = parseFloat(adjAmount);
    if (isNaN(amount)) { flash('Enter a valid amount.'); return; }
    dispatch({ type: UPDATE_ACCOUNT, payload: { balance: Math.max(0, account.balance + amount) } });
    dispatch({ type: ADD_LOG, payload: `[ADMIN] Balance adjusted by ${amount >= 0 ? '+' : ''}${amount.toFixed(2)} — ${adjNote || 'admin adjustment'}` });

    if (adjTarget) {
      // Also record in CRM if client matches
      const client = crmClients.find(
        (c) => c.name.toLowerCase().includes(adjTarget.toLowerCase()) ||
               c.email.toLowerCase().includes(adjTarget.toLowerCase())
      );
      if (client) {
        dispatch({
          type: CRM_UPDATE_CLIENT,
          payload: { id: client.id, balance: (client.balance || 0) + amount },
        });
      }
    }
    setAdjTarget(''); setAdjAmount(''); setAdjNote('');
    flash(`Balance adjusted by ${amount >= 0 ? '+' : ''}${amount.toFixed(2)}.`);
  };

  // ── Symbol toggle ────────────────────────────────────────────────────────
  const handleToggleSymbol = (sym) => {
    setSymbols((prev) =>
      prev.map((s) => s.symbol === sym ? { ...s, active: !s.active } : s)
    );
    dispatch({ type: ADD_LOG, payload: `[ADMIN] Symbol ${sym} toggled` });
  };

  const handleSpreadChange = (sym, value) => {
    const spread = parseFloat(value);
    if (isNaN(spread) || spread < 0) return;
    setSymbols((prev) =>
      prev.map((s) => s.symbol === sym ? { ...s, spread } : s)
    );
  };

  const handleLevCapChange = (sym, value) => {
    const cap = parseInt(value, 10);
    if (isNaN(cap) || cap < 1) return;
    setSymbols((prev) =>
      prev.map((s) => s.symbol === sym ? { ...s, leverageCap: cap } : s)
    );
  };

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSaveSettings = () => {
    dispatch({ type: ADD_LOG, payload: '[ADMIN] System settings saved' });
    flash('Settings saved successfully.');
  };

  // ── Add demo CRM client ───────────────────────────────────────────────────
  const handleAddDemoClient = () => {
    const name = DEMO_CLIENT_NAMES[Math.floor(Math.random() * DEMO_CLIENT_NAMES.length)];
    dispatch({
      type: CRM_ADD_CLIENT,
      payload: {
        id:      `SA-${newId()}`,
        name,
        email:   `${name.split(' ')[0].toLowerCase()}@demo.trade`,
        phone:   '+1-555-' + Math.floor(1000 + Math.random() * 9000),
        country: 'US',
        stage:   'lead',
        balance: 0,
        kyc:     'pending',
        notes:   [],
        transactions: [],
        rep: 'admin',
      },
    });
    flash(`Demo client "${name}" added to CRM.`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="super-admin">
      {/* Header */}
      <div className="sa-header">
        <span className="sa-title">👑 Super Admin Control Panel</span>
        <span className="sa-subtitle">Platform Management · Full Access</span>
        {msg && <span className="sa-flash">{msg}</span>}
      </div>

      {/* Tab nav */}
      <div className="sa-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`sa-tab${tab === t ? ' sa-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="sa-content">
          <div className="sa-kpi-grid">
            <KpiCard label="Open Positions"  value={totalOpenOrders}            color="#a0b0ff" />
            <KpiCard label="Total Volume"    value={`${totalVolume.toFixed(2)} lots`} color="#50d0a0" />
            <KpiCard label="Floating P&L"    value={formatProfit(totalPnL)}     color={totalPnL >= 0 ? '#50d0a0' : '#ff6060'} />
            <KpiCard label="Active Brokers"  value={activeAccounts}             color="#a0b0ff" />
            <KpiCard label="Suspended"       value={suspendedCount}             color={suspendedCount ? '#ff6060' : '#50d0a0'} />
            <KpiCard label="Total Clients"   value={totalClients + crmClients.length} color="#e0c040" />
            <KpiCard label="Demo Balance"    value={`$${account.balance.toFixed(2)}`} color="#50d0a0" />
            <KpiCard label="Demo Equity"     value={`$${account.equity.toFixed(2)}`}  color="#a0b0ff" />
          </div>

          <div className="sa-section">
            <div className="sa-section-title">Balance Adjustment</div>
            <div className="sa-row">
              <input
                className="sa-input"
                placeholder="Client name or email (optional)"
                value={adjTarget}
                onChange={(e) => setAdjTarget(e.target.value)}
              />
              <input
                className="sa-input sa-input-sm"
                type="number"
                placeholder="Amount (+ / -)"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
              />
              <input
                className="sa-input"
                placeholder="Note / reason"
                value={adjNote}
                onChange={(e) => setAdjNote(e.target.value)}
              />
              <button className="sa-btn sa-btn-primary" onClick={handleAdjustBalance}>
                Adjust
              </button>
            </div>
          </div>

          <div className="sa-section">
            <div className="sa-section-title">Quick Actions</div>
            <div className="sa-row">
              <button className="sa-btn" onClick={handleAddDemoClient}>
                + Add Demo Client
              </button>
              <button
                className={`sa-btn ${settings.maintenanceMode ? 'sa-btn-danger' : ''}`}
                onClick={() => {
                  setSettings((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }));
                  flash(`Maintenance mode ${settings.maintenanceMode ? 'disabled' : 'enabled'}.`);
                }}
              >
                {settings.maintenanceMode ? '🔴 Maintenance ON' : '🟢 Maintenance OFF'}
              </button>
              <button
                className="sa-btn"
                onClick={() => {
                  setSettings((s) => ({ ...s, registrationOpen: !s.registrationOpen }));
                  flash(`Registration ${settings.registrationOpen ? 'closed' : 'opened'}.`);
                }}
              >
                {settings.registrationOpen ? '🔓 Registration Open' : '🔒 Registration Closed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Accounts ─────────────────────────────────────────────────────── */}
      {tab === 'accounts' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">Create Broker Account</div>
            <div className="sa-row">
              <input
                className="sa-input"
                placeholder="Broker / firm name"
                value={newBroker.name}
                onChange={(e) => setNewBroker((b) => ({ ...b, name: e.target.value }))}
              />
              <input
                className="sa-input"
                placeholder="Email address"
                value={newBroker.email}
                onChange={(e) => setNewBroker((b) => ({ ...b, email: e.target.value }))}
              />
              <select
                className="sa-select"
                value={newBroker.role}
                onChange={(e) => setNewBroker((b) => ({ ...b, role: e.target.value }))}
              >
                <option value="broker">Broker</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <button className="sa-btn sa-btn-primary" onClick={handleCreateBroker}>
                Create
              </button>
            </div>
          </div>

          <div className="sa-section">
            <div className="sa-section-title">Broker Accounts</div>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Clients</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map((b) => (
                  <tr key={b.id} className={b.status === 'suspended' ? 'sa-row-suspended' : ''}>
                    <td className="sa-mono">{b.id}</td>
                    <td>{b.name}</td>
                    <td className="sa-dim">{b.email}</td>
                    <td><span className={`sa-badge sa-role-${b.role}`}>{b.role}</span></td>
                    <td className="sa-center">{b.clients}</td>
                    <td className="sa-right">${b.balance.toLocaleString()}</td>
                    <td>
                      <span className={`sa-badge ${b.status === 'active' ? 'sa-status-active' : 'sa-status-suspended'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`sa-btn sa-btn-sm ${b.status === 'active' ? 'sa-btn-warn' : 'sa-btn-ok'}`}
                        onClick={() => handleToggleSuspend(b.id)}
                      >
                        {b.status === 'active' ? 'Suspend' : 'Reinstate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Symbols ──────────────────────────────────────────────────────── */}
      {tab === 'symbols' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">Symbol Configuration</div>
            <table className="sa-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Spread (pts)</th>
                  <th>Max Leverage</th>
                  <th>Status</th>
                  <th>Toggle</th>
                </tr>
              </thead>
              <tbody>
                {symbols.map((s) => (
                  <tr key={s.symbol} className={s.active ? '' : 'sa-row-suspended'}>
                    <td className="sa-symbol">{s.symbol}</td>
                    <td>
                      <input
                        className="sa-input sa-input-num"
                        type="number"
                        min="0"
                        step="0.1"
                        value={s.spread}
                        onChange={(e) => handleSpreadChange(s.symbol, e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="sa-input sa-input-num"
                        type="number"
                        min="1"
                        step="1"
                        value={s.leverageCap}
                        onChange={(e) => handleLevCapChange(s.symbol, e.target.value)}
                      />
                    </td>
                    <td>
                      <span className={`sa-badge ${s.active ? 'sa-status-active' : 'sa-status-suspended'}`}>
                        {s.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`sa-btn sa-btn-sm ${s.active ? 'sa-btn-warn' : 'sa-btn-ok'}`}
                        onClick={() => handleToggleSymbol(s.symbol)}
                      >
                        {s.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Trades ───────────────────────────────────────────────────────── */}
      {tab === 'trades' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">
              Open Positions ({orders.openOrders.length})
            </div>
            {orders.openOrders.length === 0 ? (
              <div className="sa-empty">No open positions.</div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Lots</th>
                    <th>Open Price</th>
                    <th>SL</th>
                    <th>TP</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.openOrders.map((o) => (
                    <tr key={o.ticket}>
                      <td className="sa-mono">{o.ticket}</td>
                      <td className="sa-symbol">{o.symbol}</td>
                      <td className={`sa-type-${o.type.toLowerCase()}`}>{o.type}</td>
                      <td className="sa-center">{o.lots}</td>
                      <td className="sa-right">{o.openPrice}</td>
                      <td className="sa-right sa-dim">{o.sl || '—'}</td>
                      <td className="sa-right sa-dim">{o.tp || '—'}</td>
                      <td className={`sa-right ${(o.profit || 0) >= 0 ? 'sa-profit' : 'sa-loss'}`}>
                        {formatProfit(o.profit || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="sa-section">
            <div className="sa-section-title">
              Trade History ({closedOrders.length})
            </div>
            {closedOrders.length === 0 ? (
              <div className="sa-empty">No closed trades yet.</div>
            ) : (
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Lots</th>
                    <th>Open</th>
                    <th>Close</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {closedOrders.map((o) => (
                    <tr key={o.ticket}>
                      <td className="sa-mono">{o.ticket}</td>
                      <td className="sa-symbol">{o.symbol}</td>
                      <td className={`sa-type-${o.type.toLowerCase()}`}>{o.type}</td>
                      <td className="sa-center">{o.lots}</td>
                      <td className="sa-right">{o.openPrice}</td>
                      <td className="sa-right">{o.closePrice || '—'}</td>
                      <td className={`sa-right ${(o.profit || 0) >= 0 ? 'sa-profit' : 'sa-loss'}`}>
                        {formatProfit(o.profit || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="sa-content">
          <div className="sa-section">
            <div className="sa-section-title">Platform Settings</div>
            <div className="sa-form-grid">
              <label className="sa-label">Platform Name</label>
              <input
                className="sa-input"
                value={settings.platformName}
                onChange={(e) => setSettings((s) => ({ ...s, platformName: e.target.value }))}
              />

              <label className="sa-label">Support Email</label>
              <input
                className="sa-input"
                value={settings.supportEmail}
                onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
              />

              <label className="sa-label">Default Currency</label>
              <select
                className="sa-select"
                value={settings.defaultCurrency}
                onChange={(e) => setSettings((s) => ({ ...s, defaultCurrency: e.target.value }))}
              >
                {['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <label className="sa-label">Global Max Leverage</label>
              <input
                className="sa-input sa-input-sm"
                type="number"
                min="1"
                max="2000"
                value={settings.maxLeverage}
                onChange={(e) => setSettings((s) => ({ ...s, maxLeverage: parseInt(e.target.value, 10) || 500 }))}
              />

              <label className="sa-label">Minimum Deposit ($)</label>
              <input
                className="sa-input sa-input-sm"
                type="number"
                min="0"
                value={settings.minDeposit}
                onChange={(e) => setSettings((s) => ({ ...s, minDeposit: parseInt(e.target.value, 10) || 0 }))}
              />

              <label className="sa-label">Maintenance Mode</label>
              <div className="sa-toggle-row">
                <button
                  className={`sa-btn ${settings.maintenanceMode ? 'sa-btn-danger' : 'sa-btn-ok'}`}
                  onClick={() => setSettings((s) => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                >
                  {settings.maintenanceMode ? '🔴 ON' : '🟢 OFF'}
                </button>
              </div>

              <label className="sa-label">Open Registration</label>
              <div className="sa-toggle-row">
                <button
                  className={`sa-btn ${settings.registrationOpen ? 'sa-btn-ok' : 'sa-btn-warn'}`}
                  onClick={() => setSettings((s) => ({ ...s, registrationOpen: !s.registrationOpen }))}
                >
                  {settings.registrationOpen ? '🔓 Open' : '🔒 Closed'}
                </button>
              </div>
            </div>

            <div className="sa-row sa-mt">
              <button className="sa-btn sa-btn-primary" onClick={handleSaveSettings}>
                💾 Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── KPI Card sub-component ────────────────────────────────────────────────
const KpiCard = ({ label, value, color }) => (
  <div className="sa-kpi-card">
    <div className="sa-kpi-value" style={{ color }}>{value}</div>
    <div className="sa-kpi-label">{label}</div>
  </div>
);

export default SuperAdmin;

```

---

## Source Code — Additional Tests

## src/__tests__/trading.test.js

```js
import { calculateMargin, calculateProfit } from '../utils/constants';

describe('calculateMargin', () => {
  it('calculates correct margin for EURUSD (quote-USD pair)', () => {
    // 0.1 lot EURUSD @ 1.0850, leverage 100
    // margin = 1.0850 * 0.1 * 100000 / 100 = $108.50
    const margin = calculateMargin('EURUSD', 0.1, 1.085, 100);
    expect(margin).toBeCloseTo(108.5, 1);
  });

  it('calculates correct margin for USDJPY (USD-base pair)', () => {
    // 0.1 lot USDJPY @ 149.50, leverage 100
    // margin = 0.1 * 100000 / 100 = $100 (not affected by JPY rate)
    const margin = calculateMargin('USDJPY', 0.1, 149.5, 100);
    expect(margin).toBeCloseTo(100, 1);
  });

  it('calculates correct margin for XAUUSD (gold, 100 oz per lot)', () => {
    // 0.1 lot XAUUSD @ 2020, leverage 100
    // margin = 2020 * 0.1 * 100 / 100 = $202
    const margin = calculateMargin('XAUUSD', 0.1, 2020, 100);
    expect(margin).toBeCloseTo(202, 1);
  });

  it('calculates correct margin for BTCUSD (crypto, 1 unit per lot)', () => {
    // 0.1 lot BTCUSD @ 52000, leverage 100
    // margin = 52000 * 0.1 * 1 / 100 = $52
    const margin = calculateMargin('BTCUSD', 0.1, 52000, 100);
    expect(margin).toBeCloseTo(52, 1);
  });

  it('uses leverage=100 as default when not provided', () => {
    const m1 = calculateMargin('EURUSD', 0.1, 1.085, 100);
    const m2 = calculateMargin('EURUSD', 0.1, 1.085, undefined);
    expect(m1).toBe(m2);
  });
});

describe('calculateProfit', () => {
  it('calculates correct profit for BUY EURUSD (quote-USD)', () => {
    // 0.1 lot BUY EURUSD, open 1.0850, close 1.0860 → 10 pips
    // profit = (1.0860 - 1.0850) * 0.1 * 100000 = $10
    const profit = calculateProfit('EURUSD', 'BUY', 1.085, 1.086, 0.1);
    expect(profit).toBeCloseTo(10, 0);
  });

  it('calculates correct profit for SELL EURUSD (quote-USD)', () => {
    // 0.1 lot SELL EURUSD, open 1.0860, close 1.0850 → 10 pips profit
    const profit = calculateProfit('EURUSD', 'SELL', 1.086, 1.085, 0.1);
    expect(profit).toBeCloseTo(10, 0);
  });

  it('calculates negative profit for losing trade', () => {
    // 0.1 lot BUY EURUSD, price goes down 10 pips
    const profit = calculateProfit('EURUSD', 'BUY', 1.086, 1.085, 0.1);
    expect(profit).toBeCloseTo(-10, 0);
  });

  it('calculates correct profit for USDJPY (USD-base pair)', () => {
    // 0.1 lot BUY USDJPY, open 149.50, close 149.60 (10 pips)
    // profit in JPY = (149.60 - 149.50) * 0.1 * 100000 = 1000 JPY
    // profit in USD = 1000 / 149.60 ≈ $6.68
    const profit = calculateProfit('USDJPY', 'BUY', 149.5, 149.6, 0.1);
    expect(profit).toBeGreaterThan(0);
    expect(profit).toBeCloseTo(6.68, 0);
  });

  it('calculates correct profit for XAUUSD (gold)', () => {
    // 0.1 lot BUY XAU, open 2020, close 2030 → $10 move
    // profit = 10 * 0.1 * 100 = $100
    const profit = calculateProfit('XAUUSD', 'BUY', 2020, 2030, 0.1);
    expect(profit).toBeCloseTo(100, 0);
  });

  it('calculates correct profit for BTCUSD (crypto)', () => {
    // 0.1 lot BUY BTC, open 52000, close 52100 → $100 move
    // profit = 100 * 0.1 * 1 = $10
    const profit = calculateProfit('BTCUSD', 'BUY', 52000, 52100, 0.1);
    expect(profit).toBeCloseTo(10, 0);
  });

  it('returns zero profit when open and close price are equal', () => {
    const profit = calculateProfit('EURUSD', 'BUY', 1.085, 1.085, 0.1);
    expect(profit).toBe(0);
  });
});

```

---

## Quick Reference — Key Facts for ChatGPT

| Topic | Detail |
|---|---|
| **Live URL** | https://virtuex-digital-assets.github.io/vda-trading-terminal |
| **Repo URL** | https://github.com/virtuex-digital-assets/vda-trading-terminal |
| **CRM repo URL** | https://github.com/virtuex-digital-assets/vda-crm-system |
| **Tech stack** | React 17, Redux 4, react-redux 7, Create React App 4 |
| **Build command** | `npm run build` (uses `NODE_OPTIONS=--openssl-legacy-provider`) |
| **Test command** | `CI=true npm test -- --watchAll=false` |
| **Dev server** | `npm start` → http://localhost:3000 |
| **Deploy** | GitHub Actions → peaceiris/actions-gh-pages@v4 → gh-pages branch |
| **MT4 bridge** | WebSocket via `REACT_APP_MT4_BRIDGE_URL` env var; falls back to built-in simulator |
| **Symbols** | EURUSD, GBPUSD, USDJPY, XAUUSD, USDCHF, AUDUSD, USDCAD, NZDUSD, BTCUSD, ETHUSD |
| **Demo account** | $10,000 balance, 1:100 leverage, USD |
| **Tests** | 48 tests across 4 suites (all passing) |
| **CRM seed data** | 10 clients with 7 pipeline stages, notes, transactions |

