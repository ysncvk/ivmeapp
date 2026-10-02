#!/usr/bin/env bash
# Geçici (atılabilir) Postgres: Docker olmayan ortamlarda entegrasyon testi için.
# Kullanım: scripts/test-pg.sh start|stop|url
# Yalnızca geliştirme/test. Veri /tmp altında tutulur ve stop'ta silinir.
set -euo pipefail

DIR="${IVME_TEST_PG_DIR:-/tmp/ivme-test-pg}"
PORT="${IVME_TEST_PG_PORT:-5544}"
BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
RUN=(bash -c)
if [ "$(id -u)" = "0" ] && id postgres >/dev/null 2>&1; then
  RUN=(su postgres -s /bin/bash -c)
fi

case "${1:-url}" in
  start)
    if "$BIN/pg_isready" -h localhost -p "$PORT" >/dev/null 2>&1; then
      echo "postgres://ivme@localhost:$PORT/postgres"; exit 0
    fi
    rm -rf "$DIR"; mkdir -p "$DIR"
    [ "$(id -u)" = "0" ] && chown postgres "$DIR" 2>/dev/null || true
    "${RUN[@]}" "$BIN/initdb -D $DIR/data -U ivme --auth=trust >/dev/null"
    "${RUN[@]}" "$BIN/pg_ctl -D $DIR/data -o '-p $PORT -k $DIR -c fsync=off -c synchronous_commit=off' -l $DIR/log -w start >/dev/null"
    echo "postgres://ivme@localhost:$PORT/postgres"
    ;;
  stop)
    "${RUN[@]}" "$BIN/pg_ctl -D $DIR/data -m fast stop >/dev/null" 2>/dev/null || true
    rm -rf "$DIR"
    ;;
  url)
    echo "postgres://ivme@localhost:$PORT/postgres"
    ;;
  *) echo "kullanım: $0 start|stop|url" >&2; exit 1 ;;
esac
