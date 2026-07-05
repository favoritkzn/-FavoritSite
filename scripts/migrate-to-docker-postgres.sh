#!/usr/bin/env bash
# Migrate local PostgreSQL data to Docker PostgreSQL (favorit-postgres).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT/docker/docker-compose.yml"
BACKUP_DIR="$ROOT/docker/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
DUMP_FILE="$BACKUP_DIR/favorit-$TIMESTAMP.sql"
DB_URL="postgresql://favorit:favorit@localhost:5432/favorit"

PG_BIN=""
for candidate in \
  "/private/tmp/pgsql/bin" \
  "/Applications/Postgres.app/Contents/Versions/latest/bin" \
  "/opt/homebrew/opt/postgresql@16/bin" \
  "/usr/local/opt/postgresql@16/bin"; do
  if [ -x "$candidate/pg_dump" ]; then
    PG_BIN="$candidate"
    break
  fi
done

mkdir -p "$BACKUP_DIR"

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker is not running."
  exit 1
fi

echo "== 1. Backup current database =="
if [ -n "$PG_BIN" ]; then
  "$PG_BIN/pg_dump" "$DB_URL" --no-owner --no-acl -f "$DUMP_FILE"
else
  docker exec favorit-postgres pg_dump -U favorit favorit --no-owner --no-acl > "$DUMP_FILE" 2>/dev/null || {
    echo "ERROR: Cannot dump database. Install pg_dump or start favorit-postgres."
    exit 1
  }
fi
echo "Saved: $DUMP_FILE"

echo "== 2. Free port 5432 =="
if lsof -i :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
  if docker ps --format '{{.Names}}' | grep -q '^favorit-postgres$'; then
    echo "Docker PostgreSQL already on :5432"
  else
    if [ -x /private/tmp/pgsql/bin/pg_ctl ] && [ -d /tmp/favorit-pgdata ]; then
      /private/tmp/pgsql/bin/pg_ctl -D /tmp/favorit-pgdata -m fast stop || true
      sleep 2
    fi
    osascript -e 'quit app "Postgres"' 2>/dev/null || true
    sleep 2
    if lsof -i :5432 -sTCP:LISTEN -t >/dev/null 2>&1; then
      echo "ERROR: Port 5432 is still busy. Stop local PostgreSQL manually and rerun."
      exit 1
    fi
  fi
fi

echo "== 3. Start Docker PostgreSQL =="
docker compose -f "$COMPOSE_FILE" up -d postgres
for i in $(seq 1 40); do
  if docker exec favorit-postgres pg_isready -U favorit -d favorit >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if [ "$i" -eq 40 ]; then
    echo "ERROR: Docker PostgreSQL did not become ready."
    exit 1
  fi
done

echo "== 4. Restore schema and data =="
docker exec -i favorit-postgres psql -U favorit -d favorit -v ON_ERROR_STOP=1 < "$DUMP_FILE"

echo "== 5. Verify =="
docker exec favorit-postgres psql -U favorit -d favorit -c \
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY 1;"

docker exec favorit-postgres psql -U favorit -d favorit -c \
  "SELECT 'users' AS t, count(*) FROM users UNION ALL SELECT 'children', count(*) FROM children;"

echo ""
echo "Migration complete. Database now runs in Docker (favorit-postgres)."
echo "Backup kept at: $DUMP_FILE"
echo "Start full stack: pnpm docker:up"
