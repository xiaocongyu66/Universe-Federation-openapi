#!/usr/bin/env bash
set -euo pipefail
INSTANCE="${INSTANCE:-https://example.com}"
INSTANCE="${INSTANCE%/}"
curl -sS -X POST "$INSTANCE/api/meta" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"detail":true}'
echo
