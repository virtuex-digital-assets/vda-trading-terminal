#!/usr/bin/env bash
# =============================================================================
# VDA Trading Platform – Deployment Script
# =============================================================================
# Usage:
#   ./scripts/deploy.sh [environment]
#   environment: staging | production (default: staging)
#
# Prerequisites:
#   - Docker and Docker Compose installed
#   - .env file configured with production secrets
#   - Database accessible and migrations applied
# =============================================================================

set -euo pipefail

ENV="${1:-staging}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/tmp/deploy_${TIMESTAMP}.log"

echo "==================================================="
echo " VDA Trading Platform – Deploy Script"
echo " Environment : $ENV"
echo " Timestamp   : $TIMESTAMP"
echo "==================================================="

# ── Validate environment ─────────────────────────────────────────────────────
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo "ERROR: Invalid environment '$ENV'. Use 'staging' or 'production'."
  exit 1
fi

# ── Load environment variables ───────────────────────────────────────────────
if [[ -f ".env.${ENV}" ]]; then
  echo "[INFO] Loading .env.${ENV}"
  set -o allexport
  # shellcheck source=/dev/null
  source ".env.${ENV}"
  set +o allexport
elif [[ -f ".env" ]]; then
  echo "[WARN] .env.${ENV} not found, falling back to .env"
  set -o allexport
  # shellcheck source=/dev/null
  source ".env"
  set +o allexport
else
  echo "[WARN] No .env file found. Using existing environment variables."
fi

# ── Pre-deploy health check ──────────────────────────────────────────────────
echo ""
echo "[STEP 1/6] Running pre-deploy health check..."
if ./scripts/health-check.sh > "$LOG_FILE" 2>&1; then
  echo "[OK] Pre-deploy health check passed."
else
  echo "[WARN] Pre-deploy health check failed (first deploy or service down). Continuing..."
fi

# ── Build Docker images ──────────────────────────────────────────────────────
echo ""
echo "[STEP 2/6] Building Docker images..."
docker compose build --no-cache 2>&1 | tee -a "$LOG_FILE"
echo "[OK] Docker images built."

# ── Run database migrations ──────────────────────────────────────────────────
echo ""
echo "[STEP 3/6] Running database migrations..."
if [[ -n "${DATABASE_URL:-}" ]]; then
  for migration in database/migrations/*.sql; do
    echo "  Applying: $migration"
    psql "$DATABASE_URL" -f "$migration" >> "$LOG_FILE" 2>&1 || echo "  [WARN] Migration may already be applied: $migration"
  done
  echo "[OK] Migrations applied."
else
  echo "[WARN] DATABASE_URL not set. Skipping migrations."
fi

# ── Stop current containers ──────────────────────────────────────────────────
echo ""
echo "[STEP 4/6] Stopping current containers..."
docker compose down --remove-orphans 2>&1 | tee -a "$LOG_FILE"
echo "[OK] Containers stopped."

# ── Start new containers ─────────────────────────────────────────────────────
echo ""
echo "[STEP 5/6] Starting new containers..."
docker compose up -d 2>&1 | tee -a "$LOG_FILE"
echo "[OK] Containers started."

# ── Post-deploy health check ─────────────────────────────────────────────────
echo ""
echo "[STEP 6/6] Running post-deploy health check..."
sleep 5
if ./scripts/health-check.sh; then
  echo "[OK] Post-deploy health check passed."
else
  echo "[ERROR] Post-deploy health check FAILED!"
  echo "  Running rollback..."
  ./scripts/rollback.sh
  exit 1
fi

echo ""
echo "==================================================="
echo " Deployment SUCCESSFUL – $ENV"
echo " Log: $LOG_FILE"
echo "==================================================="
