#!/usr/bin/env bash
# Автосинхронизация с GitHub после завершения работы агента Cursor
cat >/dev/null

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SYNC="$ROOT/scripts/git-sync.sh"

if [ ! -x "$SYNC" ]; then
  exit 0
fi

if ! git -C "$ROOT" remote get-url origin >/dev/null 2>&1; then
  exit 0
fi

# Фоновый push — не блокируем агента
nohup bash "$SYNC" "chore: cursor sync $(date '+%Y-%m-%d %H:%M')" >>"$ROOT/.git-sync.log" 2>&1 &

exit 0
