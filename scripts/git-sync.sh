#!/usr/bin/env bash
# Синхронизация изменений с GitHub (commit + pull + push)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Git не инициализирован. Запустите: bash scripts/github-setup.sh"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "Remote origin не настроен. Запустите: bash scripts/github-setup.sh"
  exit 1
fi

# Не коммитим секреты
if git diff --cached --name-only 2>/dev/null | grep -qE '^\.env$|\.env\.local'; then
  echo "Ошибка: .env в индексе — удалите из git add"
  exit 1
fi

git add -A

if git diff --cached --quiet; then
  echo "Нет изменений для коммита"
else
  MSG="${1:-chore: sync $(date '+%Y-%m-%d %H:%M')}"
  git -c user.name="${GIT_AUTHOR_NAME:-Favorit Team}" \
      -c user.email="${GIT_AUTHOR_EMAIL:-team@favorit-kzn.ru}" \
      commit -m "$MSG"
  echo "Коммит: $MSG"
fi

BRANCH="$(git branch --show-current)"
git pull --rebase origin "$BRANCH" 2>/dev/null || true
git push -u origin "$BRANCH"
echo "GitHub обновлён: $(git remote get-url origin) (ветка $BRANCH)"
