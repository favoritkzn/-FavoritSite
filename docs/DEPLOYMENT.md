# Развёртывание ФК «Фаворит»

Краткая инструкция для выкладки на VPS или облако (Timeweb, Selectel, Yandex Cloud и т.п.).

## Что нужно на сервере

| Компонент | Минимум |
|-----------|---------|
| Node.js | 20+ |
| pnpm | 9+ |
| Docker + Compose | для PostgreSQL, Redis, MinIO |
| Nginx (или Caddy) | reverse proxy, HTTPS |
| Домен | например `favorit-kzn.ru` |

## 1. Инфраструктура (Docker)

```bash
# На сервере
git clone <repo> favorit && cd favorit
cp .env.example .env
# Отредактируйте .env — см. раздел «Переменные окружения»
bash scripts/docker-up.sh
```

Docker поднимает:
- PostgreSQL 16 (`5432`)
- Redis 7 (`6379`)
- MinIO (`9000` API, `9001` консоль)

## 2. База данных

```bash
pnpm install
pnpm db:push      # создать схему
pnpm db:seed      # админ admin@favorit-kzn.ru / Favorit2026!
```

Для продакшена рекомендуется перейти на `prisma migrate deploy` после появления migration-файлов.

## 3. Сборка приложений

```bash
pnpm build
```

- API: `apps/api/dist`, запуск `node dist/main` (порт `API_PORT`, по умолчанию 4000)
- Web: `apps/web/.next`, запуск `next start` (порт 3000)

## 4. Nginx (пример)

```nginx
server {
  listen 443 ssl http2;
  server_name favorit-kzn.ru;

  # ssl_certificate ...

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location /api/v1/ {
    proxy_pass http://127.0.0.1:4000/api/v1/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Cookie $http_cookie;
  }
}
```

В `.env` для продакшена:
- `NEXT_PUBLIC_API_URL=/api/v1` (запросы через тот же домен)
- `API_URL=http://127.0.0.1:4000` (для Next rewrites при SSR)
- `NEXT_PUBLIC_APP_URL=https://favorit-kzn.ru`

## 5. Переменные окружения (обязательно сменить)

| Переменная | Продакшен |
|------------|-----------|
| `JWT_SECRET` | Случайная строка 64+ символов |
| `DATABASE_URL` | Пароль БД не `favorit` |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | Не `minioadmin` |
| `NODE_ENV` | `production` |

Опционально:
- `YUKASSA_SHOP_ID`, `YUKASSA_SECRET_KEY` — оплата в магазине
- `SMTP_*` — письма (без SMTP письма пишутся только в лог API)
- `NEXT_PUBLIC_S3_URL` — публичный URL MinIO/CDN для картинок в Next.js

## 6. Process manager (PM2)

```bash
# API
cd apps/api && pm2 start dist/main.js --name favorit-api

# Web
cd apps/web && pm2 start node_modules/next/dist/bin/next --name favorit-web -- start -p 3000
```

## 7. Проверка после деплоя

```bash
curl https://favorit-kzn.ru/api/v1/health
curl https://favorit-kzn.ru/api/v1/health/infra
```

Локально перед выкладкой: `pnpm test:e2e` (нужны запущенные API и Web).

## Что пока не готово «из коробки»

- **Dockerfile** для web/api — сборка вручную на сервере или через CI
- **Prisma migrations** — используется `db:push`, для продакшена лучше зафиксировать миграции
- **ЮKassa для абонементов** — только ручной перевод + подтверждение админом
- **Redis** — подключён, но не используется в бизнес-логике (только health check)
- **WebSocket / push** — уведомления через polling API
- **Проверка подписи webhook ЮKassa** — не реализована
- **CI/CD** — нет готового pipeline

## Рекомендуемый порядок первого запуска

1. Docker (Postgres, Redis, MinIO)
2. `pnpm db:push && pnpm db:seed`
3. `pnpm build`
4. Запуск API + Web
5. Nginx + SSL (Let's Encrypt)
6. Войти как админ, создать тренера, группу, расписание
7. Настроить ЮKassa и SMTP при необходимости
