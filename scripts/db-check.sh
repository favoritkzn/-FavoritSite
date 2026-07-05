#!/usr/bin/env bash
# Verify PostgreSQL is reachable and Prisma schema is in sync.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:${PATH}"

PSQL_URL="postgresql://favorit:favorit@localhost:5432/favorit"
PRISMA_BIN="$ROOT/packages/database/node_modules/.bin/prisma"

run_psql() {
  if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^favorit-postgres$'; then
    docker exec favorit-postgres psql -U favorit -d favorit -c "$1"
  elif command -v psql >/dev/null 2>&1; then
    psql "$PSQL_URL" -c "$1"
  else
    echo "ERROR: No psql client and Docker Postgres is not running."
    exit 1
  fi
}

echo "== PostgreSQL connection =="
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^favorit-postgres$'; then
  docker exec favorit-postgres pg_isready -U favorit -d favorit
  echo "Source: Docker (favorit-postgres)"
elif command -v pg_isready >/dev/null 2>&1; then
  pg_isready -h localhost -p 5432
else
  echo "WARN: pg_isready not in PATH"
fi

run_psql "SELECT current_database() AS db, current_user AS role, version();"

echo ""
echo "== Table count =="
if docker ps --format '{{.Names}}' 2>/dev/null | grep -q '^favorit-postgres$'; then
  docker exec favorit-postgres psql -U favorit -d favorit -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
else
  psql "$PSQL_URL" -tAc \
    "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
fi

echo ""
echo "== Prisma schema validation =="
unset TMPDIR TEMP TMP
(cd "$ROOT/packages/database" && "$PRISMA_BIN" validate)

echo ""
echo "OK: database is reachable and Prisma schema is valid."
