#!/usr/bin/env bash
# Check Docker infrastructure status.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT/docker/docker-compose.yml"

echo "== Docker =="
if ! command -v docker >/dev/null 2>&1; then
  echo "NOT INSTALLED"
  exit 1
fi

docker --version
if ! docker info >/dev/null 2>&1; then
  echo "DAEMON: not running"
  exit 1
fi

echo ""
echo "== Containers =="
docker compose -f "$COMPOSE_FILE" ps 2>/dev/null || docker ps --filter name=favorit- --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "== Port checks =="
check_port() {
  local name="$1" port="$2"
  if lsof -i ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "OK  $name (:$port)"
  else
    echo "DOWN $name (:$port)"
  fi
}

check_port "PostgreSQL" 5432
check_port "Redis" 6379
check_port "MinIO API" 9000
check_port "MinIO Console" 9001

if command -v curl >/dev/null 2>&1; then
  echo ""
  echo "== MinIO health =="
  curl -sf "http://localhost:9000/minio/health/live" >/dev/null && echo "OK  MinIO live endpoint" || echo "DOWN MinIO live endpoint"
fi
