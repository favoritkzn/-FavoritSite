# Совместная работа над проектом

## Первый раз (владелец репозитория)

```bash
# 1. Установить GitHub CLI (если нет)
brew install gh   # macOS

# 2. Создать репозиторий и загрузить проект
bash scripts/github-setup.sh

# 3. Добавить друга на GitHub
#    Репозиторий → Settings → Collaborators → Add people
```

## Подключение друга (Cursor)

```bash
git clone https://github.com/ВАШ_ЛОГИН/favorit-platform.git
cd favorit-platform

cp .env.example .env
pnpm install
pnpm docker:up
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev:up
```

Сайт: http://localhost:3000  
Админ: `admin@favorit-kzn.ru` / `Favorit2026!`

## Синхронизация изменений

### Автоматически (Cursor)
После каждой сессии агента изменения отправляются на GitHub (хук `.cursor/hooks/git-auto-sync.sh`).

### Вручную
```bash
pnpm git:sync
# или с сообщением:
bash scripts/git-sync.sh "feat: добавил страницу расписания"
```

### Общая база данных (Neon)

В `.env` **у обоих** одинаковый `DATABASE_URL` (строка из Neon, отправить другу в личку):

```env
DATABASE_URL="postgresql://USER:PASS@HOST/neondb?sslmode=require"
```

Также скопировать в `packages/database/.env` (тот же URL).

Первый раз (один человек):
```bash
pnpm db:generate && pnpm db:push && pnpm db:seed
```

Второй человек — только `pnpm db:generate`, seed не нужен если данные уже есть.

После смены `.env` перезапустите API: `pnpm dev:up`

```bash
git pull
pnpm install          # если менялись зависимости
```

## Правила

1. **Не коммитить** `.env` — только `.env.example`
2. Перед push: `git pull` (скрипт делает это сам)
3. При конфликте — решить в Cursor и снова `pnpm git:sync`
4. База данных локальная (Docker) — данные не синхронизируются через git

## Проверка после изменений

```bash
pnpm test:trial   # пробное занятие
pnpm test:e2e     # полный набор (40 тестов)
```
