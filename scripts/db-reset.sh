#!/usr/bin/env bash
# Yerel Postgres hacmini siler ve commit'li migration'lardan yeniden kurar.
# Yalnızca yerel geliştirme: DATABASE_URL yerel değilse reddeder.
set -euo pipefail
cd "$(dirname "$0")/.."

URL="${DATABASE_URL:-postgres://ivme:ivme@localhost:5432/ivmeapp}"
case "$URL" in
  *localhost*|*127.0.0.1*) ;;
  *) echo "db:reset yalnızca yerel veritabanında çalışır (DATABASE_URL=$URL)" >&2; exit 1 ;;
esac

docker compose down -v
docker compose up -d --wait postgres
DATABASE_URL="$URL" pnpm --filter @ivmeapp/db db:migrate
echo "Veritabanı sıfırlandı ve migration'lar uygulandı."
