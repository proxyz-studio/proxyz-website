#!/usr/bin/env bash
# publish-proposal.sh — push a self-contained proposal HTML file live at
# https://proxyz.studio/p/<slug> in seconds. No git push, no rebuild: the
# HTML + access code land in Redis via /api/proposal-put and the page is
# served immediately by the already-deployed viewer.
#
# Usage:
#   scripts/publish-proposal.sh <slug> <html-file> <code> [title]   publish
#   scripts/publish-proposal.sh responses <slug>                    list replies
#
#   slug   lowercase letters, digits, hyphens (2-40 chars), e.g. cloud11
#   code   exactly 4 digits, e.g. 7421
#   title  optional browser-tab title (defaults to the slug)
#
# Auth:
#   Reads the admin secret from ~/.proxyz/proposal-admin-secret (chmod 600).
#   The same value must be set as PROPOSAL_ADMIN_SECRET in Vercel env.
#
# Target override (preview deployments):
#   PROPOSAL_HOST=https://<preview>.vercel.app scripts/publish-proposal.sh ...

set -euo pipefail

usage() {
  echo "usage: $(basename "$0") <slug> <html-file> <code> [title]" >&2
  echo "       $(basename "$0") responses <slug>" >&2
  exit 64
}

HOST="${PROPOSAL_HOST:-https://proxyz.studio}"
SECRET_FILE="${PROPOSAL_ADMIN_SECRET_FILE:-$HOME/.proxyz/proposal-admin-secret}"

require_secret_file() {
  if [ ! -f "$SECRET_FILE" ]; then
    echo "error: admin secret not found at $SECRET_FILE" >&2
    echo "       create it with:  mkdir -p ~/.proxyz && (umask 077; printf '%s' '<secret>' > $SECRET_FILE)" >&2
    exit 67
  fi
}

# ── responses subcommand ────────────────────────────────────────────────
# GETs /api/proposal-responses with the admin header and pretty-prints
# the captured replies, newest first.
if [ "${1:-}" = "responses" ]; then
  [ $# -eq 2 ] || usage
  SLUG="$2"
  if ! printf '%s' "$SLUG" | grep -Eq '^[a-z0-9-]{2,40}$'; then
    echo "error: slug must match [a-z0-9-]{2,40} (got: $SLUG)" >&2
    exit 65
  fi
  require_secret_file
  PP_SLUG="$SLUG" PP_HOST="$HOST" PP_SECRET_FILE="$SECRET_FILE" \
  python3 - <<'PY'
import json, os, sys, urllib.parse, urllib.request, urllib.error

with open(os.environ["PP_SECRET_FILE"], encoding="utf-8") as f:
    secret = f.read().strip()
if not secret:
    print("error: admin secret file is empty", file=sys.stderr)
    sys.exit(67)

url = (
    os.environ["PP_HOST"].rstrip("/")
    + "/api/proposal-responses?slug="
    + urllib.parse.quote(os.environ["PP_SLUG"])
)
req = urllib.request.Request(url, headers={"x-proposal-admin": secret})
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.load(r)
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", "replace")
    print(f"error: HTTP {e.code} from proposal-responses: {body}", file=sys.stderr)
    sys.exit(1)
except urllib.error.URLError as e:
    print(f"error: request failed: {e.reason}", file=sys.stderr)
    sys.exit(1)

count = data.get("count", 0)
print(f"{count} response(s) for /p/{os.environ['PP_SLUG']} (newest first)\n")
json.dump(data.get("responses", []), sys.stdout, indent=2, ensure_ascii=False)
print()
PY
  exit 0
fi

# ── publish (default) ───────────────────────────────────────────────────
[ $# -ge 3 ] || usage

SLUG="$1"
HTML_FILE="$2"
CODE="$3"
TITLE="${4:-$SLUG}"

# ── local validation (mirror the API so failures are instant) ──────────
if ! printf '%s' "$SLUG" | grep -Eq '^[a-z0-9-]{2,40}$'; then
  echo "error: slug must match [a-z0-9-]{2,40} (got: $SLUG)" >&2
  exit 65
fi
if ! printf '%s' "$CODE" | grep -Eq '^[0-9]{4}$'; then
  echo "error: code must be exactly 4 digits" >&2
  exit 65
fi
if [ ! -f "$HTML_FILE" ]; then
  echo "error: html file not found: $HTML_FILE" >&2
  exit 66
fi
require_secret_file

BYTES=$(wc -c < "$HTML_FILE" | tr -d ' ')
MAX=$((950 * 1024))
WARN=$((900 * 1024))
if [ "$BYTES" -gt "$MAX" ]; then
  echo "error: $HTML_FILE is ${BYTES} bytes — over the ${MAX}-byte limit (Upstash 1 MB request cap)." >&2
  echo "       Slim the file (inline images are usually the culprit) and retry." >&2
  exit 65
fi
if [ "$BYTES" -gt "$WARN" ]; then
  echo "warning: $HTML_FILE is ${BYTES} bytes — close to the ${MAX}-byte limit." >&2
fi

# ── build the JSON payload + POST, all inside python3 ──────────────────
# python3 does the JSON encoding (safe for any HTML content) and the HTTP
# request, so the secret never appears in argv or shell history.
RESPONSE=$(
  PP_SLUG="$SLUG" PP_CODE="$CODE" PP_TITLE="$TITLE" \
  PP_FILE="$HTML_FILE" PP_HOST="$HOST" PP_SECRET_FILE="$SECRET_FILE" \
  python3 - <<'PY'
import json, os, sys, urllib.request, urllib.error

with open(os.environ["PP_FILE"], encoding="utf-8") as f:
    html = f.read()
with open(os.environ["PP_SECRET_FILE"], encoding="utf-8") as f:
    secret = f.read().strip()
if not secret:
    print("error: admin secret file is empty", file=sys.stderr)
    sys.exit(67)

payload = json.dumps({
    "slug": os.environ["PP_SLUG"],
    "code": os.environ["PP_CODE"],
    "title": os.environ["PP_TITLE"],
    "html": html,
}).encode("utf-8")

req = urllib.request.Request(
    os.environ["PP_HOST"].rstrip("/") + "/api/proposal-put",
    data=payload,
    headers={
        "Content-Type": "application/json",
        "x-proposal-admin": secret,
    },
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=60) as r:
        print(r.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", "replace")
    print(f"error: HTTP {e.code} from proposal-put: {body}", file=sys.stderr)
    sys.exit(1)
except urllib.error.URLError as e:
    print(f"error: request failed: {e.reason}", file=sys.stderr)
    sys.exit(1)
PY
)

# ── confirm + print the share package ───────────────────────────────────
OK=$(printf '%s' "$RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("ok", False))' 2>/dev/null || echo "False")
if [ "$OK" != "True" ]; then
  echo "error: unexpected response: $RESPONSE" >&2
  exit 1
fi

WARNING=$(printf '%s' "$RESPONSE" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("warning", ""))' 2>/dev/null || true)
[ -n "$WARNING" ] && echo "warning: $WARNING" >&2

echo ""
echo "published ✓"
echo "  url:   ${HOST%/}/p/${SLUG}"
echo "  code:  ${CODE}"
echo "  title: ${TITLE}"
echo "  size:  ${BYTES} bytes"
