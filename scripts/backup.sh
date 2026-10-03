#!/usr/bin/env bash
# Günlük yedek: pg_dump → ~/ivme-yedek/ivme-YYYY-MM-DD.sql.gz, son 30 gün tutulur.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a
# shellcheck disable=SC1091
. apps/server/.env
set +a

DIR="${BACKUP_DIR:-$HOME/ivme-yedek}"
mkdir -p "$DIR"
OUT="$DIR/ivme-$(date +%F).sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$OUT"
find "$DIR" -name 'ivme-*.sql.gz' -mtime +30 -delete
echo "Yedek alındı: $OUT"
