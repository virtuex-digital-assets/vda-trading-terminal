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
