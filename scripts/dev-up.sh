#!/usr/bin/env bash
# Запуск сайта + API для локальной разработки
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${PATH:-}"
if command -v pnpm >/dev/null 2>&1; then
  PM=pnpm
elif [ -x "/tmp/node-v22.12.0-darwin-arm64/bin/pnpm" ]; then
  export PATH="/tmp/node-v22.12.0-darwin-arm64/bin:$PATH"
  PM=pnpm
else
  echo "pnpm не найден. Установите Node 20+ и pnpm."
  exit 1
fi

if [ -f "$ROOT/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://favorit:favorit@localhost:5432/favorit?schema=public}"
export JWT_SECRET="${JWT_SECRET:-dev-secret-key}"
export API_PORT="${API_PORT:-4000}"
export API_URL="${API_URL:-http://localhost:4000}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-/api/v1}"
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
export S3_ENABLED="${S3_ENABLED:-true}"
export NODE_ENV=development

echo "→ Docker (PostgreSQL, Redis, MinIO)..."
if command -v docker >/dev/null 2>&1; then
  bash "$ROOT/scripts/docker-up.sh" 2>/dev/null || bash "$ROOT/scripts/docker-check.sh" || true
else
  echo "  Docker не найден — пропуск (нужен для БД)"
fi

api_health() {
  curl -sf "http://localhost:${API_PORT}/api/v1/health" >/dev/null 2>&1
}

start_api() {
  if api_health; then
    echo "→ API уже работает на :${API_PORT}"
    return
  fi
  echo "→ Запуск API на :${API_PORT}..."
  cd "$ROOT/apps/api"
  if [ ! -d dist ] || [ src/main.ts -nt dist/main.js ]; then
    $PM exec nest build 2>/dev/null || node node_modules/@nestjs/cli/bin/nest.js build
  fi
  nohup node dist/main.js >> "$ROOT/.dev-api.log" 2>&1 &
  echo $! > "$ROOT/.dev-api.pid"
  cd "$ROOT"
  for _ in $(seq 1 30); do
    if api_health; then
      echo "  API готов"
      return
    fi
    sleep 0.5
  done
  echo "  Ошибка: API не ответил. См. .dev-api.log"
  exit 1
}

start_web() {
  if curl -sf "http://localhost:3000" >/dev/null 2>&1; then
    echo "→ Web уже работает на :3000"
    return
  fi
  echo "→ Запуск Web на :3000..."
  cd "$ROOT/apps/web"
  nohup $PM dev --port 3000 >> "$ROOT/.dev-web.log" 2>&1 &
  echo $! > "$ROOT/.dev-web.pid"
  cd "$ROOT"
  for _ in $(seq 1 60); do
    if curl -sf "http://localhost:3000" >/dev/null 2>&1; then
      echo "  Web готов"
      return
    fi
    sleep 0.5
  done
  echo "  Ошибка: Web не ответил. См. .dev-web.log"
  exit 1
}

start_api
start_web

echo ""
echo "Готово:"
echo "  Сайт: http://localhost:3000"
echo "  API:  http://localhost:${API_PORT}/api/v1"
echo "  Логи: .dev-api.log, .dev-web.log"
