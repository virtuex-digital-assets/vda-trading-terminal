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
