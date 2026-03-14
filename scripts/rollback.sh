#!/usr/bin/env bash
# =============================================================================
# VDA Trading Platform – Rollback Script
# =============================================================================
# Rolls back to the previous Docker image version.
#
# Usage:
#   ./scripts/rollback.sh [service]
#   service: backend | frontend | all (default: all)
# =============================================================================

set -euo pipefail

SERVICE="${1:-all}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "==================================================="
echo " VDA Trading Platform – Rollback"
echo " Service   : $SERVICE"
echo " Timestamp : $TIMESTAMP"
echo "==================================================="

# ── Pull previous image tag ──────────────────────────────────────────────────
PREV_TAG="${ROLLBACK_TAG:-previous}"

rollback_service() {
  local svc="$1"
  echo ""
  echo "[INFO] Rolling back service: $svc (tag: $PREV_TAG)"
  docker compose stop "$svc" || true
  docker compose rm -f "$svc" || true

  # Re-tag: pull the :previous tag if it exists
  IMAGE="${REGISTRY:-vda}/${svc}:${PREV_TAG}"
  if docker image inspect "$IMAGE" > /dev/null 2>&1; then
    docker compose up -d "$svc"
    echo "[OK] $svc rolled back to $PREV_TAG"
  else
    echo "[WARN] Previous image '$IMAGE' not found locally."
    echo "       Starting last available image..."
    docker compose up -d "$svc"
  fi
}

if [[ "$SERVICE" == "all" ]]; then
  rollback_service "backend"
  rollback_service "frontend"
else
  rollback_service "$SERVICE"
fi

# ── Health check after rollback ──────────────────────────────────────────────
echo ""
echo "[INFO] Running health check after rollback..."
sleep 5
if ./scripts/health-check.sh; then
  echo "[OK] Rollback health check passed."
else
  echo "[ERROR] Rollback health check FAILED. Manual intervention required."
  exit 1
fi

echo ""
echo "==================================================="
echo " Rollback COMPLETE – $SERVICE"
echo "==================================================="
