#!/usr/bin/env bash
set -euo pipefail
INSTANCE="${INSTANCE:-https://example.com}"
INSTANCE="${INSTANCE%/}"
: "${TOKEN:?请设置 TOKEN}"
TEXT="${TEXT:-Hello from an open app (curl)}"
curl -sS -X POST "$INSTANCE/api/notes/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"text\":$(printf '%s' "$TEXT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}"
echo
