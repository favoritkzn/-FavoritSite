#!/usr/bin/env bash
# Start Docker infrastructure for local development.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMPOSE_FILE="$ROOT/docker/docker-compose.yml"

port_in_use() {
  lsof -i ":$1" -sTCP:LISTEN -t >/dev/null 2>&1
}

docker_running() {
  docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^$1$"
}

echo "== Docker infrastructure =="

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed or not in PATH."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: Docker daemon is not running. Start Docker Desktop and retry."
  exit 1
fi

SERVICES=(postgres redis minio minio-init)

if port_in_use 5432; then
  if docker_running favorit-postgres; then
    echo "PostgreSQL: Docker container favorit-postgres (port 5432)"
  else
    echo "ERROR: Port 5432 is used by non-Docker PostgreSQL."
    echo "Run: bash scripts/migrate-to-docker-postgres.sh"
    exit 1
  fi
else
  echo "PostgreSQL: starting Docker container on :5432"
fi

echo "Starting: ${SERVICES[*]}"
docker compose -f "$COMPOSE_FILE" up -d "${SERVICES[@]}"

echo ""
echo "Waiting for services..."
sleep 3
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo "Done."
echo "  PostgreSQL : localhost:5432  (favorit / favorit)"
echo "  Redis      : localhost:6379"
echo "  MinIO API  : http://localhost:9000"
echo "  MinIO UI   : http://localhost:9001  (minioadmin / minioadmin)"
echo ""
echo "Set S3_ENABLED=true in .env and restart API to use MinIO for uploads."
