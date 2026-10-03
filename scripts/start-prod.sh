#!/usr/bin/env bash
# Üretim/ev sunucusu: önce `pnpm prod:build` ve `pnpm db:migrate` çalışmış olmalı.
# Sunucu (API + derlenmiş web, tek port) ve worker birlikte başlar; biri çökerse ikisi de kapanır
# ve launchd/systemd yeniden başlatır.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"

set -a
# shellcheck disable=SC1091
. apps/server/.env
set +a
export NODE_ENV=production
export WEB_DIST="${WEB_DIST:-$ROOT/apps/web/dist}"

(cd apps/worker && exec node dist/index.mjs) &
WORKER=$!
(cd apps/server && exec node dist/index.mjs) &
SERVER=$!

trap 'kill $WORKER $SERVER 2>/dev/null || true' EXIT INT TERM
wait -n $WORKER $SERVER
