# ФК «Фаворит» — Цифровая платформа MVP

Современная веб-платформа футбольной академии «Фаворит» (г. Казань): публичный сайт, личные кабинеты родителей, тренеров и администрации, интернет-магазин с конструктором формы.

## Возможности MVP

### Публичный сайт
- Главная, О школе, Тренеры, Расписание, Стоимость
- Новости, Галерея, Контакты
- **Онлайн-запись на пробную тренировку**

### Личный кабинет родителя
- Dashboard с ребёнком, расписанием, абонементом
- Посещаемость, остаток тренировок
- Онлайн-оплата абонемента, история оплат
- Фото и видео, уведомления
- Заказы формы в магазине

### Личный кабинет тренера
- Календарь и расписание
- Группы, **отметка посещаемости**
- Результаты матчей, голы и передачи
- Объявления, загрузка фотографий

### Панель администратора
- Управление детьми, тренерами, родителями, группами
- Расписание, абонементы, оплаты
- Новости, галерея, **аналитика**
- Управление магазином и заказами

### Интернет-магазин
- Каталог товаров
- **Конструктор формы** (фамилия + номер с предпросмотром)
- Корзина, оформление заказа
- Статусы изготовления и получения

## Требования

- Node.js ≥ 20
- pnpm ≥ 9
- Docker (PostgreSQL, Redis, MinIO)

## Быстрый старт

```bash
# 1. Установить зависимости
pnpm install

# 2. Настроить окружение
cp .env.example .env

# 3. Запустить инфраструктуру (PostgreSQL + Redis + MinIO в Docker)
pnpm docker:up

# Если база была на локальном PostgreSQL — один раз перенести:
# pnpm db:migrate-docker

# 4. Сгенерировать Prisma Client и применить схему
pnpm db:generate
pnpm db:push
pnpm db:seed

# 5. Запустить dev-серверы (API + Web)
pnpm dev
```

**URL:**
- Сайт: http://localhost:3000
- API: http://localhost:4000/api/v1
- MinIO: http://localhost:9001

## Демо-аккаунт (после seed)

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | `admin@favorit-kzn.ru` | `Favorit2026!` |

Тренеров, группы и учеников создаёт администратор. Родители регистрируются на сайте (`/register`).

## Структура monorepo

```
apps/
  api/      — NestJS REST API (21 модуль)
  web/      — Next.js 15 (63 страницы)
packages/
  database/ — Prisma schema + seed
  types/    — Shared TypeScript types
  ui/       — UI Kit (красно-белый стиль)
```

## Документация

| Документ | Описание |
|----------|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Техническая архитектура |
| [docs/SCREEN_SPECIFICATION.md](docs/SCREEN_SPECIFICATION.md) | Спецификация экранов |
| [docs/COMPONENT_MAP.md](docs/COMPONENT_MAP.md) | Карта UI-компонентов |
| [docs/PRODUCT_VISION.md](docs/PRODUCT_VISION.md) | Философия продукта |
| [docs/COLLABORATION.md](docs/COLLABORATION.md) | Совместная работа через GitHub |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Деплой на хостинг |

## GitHub (совместная работа)

```bash
bash scripts/github-setup.sh   # первый раз: создать репозиторий и загрузить
pnpm git:sync                  # отправить изменения на GitHub
```

Подробнее: [docs/COLLABORATION.md](docs/COLLABORATION.md)

Next.js 15 · NestJS 11 · PostgreSQL · Prisma · JWT · React Query · Zustand · TypeScript
