#!/usr/bin/env bash
# =============================================================================
# VDA Trading Platform – Health Check Script
# =============================================================================
# Checks the health of all platform services.
# Exit codes:
#   0 = all healthy
#   1 = one or more services unhealthy
# =============================================================================

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
MAX_RETRIES=3
RETRY_DELAY=2

PASS=0
FAIL=0

check() {
  local name="$1"
  local url="$2"
  local expected="${3:-200}"
  local retries=0

  while [[ $retries -lt $MAX_RETRIES ]]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
    if [[ "$code" == "$expected" ]]; then
      echo "[OK]   $name → $url (HTTP $code)"
      PASS=$((PASS + 1))
      return 0
    fi
    retries=$((retries + 1))
    if [[ $retries -lt $MAX_RETRIES ]]; then
      sleep "$RETRY_DELAY"
    fi
  done

  echo "[FAIL] $name → $url (HTTP $code, expected $expected)"
  FAIL=$((FAIL + 1))
  return 1
}

echo "==================================================="
echo " VDA Trading Platform – Health Check"
echo " $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "==================================================="
echo ""

# Backend health endpoint
check "Backend API"       "$BACKEND_URL/health"
check "Auth endpoint"     "$BACKEND_URL/api/auth/me" "401"
check "Symbols endpoint"  "$BACKEND_URL/api/symbols" "401"

# Frontend (if configured)
if [[ -n "${CHECK_FRONTEND:-}" ]]; then
  check "Frontend"        "$FRONTEND_URL" "200"
fi

echo ""
echo "==================================================="
echo " Results: $PASS passed, $FAIL failed"
echo "==================================================="

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi

exit 0
