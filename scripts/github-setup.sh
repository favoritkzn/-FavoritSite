#!/usr/bin/env bash
# Первичная настройка GitHub для совместной работы
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

GH_BIN=""
for candidate in gh "/tmp/gh_2.63.2_macOS_arm64/bin/gh" "/tmp/gh_2.63.2_macOS_amd64/bin/gh"; do
  if command -v "$candidate" >/dev/null 2>&1; then
    GH_BIN="$candidate"
    break
  fi
done

if [ -z "$GH_BIN" ]; then
  echo "Установите GitHub CLI: https://cli.github.com/"
  echo "  macOS: brew install gh"
  echo "  или скачайте с https://github.com/cli/cli/releases"
  exit 1
fi

if ! "$GH_BIN" auth status >/dev/null 2>&1; then
  echo "Войдите в GitHub (откроется браузер или введите токен):"
  "$GH_BIN" auth login
fi

GITHUB_USER="$("$GH_BIN" api user -q .login)"
DEFAULT_REPO="favorit-platform"
read -r -p "Имя репозитория на GitHub [$DEFAULT_REPO]: " REPO_NAME
REPO_NAME="${REPO_NAME:-$DEFAULT_REPO}"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init -b main
fi

if ! git rev-parse HEAD >/dev/null 2>&1; then
  git add -A
  git -c user.name="${GIT_AUTHOR_NAME:-$GITHUB_USER}" \
      -c user.email="${GIT_AUTHOR_EMAIL:-$GITHUB_USER@users.noreply.github.com}" \
      commit -m "Initial commit: ФК «Фаворит» platform"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  if "$GH_BIN" repo view "$GITHUB_USER/$REPO_NAME" >/dev/null 2>&1; then
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
  else
    echo "Создаю репозиторий $GITHUB_USER/$REPO_NAME ..."
    "$GH_BIN" repo create "$REPO_NAME" --private --source=. --remote=origin --push
    echo ""
    echo "Готово! Репозиторий: https://github.com/$GITHUB_USER/$REPO_NAME"
    exit 0
  fi
fi

git push -u origin main
echo ""
echo "Готово! Репозиторий: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "Добавьте друга: GitHub → Settings → Collaborators → Add people"
