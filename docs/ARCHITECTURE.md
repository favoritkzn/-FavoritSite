# ФК «Фаворит» — Архитектура платформы

> Версия: 1.1 | Дата: 30.06.2026 | Статус: Проектирование

**Связанные документы:**
[PRODUCT_VISION.md](./PRODUCT_VISION.md) · [UI_GUIDELINES.md](./UI_GUIDELINES.md) · [UX_PRINCIPLES.md](./UX_PRINCIPLES.md) · [MVP_SCOPE.md](./MVP_SCOPE.md)

---

## 1. Обзор архитектуры

### 1.1 Высокоуровневая схема

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │  Web (SSR)   │  │  PWA Mobile  │  │  Admin Panel │                   │
│  │  Next.js 15  │  │  (future)    │  │  (same app)  │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY / CDN                                 │
│              Nginx / Cloudflare + Rate Limiting + WAF                    │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   REST API      │ │   WebSocket     │ │   File Service  │
│   NestJS        │ │   (Socket.io)   │ │   S3 / MinIO    │
│   /api/v1/*     │ │   Notifications │ │   Media CDN     │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Auth    │ │ Training │ │ Payments │ │  Shop    │ │  Media   │      │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │ Tournam. │ │  Camps   │ │ Notific. │ │  CMS     │                   │
│  │  Module  │ │  Module  │ │  Module  │ │  Module  │                   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                   │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  PostgreSQL 16  │ │     Redis 7     │ │   BullMQ Jobs   │
│  Primary DB     │ │  Cache/Sessions │ │  Async Workers  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 1.2 Архитектурные принципы

| Принцип | Реализация |
|---------|------------|
| **Clean Architecture** | Domain → Application → Infrastructure → Presentation |
| **Feature-Based** | Модули по доменам: `auth`, `children`, `training`, `shop` |
| **SOLID** | DI через NestJS, интерфейсы репозиториев, единая ответственность |
| **DRY** | Shared packages: `@favorit/types`, `@favorit/ui`, `@favorit/utils` |
| **KISS** | Один монорепо, один API, один фронтенд с role-based layouts |

### 1.3 Технологический стек

| Слой | Технология | Обоснование |
|------|------------|-------------|
| Frontend | Next.js 15 (App Router) | SSR/SSG для SEO, React Server Components |
| Backend | NestJS 11 | Clean Architecture, DI, модульность, TypeScript |
| ORM | Prisma 6 | Type-safe, миграции, схема как источник правды |
| Database | PostgreSQL 16 | ACID, JSON, полнотекстовый поиск |
| Cache | Redis 7 | Сессии, rate limit, кэш расписания |
| Queue | BullMQ | Автопродление абонементов, уведомления |
| Auth | JWT + Refresh Token (httpOnly cookie) | Stateless API + безопасное обновление |
| Payments | ЮKassa API | Российский рынок, рекуррентные платежи |
| Storage | S3 (Yandex Object Storage) | Фото, видео, документы |
| Search | PostgreSQL FTS + pg_trgm | Поиск детей, товаров, новостей |
| Monorepo | Turborepo + pnpm | Единая кодовая база, shared packages |
| UI | Tailwind CSS 4 + shadcn/ui + Framer Motion | Минимализм, анимации, тёмная тема |
| Forms | React Hook Form + Zod | Валидация на клиенте и сервере |
| State | TanStack Query + Zustand | Server state + UI state (корзина, конструктор) |
| Testing | Vitest + Playwright | Unit + E2E |
| CI/CD | GitHub Actions | Lint, test, deploy |
| Container | Docker + Docker Compose | Dev/prod окружения |

---

## 2. Структура папок (Monorepo)

```
favorit-platform/
├── apps/
│   ├── web/                          # Next.js 15 — публичный сайт + кабинеты
│   │   ├── app/
│   │   │   ├── (public)/             # Публичные страницы (SSR/SSG)
│   │   │   │   ├── page.tsx          # Главная
│   │   │   │   ├── about/
│   │   │   │   ├── coaches/
│   │   │   │   ├── schedule/
│   │   │   │   ├── pricing/
│   │   │   │   ├── news/
│   │   │   │   ├── gallery/
│   │   │   │   ├── shop/
│   │   │   │   ├── contacts/
│   │   │   │   ├── privacy/
│   │   │   │   └── terms/
│   │   │   ├── (auth)/               # Авторизация
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── (parent)/             # Кабинет родителя
│   │   │   │   └── parent/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── profile/
│   │   │   │       ├── children/
│   │   │   │       ├── schedule/
│   │   │   │       ├── attendance/
│   │   │   │       ├── subscription/
│   │   │   │       ├── payments/
│   │   │   │       ├── statistics/
│   │   │   │       ├── tournaments/
│   │   │   │       ├── camps/
│   │   │   │       ├── media/
│   │   │   │       ├── documents/
│   │   │   │       ├── notifications/
│   │   │   │       └── settings/
│   │   │   ├── (coach)/              # Кабинет тренера
│   │   │   │   └── coach/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── calendar/
│   │   │   │       ├── schedule/
│   │   │   │       ├── groups/
│   │   │   │       ├── children/
│   │   │   │       ├── attendance/
│   │   │   │       ├── matches/
│   │   │   │       ├── announcements/
│   │   │   │       └── settings/
│   │   │   ├── (admin)/              # Кабинет администратора
│   │   │   │   └── admin/
│   │   │   │       ├── dashboard/
│   │   │   │       ├── statistics/
│   │   │   │       ├── children/
│   │   │   │       ├── parents/
│   │   │   │       ├── coaches/
│   │   │   │       ├── groups/
│   │   │   │       ├── schedule/
│   │   │   │       ├── subscriptions/
│   │   │   │       ├── payments/
│   │   │   │       ├── shop/
│   │   │   │       ├── orders/
│   │   │   │       ├── tournaments/
│   │   │   │       ├── camps/
│   │   │   │       ├── media/
│   │   │   │       ├── news/
│   │   │   │       ├── notifications/
│   │   │   │       └── settings/
│   │   │   ├── api/                  # BFF routes (proxy, webhooks)
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/                   # UI Kit (re-export from @favorit/ui)
│   │   │   ├── layouts/
│   │   │   ├── features/             # Feature-specific components
│   │   │   └── shared/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── providers/
│   │   ├── stores/
│   │   └── middleware.ts
│   │
│   └── api/                          # NestJS Backend
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/               # Shared infrastructure
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── middleware/
│       │   │   └── pipes/
│       │   ├── config/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── domain/
│       │   │   │   ├── application/
│       │   │   │   ├── infrastructure/
│       │   │   │   └── presentation/
│       │   │   ├── users/
│       │   │   ├── children/
│       │   │   ├── parents/
│       │   │   ├── coaches/
│       │   │   ├── groups/
│       │   │   ├── schedule/
│       │   │   ├── attendance/
│       │   │   ├── subscriptions/
│       │   │   ├── payments/
│       │   │   ├── shop/
│       │   │   ├── orders/
│       │   │   ├── tournaments/
│       │   │   ├── camps/
│       │   │   ├── matches/
│       │   │   ├── media/
│       │   │   ├── news/
│       │   │   ├── notifications/
│       │   │   ├── cms/
│       │   │   └── statistics/
│       │   └── workers/              # BullMQ job processors
│       ├── prisma/
│       │   └── schema.prisma
│       └── test/
│
├── packages/
│   ├── database/                     # Prisma client + migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       └── index.ts
│   ├── types/                        # Shared TypeScript types & DTOs
│   │   └── src/
│   │       ├── entities/
│   │       ├── dto/
│   │       ├── enums/
│   │       └── api/
│   ├── ui/                           # Shared UI Kit
│   │   └── src/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── styles/
│   ├── utils/                        # Shared utilities
│   │   └── src/
│   │       ├── date/
│   │       ├── format/
│   │       └── validation/
│   └── config/                       # Shared ESLint, TS, Tailwind configs
│       ├── eslint/
│       ├── typescript/
│       └── tailwind/
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.dev.yml
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

---

## 3. Роли пользователей (RBAC)

### 3.1 Матрица ролей

| Роль | Код | Описание |
|------|-----|----------|
| Гость | `GUEST` | Неавторизованный пользователь |
| Родитель | `PARENT` | Родитель/законный представитель |
| Тренер | `COACH` | Тренер академии |
| Администратор | `ADMIN` | Полный доступ к системе |

### 3.2 Permissions (гранулярные права)

```
PERMISSIONS:
├── public:read                    # Публичные страницы
├── auth:register, auth:login
├── profile:read, profile:update
├── children:read_own              # Родитель — свои дети
├── children:read_group            # Тренер — дети своих групп
├── children:read_all, children:write  # Админ
├── attendance:read_own
├── attendance:read_group
├── attendance:write
├── schedule:read
├── schedule:write
├── subscription:read_own
├── subscription:write
├── payment:read_own, payment:write
├── shop:read, shop:order
├── shop:manage
├── matches:write
├── media:read, media:write
├── news:read, news:write
├── tournaments:read, tournaments:write
├── camps:read, camps:write
├── notifications:read, notifications:write
├── statistics:read_own
├── statistics:read_all
├── users:manage
├── settings:read, settings:write
└── admin:*
```

### 3.3 Role → Permission mapping

| Permission | GUEST | PARENT | COACH | ADMIN |
|------------|:-----:|:------:|:-----:|:-----:|
| public:read | ✅ | ✅ | ✅ | ✅ |
| profile:read/update | — | ✅ | ✅ | ✅ |
| children:read_own | — | ✅ | — | — |
| children:read_group | — | — | ✅ | — |
| children:read_all/write | — | — | — | ✅ |
| attendance:write | — | — | ✅ | ✅ |
| schedule:write | — | — | — | ✅ |
| shop:order | — | ✅ | ✅ | ✅ |
| shop:manage | — | — | — | ✅ |
| matches:write | — | — | ✅ | ✅ |
| admin:* | — | — | — | ✅ |

---

## 4. Сущности (Entities)

### 4.1 Core Domain

| Entity | Описание |
|--------|----------|
| `User` | Базовый пользователь системы |
| `Parent` | Профиль родителя (extends User) |
| `Coach` | Профиль тренера (extends User) |
| `Admin` | Профиль администратора (extends User) |
| `Child` | Ребёнок-ученик академии |
| `ParentChild` | Связь родитель ↔ ребёнок (M:N) |
| `Group` | Тренировочная группа |
| `GroupChild` | Связь группа ↔ ребёнок |
| `GroupCoach` | Связь группа ↔ тренер |

### 4.2 Training Domain

| Entity | Описание |
|--------|----------|
| `TrainingSession` | Тренировочное занятие |
| `Schedule` | Расписание (recurring rules) |
| `Attendance` | Запись посещаемости |
| `Venue` | Площадка/зал |
| `SubscriptionPlan` | Тарифный план абонемента |
| `Subscription` | Активный абонемент ребёнка |
| `SubscriptionUsage` | Списание тренировки с абонемента |

### 4.3 Payments Domain

| Entity | Описание |
|--------|----------|
| `Payment` | Платёж |
| `PaymentMethod` | Сохранённый способ оплаты |
| `Invoice` | Счёт на оплату |
| `Refund` | Возврат |

### 4.4 Shop Domain

| Entity | Описание |
|--------|----------|
| `Product` | Товар |
| `ProductCategory` | Категория товаров |
| `ProductVariant` | Вариант (размер, цвет) |
| `ProductCustomization` | Кастомизация (форма: фамилия, номер) |
| `Cart` | Корзина |
| `CartItem` | Позиция корзины |
| `Order` | Заказ |
| `OrderItem` | Позиция заказа |
| `OrderStatusHistory` | История статусов заказа |

### 4.5 Sports Domain

| Entity | Описание |
|--------|----------|
| `Tournament` | Турнир |
| `TournamentTeam` | Команда на турнире |
| `TournamentRegistration` | Регистрация ребёнка |
| `Camp` | Сборы |
| `CampRegistration` | Регистрация на сборы |
| `Match` | Матч |
| `MatchEvent` | Событие матча (гол, передача, карточка) |
| `MatchLineup` | Состав на матч |
| `ChildStatistics` | Статистика ребёнка (агрегат) |

### 4.6 Media & CMS Domain

| Entity | Описание |
|--------|----------|
| `Media` | Файл (фото/видео/документ) |
| `MediaAlbum` | Альбом |
| `MediaAlbumItem` | Элемент альбома |
| `News` | Новость |
| `NewsCategory` | Категория новостей |
| `Page` | CMS-страница |
| `SiteSettings` | Настройки сайта |

### 4.7 Notifications Domain

| Entity | Описание |
|--------|----------|
| `Notification` | Уведомление |
| `NotificationPreference` | Настройки уведомлений |
| `Announcement` | Объявление (от тренера) |

### 4.8 Auth Domain

| Entity | Описание |
|--------|----------|
| `RefreshToken` | Refresh token |
| `PasswordReset` | Токен сброса пароля |
| `AuditLog` | Журнал аудита |

---

## 5. Структура базы данных (Prisma Schema)

См. полную схему в `packages/database/prisma/schema.prisma` (будет создана на этапе 1).

### 5.1 Ключевые ENUMs

```prisma
enum UserRole { GUEST PARENT COACH ADMIN }
enum UserStatus { ACTIVE INACTIVE BLOCKED PENDING_VERIFICATION }
enum Gender { MALE FEMALE }
enum AttendanceStatus { PRESENT ABSENT LATE EXCUSED }
enum SubscriptionStatus { ACTIVE EXPIRED SUSPENDED CANCELLED }
enum PaymentStatus { PENDING PROCESSING SUCCEEDED FAILED REFUNDED }
enum PaymentType { SUBSCRIPTION SHOP TOURNAMENT CAMP OTHER }
enum OrderStatus { PENDING CONFIRMED IN_PRODUCTION READY SHIPPED DELIVERED CANCELLED }
enum MatchEventType { GOAL ASSIST YELLOW_CARD RED_CARD SUBSTITUTION }
enum MediaType { IMAGE VIDEO DOCUMENT }
enum NotificationType { INFO WARNING PAYMENT SCHEDULE ATTENDANCE ORDER SYSTEM }
enum NotificationChannel { IN_APP EMAIL PUSH SMS }
enum TournamentStatus { UPCOMING REGISTRATION OPEN IN_PROGRESS COMPLETED CANCELLED }
enum CampStatus { UPCOMING REGISTRATION_OPEN IN_PROGRESS COMPLETED CANCELLED }
```

---

## 6. ER-диаграмма (текстовый вид)

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │───────│    Parent    │       │    Coach    │
│─────────────│  1:1  │──────────────│       │─────────────│
│ id (PK)     │       │ userId (FK)  │       │ userId (FK) │
│ email       │       │ phone        │       │ bio         │
│ password    │       │ address      │       │ photo       │
│ role        │       └──────┬───────┘       │ experience  │
│ status      │              │              └──────┬──────┘
│ firstName   │              │                     │
│ lastName    │              │ M:N                 │ M:N
│ avatar      │              ▼                     ▼
│ createdAt   │       ┌──────────────┐       ┌─────────────┐
└─────────────┘       │ ParentChild  │       │ GroupCoach  │
                      │──────────────│       │─────────────│
                      │ parentId(FK) │       │ groupId(FK) │
                      │ childId (FK) │       │ coachId(FK) │
                      │ relation     │       │ isPrimary   │
                      └──────┬───────┘       └──────┬──────┘
                             │                      │
                             ▼                      ▼
                      ┌──────────────┐       ┌─────────────┐
                      │    Child     │◄──────│    Group    │
                      │──────────────│  M:N  │─────────────│
                      │ id (PK)      │       │ id (PK)     │
                      │ firstName    │       │ name        │
                      │ lastName     │       │ ageCategory │
                      │ birthDate    │       │ maxCapacity │
                      │ gender       │       │ description │
                      │ photo        │       └─────────────┘
                      │ medicalInfo  │
                      └──────┬───────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌─────────────┐       ┌──────────────┐    ┌─────────────┐
│Subscription │       │  Attendance  │    │GroupChild   │
│─────────────│       │──────────────│    │─────────────│
│ childId(FK) │       │ childId (FK) │    │ groupId(FK) │
│ planId (FK) │       │ sessionId(FK)│    │ childId(FK) │
│ status      │       │ status       │    │ joinedAt    │
│ startDate   │       │ markedBy(FK) │    └─────────────┘
│ endDate     │       │ markedAt     │
│ remaining   │       └──────┬───────┘
│ autoRenew   │              │
└──────┬──────┘              │
       │                     ▼
       ▼              ┌──────────────┐
┌─────────────┐       │TrainingSession│
│Subscription │       │──────────────│
│Plan         │       │ groupId (FK) │
│─────────────│       │ venueId (FK) │
│ name        │       │ coachId (FK) │
│ price       │       │ startTime    │
│ sessions    │       │ endTime      │
│ duration    │       │ status       │
└─────────────┘       └──────────────┘

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Payment   │       │    Order     │       │   Product   │
│─────────────│       │──────────────│       │─────────────│
│ userId (FK) │       │ userId (FK)  │       │ categoryId  │
│ amount      │       │ status       │       │ name        │
│ status      │       │ total        │       │ price       │
│ type        │       │ shippingAddr │       │ isCustomiz. │
│ externalId  │       └──────┬───────┘       └──────┬──────┘
│ subscription│              │                      │
│   Id (FK)   │              ▼                      ▼
└─────────────┘       ┌──────────────┐       ┌─────────────┐
                      │  OrderItem   │       │ProductVar.  │
                      │──────────────│       │─────────────│
                      │ orderId (FK) │       │ productId   │
                      │ productId    │       │ size, color │
                      │ quantity     │       │ stock       │
                      │ customiz.    │       └─────────────┘
                      │   JSON       │
                      └──────────────┘

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│ Tournament  │       │    Match     │       │ MatchEvent  │
│─────────────│       │──────────────│       │─────────────│
│ name        │       │ tournamentId │       │ matchId(FK) │
│ startDate   │       │ homeTeam     │       │ childId(FK) │
│ endDate     │       │ awayTeam     │       │ type        │
│ status      │       │ score        │       │ minute      │
└──────┬──────┘       │ date         │       └─────────────┘
       │              └──────────────┘
       ▼
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│Tournament   │       │    Camp      │       │    News     │
│Registration │       │──────────────│       │─────────────│
│─────────────│       │ name         │       │ title       │
│tournamentId │       │ location     │       │ slug        │
│ childId     │       │ startDate    │       │ content     │
│ status      │       │ price        │       │ publishedAt │
└─────────────┘       └──────────────┘       └─────────────┘

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   Media     │       │ Notification │       │  AuditLog   │
│─────────────│       │──────────────│       │─────────────│
│ type        │       │ userId (FK)  │       │ userId (FK) │
│ url         │       │ type         │       │ action      │
│ albumId     │       │ channel      │       │ entity      │
│ uploadedBy  │       │ read         │       │ entityId    │
└─────────────┘       └──────────────┘       └─────────────┘
```

---

## 7. API Endpoints

Base URL: `/api/v1`

### 7.1 Auth (`/auth`)

| Method | Endpoint | Auth | Описание |
|--------|----------|------|----------|
| POST | `/auth/register` | — | Регистрация родителя |
| POST | `/auth/login` | — | Вход |
| POST | `/auth/logout` | ✅ | Выход |
| POST | `/auth/refresh` | 🔄 | Обновление токена |
| POST | `/auth/forgot-password` | — | Запрос сброса |
| POST | `/auth/reset-password` | — | Сброс пароля |
| GET | `/auth/me` | ✅ | Текущий пользователь |

### 7.2 Users (`/users`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/users/profile` | ✅ | * | Профиль |
| PATCH | `/users/profile` | ✅ | * | Обновить профиль |
| PATCH | `/users/password` | ✅ | * | Сменить пароль |
| POST | `/users/avatar` | ✅ | * | Загрузить аватар |

### 7.3 Children (`/children`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/children` | ✅ | PARENT,COACH,ADMIN | Список детей |
| GET | `/children/:id` | ✅ | * | Карточка ребёнка |
| POST | `/children` | ✅ | ADMIN | Создать |
| PATCH | `/children/:id` | ✅ | ADMIN | Обновить |
| DELETE | `/children/:id` | ✅ | ADMIN | Удалить |
| GET | `/children/:id/statistics` | ✅ | * | Статистика |
| GET | `/children/:id/attendance` | ✅ | * | Посещаемость |
| GET | `/children/:id/subscription` | ✅ | PARENT,ADMIN | Абонемент |
| GET | `/children/:id/media` | ✅ | * | Медиа |

### 7.4 Parents (`/parents`) — Admin

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/parents` | ✅ | ADMIN | Список |
| GET | `/parents/:id` | ✅ | ADMIN | Детали |
| POST | `/parents` | ✅ | ADMIN | Создать |
| PATCH | `/parents/:id` | ✅ | ADMIN | Обновить |
| POST | `/parents/:id/children/:childId` | ✅ | ADMIN | Привязать ребёнка |

### 7.5 Coaches (`/coaches`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/coaches` | —/✅ | GUEST+ | Список (публичный) |
| GET | `/coaches/:id` | —/✅ | GUEST+ | Профиль тренера |
| POST | `/coaches` | ✅ | ADMIN | Создать |
| PATCH | `/coaches/:id` | ✅ | ADMIN | Обновить |

### 7.6 Groups (`/groups`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/groups` | ✅ | COACH,ADMIN | Список групп |
| GET | `/groups/:id` | ✅ | COACH,ADMIN | Детали |
| POST | `/groups` | ✅ | ADMIN | Создать |
| PATCH | `/groups/:id` | ✅ | ADMIN | Обновить |
| POST | `/groups/:id/children` | ✅ | ADMIN | Добавить ребёнка |
| DELETE | `/groups/:id/children/:childId` | ✅ | ADMIN | Удалить |
| POST | `/groups/:id/coaches` | ✅ | ADMIN | Назначить тренера |

### 7.7 Schedule (`/schedule`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/schedule` | —/✅ | GUEST+ | Расписание (публичное/личное) |
| GET | `/schedule/sessions` | ✅ | * | Сессии |
| GET | `/schedule/sessions/:id` | ✅ | * | Детали сессии |
| POST | `/schedule/sessions` | ✅ | ADMIN | Создать сессию |
| PATCH | `/schedule/sessions/:id` | ✅ | ADMIN | Обновить |
| DELETE | `/schedule/sessions/:id` | ✅ | ADMIN | Удалить |

### 7.8 Attendance (`/attendance`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/attendance/session/:sessionId` | ✅ | COACH,ADMIN | Посещаемость сессии |
| POST | `/attendance/mark` | ✅ | COACH,ADMIN | Отметить посещаемость |
| POST | `/attendance/bulk` | ✅ | COACH,ADMIN | Массовая отметка |
| GET | `/attendance/child/:childId` | ✅ | PARENT,COACH,ADMIN | История |

### 7.9 Subscriptions (`/subscriptions`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/subscriptions/plans` | —/✅ | GUEST+ | Тарифы |
| GET | `/subscriptions` | ✅ | ADMIN | Все абонементы |
| GET | `/subscriptions/:id` | ✅ | * | Детали |
| POST | `/subscriptions` | ✅ | ADMIN | Создать |
| PATCH | `/subscriptions/:id` | ✅ | ADMIN | Обновить |
| POST | `/subscriptions/:id/cancel` | ✅ | PARENT,ADMIN | Отменить |
| POST | `/subscriptions/:id/renew` | ✅ | PARENT,ADMIN | Продлить |

### 7.10 Payments (`/payments`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/payments` | ✅ | * | История платежей |
| GET | `/payments/:id` | ✅ | * | Детали |
| POST | `/payments/create` | ✅ | PARENT,ADMIN | Создать платёж |
| POST | `/payments/webhook` | — | System | Webhook ЮKassa |
| GET | `/payments/methods` | ✅ | PARENT | Способы оплаты |
| POST | `/payments/methods` | ✅ | PARENT | Добавить способ |
| DELETE | `/payments/methods/:id` | ✅ | PARENT | Удалить |

### 7.11 Shop (`/shop`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/shop/categories` | — | GUEST | Категории |
| GET | `/shop/products` | — | GUEST | Каталог |
| GET | `/shop/products/:id` | — | GUEST | Товар |
| POST | `/shop/products` | ✅ | ADMIN | Создать |
| PATCH | `/shop/products/:id` | ✅ | ADMIN | Обновить |
| DELETE | `/shop/products/:id` | ✅ | ADMIN | Удалить |

### 7.12 Cart & Orders (`/cart`, `/orders`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/cart` | ✅ | * | Корзина |
| POST | `/cart/items` | ✅ | * | Добавить |
| PATCH | `/cart/items/:id` | ✅ | * | Обновить |
| DELETE | `/cart/items/:id` | ✅ | * | Удалить |
| POST | `/orders` | ✅ | * | Оформить заказ |
| GET | `/orders` | ✅ | * | История |
| GET | `/orders/:id` | ✅ | * | Детали |
| PATCH | `/orders/:id/status` | ✅ | ADMIN | Сменить статус |

### 7.13 Matches (`/matches`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/matches` | ✅ | COACH,ADMIN | Список |
| POST | `/matches` | ✅ | COACH,ADMIN | Создать |
| PATCH | `/matches/:id` | ✅ | COACH,ADMIN | Обновить |
| POST | `/matches/:id/events` | ✅ | COACH,ADMIN | Добавить событие |
| DELETE | `/matches/:id/events/:eventId` | ✅ | COACH,ADMIN | Удалить событие |

### 7.14 Tournaments (`/tournaments`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/tournaments` | —/✅ | GUEST+ | Список |
| GET | `/tournaments/:id` | —/✅ | GUEST+ | Детали |
| POST | `/tournaments` | ✅ | ADMIN | Создать |
| PATCH | `/tournaments/:id` | ✅ | ADMIN | Обновить |
| POST | `/tournaments/:id/register` | ✅ | PARENT | Регистрация |

### 7.15 Camps (`/camps`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/camps` | —/✅ | GUEST+ | Список |
| GET | `/camps/:id` | —/✅ | GUEST+ | Детали |
| POST | `/camps` | ✅ | ADMIN | Создать |
| POST | `/camps/:id/register` | ✅ | PARENT | Регистрация |

### 7.16 Media (`/media`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/media/albums` | —/✅ | GUEST+ | Альбомы |
| GET | `/media/albums/:id` | —/✅ | GUEST+ | Альбом |
| POST | `/media/upload` | ✅ | COACH,ADMIN | Загрузить |
| DELETE | `/media/:id` | ✅ | COACH,ADMIN | Удалить |

### 7.17 News (`/news`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/news` | — | GUEST | Список |
| GET | `/news/:slug` | — | GUEST | Статья |
| POST | `/news` | ✅ | ADMIN | Создать |
| PATCH | `/news/:id` | ✅ | ADMIN | Обновить |
| DELETE | `/news/:id` | ✅ | ADMIN | Удалить |

### 7.18 Notifications (`/notifications`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/notifications` | ✅ | * | Список |
| PATCH | `/notifications/:id/read` | ✅ | * | Прочитать |
| POST | `/notifications/read-all` | ✅ | * | Прочитать все |
| GET | `/notifications/preferences` | ✅ | * | Настройки |
| PATCH | `/notifications/preferences` | ✅ | * | Обновить |

### 7.19 Announcements (`/announcements`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/announcements` | ✅ | COACH,PARENT | Список |
| POST | `/announcements` | ✅ | COACH | Создать |
| DELETE | `/announcements/:id` | ✅ | COACH,ADMIN | Удалить |

### 7.20 Statistics (`/statistics`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/statistics/dashboard` | ✅ | ADMIN | Дашборд |
| GET | `/statistics/attendance` | ✅ | ADMIN | Посещаемость |
| GET | `/statistics/revenue` | ✅ | ADMIN | Доходы |
| GET | `/statistics/children/:id` | ✅ | * | Статистика ребёнка |

### 7.21 CMS (`/cms`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/cms/settings` | — | GUEST | Настройки сайта |
| PATCH | `/cms/settings` | ✅ | ADMIN | Обновить |
| GET | `/cms/pages/:slug` | — | GUEST | CMS-страница |

### 7.22 Search (`/search`)

| Method | Endpoint | Auth | Role | Описание |
|--------|----------|------|------|----------|
| GET | `/search?q=` | —/✅ | GUEST+ | Глобальный поиск |

---

## 8. Карта роутинга (Frontend)

### 8.1 Публичные маршруты

| URL | Страница | Rendering |
|-----|----------|-----------|
| `/` | Главная | SSG + ISR |
| `/about` | О школе | SSG |
| `/coaches` | Тренеры | SSG + ISR |
| `/coaches/[id]` | Профиль тренера | SSG + ISR |
| `/schedule` | Расписание | SSR |
| `/pricing` | Стоимость | SSG |
| `/news` | Новости | SSG + ISR |
| `/news/[slug]` | Статья | SSG + ISR |
| `/gallery` | Галерея | SSG + ISR |
| `/gallery/[albumId]` | Альбом | SSG + ISR |
| `/shop` | Магазин | SSG + ISR |
| `/shop/[id]` | Товар | SSG + ISR |
| `/shop/form-builder` | Конструктор формы | CSR |
| `/contacts` | Контакты | SSG |
| `/privacy` | Политика | SSG |
| `/terms` | Соглашение | SSG |

### 8.2 Auth маршруты

| URL | Страница |
|-----|----------|
| `/login` | Вход |
| `/register` | Регистрация |
| `/forgot-password` | Сброс пароля |
| `/reset-password` | Новый пароль |

### 8.3 Кабинет родителя (`/parent/*`)

| URL | Страница |
|-----|----------|
| `/parent/dashboard` | Dashboard |
| `/parent/profile` | Профиль |
| `/parent/children` | Дети |
| `/parent/children/[id]` | Карточка ребёнка |
| `/parent/schedule` | Расписание |
| `/parent/attendance` | Посещаемость |
| `/parent/attendance/[childId]` | История |
| `/parent/subscription` | Абонемент |
| `/parent/payments` | История оплат |
| `/parent/payments/new` | Онлайн оплата |
| `/parent/statistics/[childId]` | Статистика |
| `/parent/tournaments` | Турниры |
| `/parent/camps` | Сборы |
| `/parent/media` | Фотографии/Видео |
| `/parent/documents` | Документы |
| `/parent/notifications` | Уведомления |
| `/parent/settings` | Настройки |
| `/parent/shop/cart` | Корзина |
| `/parent/shop/checkout` | Оформление |
| `/parent/shop/orders` | История заказов |
| `/parent/shop/orders/[id]` | Детали заказа |

### 8.4 Кабинет тренера (`/coach/*`)

| URL | Страница |
|-----|----------|
| `/coach/dashboard` | Dashboard |
| `/coach/calendar` | Календарь |
| `/coach/schedule` | Расписание |
| `/coach/groups` | Группы |
| `/coach/groups/[id]` | Детали группы |
| `/coach/children` | Дети |
| `/coach/children/[id]` | Карточка ребёнка |
| `/coach/attendance` | Посещаемость |
| `/coach/attendance/[sessionId]` | Отметка |
| `/coach/matches` | Матчи |
| `/coach/matches/new` | Новый матч |
| `/coach/matches/[id]` | Детали матча |
| `/coach/media` | Фотографии |
| `/coach/announcements` | Объявления |
| `/coach/settings` | Настройки |

### 8.5 Кабинет администратора (`/admin/*`)

| URL | Страница |
|-----|----------|
| `/admin/dashboard` | Dashboard |
| `/admin/statistics` | Статистика |
| `/admin/children` | Управление детьми |
| `/admin/children/[id]` | Карточка |
| `/admin/parents` | Управление родителями |
| `/admin/coaches` | Управление тренерами |
| `/admin/groups` | Управление группами |
| `/admin/schedule` | Управление расписанием |
| `/admin/subscriptions` | Абонементы |
| `/admin/payments` | Оплаты |
| `/admin/shop/products` | Товары |
| `/admin/shop/orders` | Заказы |
| `/admin/shop/orders/[id]` | Детали заказа |
| `/admin/tournaments` | Турниры |
| `/admin/camps` | Сборы |
| `/admin/media` | Медиа |
| `/admin/news` | Новости |
| `/admin/notifications` | Уведомления |
| `/admin/settings` | Настройки сайта |

---

## 9. Middleware

### 9.1 Backend (NestJS Guards & Middleware)

| Middleware/Guard | Слой | Описание |
|------------------|------|----------|
| `LoggerMiddleware` | Global | Логирование запросов |
| `CorrelationIdMiddleware` | Global | X-Request-ID |
| `RateLimitGuard` | Global | Rate limiting (Redis) |
| `ValidationPipe` | Global | Zod/class-validator |
| `JwtAuthGuard` | Route | Проверка JWT |
| `RolesGuard` | Route | RBAC по ролям |
| `PermissionsGuard` | Route | RBAC по permissions |
| `OwnershipGuard` | Route | Доступ только к своим данным |
| `GroupAccessGuard` | Route | Тренер → только свои группы |
| `AuditInterceptor` | Route | Запись в audit log |
| `TransformInterceptor` | Global | Единый формат ответа |
| `ExceptionFilter` | Global | Обработка ошибок |

### 9.2 Frontend (Next.js Middleware)

| Middleware | Описание |
|------------|----------|
| `authMiddleware` | Проверка JWT, redirect на /login |
| `roleMiddleware` | Redirect по роли (parent/coach/admin) |
| `localeMiddleware` | i18n (будущее) |
| `securityHeaders` | CSP, HSTS, X-Frame-Options |

```typescript
// apps/web/middleware.ts — логика
// 1. Публичные маршруты → пропуск
// 2. /parent/* → role PARENT | ADMIN
// 3. /coach/* → role COACH | ADMIN
// 4. /admin/* → role ADMIN
// 5. Нет токена → /login?redirect=...
```

---

## 10. План модулей (MVP — 12 недель)

> Полное разделение MVP / Future — в [MVP_SCOPE.md](./MVP_SCOPE.md)

### Фаза 1 — Foundation (Недели 1-2)
- [ ] Monorepo setup (Turborepo, pnpm)
- [ ] Database schema (MVP-сущности) + migrations
- [ ] Auth module (JWT, RBAC)
- [ ] UI Kit foundation (красная палитра, карточки, скелетоны)
- [ ] Docker dev environment

### Фаза 2 — Public Site (Недели 3-4)
- [ ] Layouts (header, footer, navigation)
- [ ] Главная, О школе, Контакты
- [ ] Тренеры (публичные профили)
- [ ] Расписание (публичное), Стоимость
- [ ] Новости, Галерея
- [ ] SEO (metadata, sitemap, robots)

### Фаза 3 — Admin Core (Недели 5-6)
- [ ] Admin Dashboard (ключевой экран)
- [ ] CRUD: дети, родители, тренеры, группы
- [ ] Расписание, абонементы, оплаты
- [ ] Новости, медиа, настройки сайта

### Фаза 4 — Coach Cabinet (Недели 7-8)
- [ ] Coach Dashboard (ключевой экран)
- [ ] Группы, Дети
- [ ] Посещаемость (отметка + bulk)
- [ ] Матчи, голы, передачи
- [ ] Фото, Объявления

### Фаза 5 — Parent Cabinet (Недели 9-10)
- [ ] Parent Dashboard (самый красивый экран)
- [ ] Профиль, Дети, Расписание, Посещаемость
- [ ] Абонементы, Платежи + ЮKassa
- [ ] Статистика, Уведомления

### Фаза 6 — Polish & Launch (Недели 11-12)
- [ ] Email-уведомления
- [ ] Empty / Error / Success states
- [ ] E2E тесты критических путей
- [ ] Performance optimization
- [ ] Production deployment

### Future (после MVP)
- v1.1: Магазин + конструктор формы
- v1.2: Автопродление, автосписание, push
- v1.3: Турниры, сборы
- v1.4: Расширенная аналитика
- v1.5: Тёмная тема, PWA, документы
- v2.0: Mobile app, multi-academy, WebSocket

---

## 11. План компонентов

### 11.1 Layouts
- `PublicLayout` — header, footer, hero
- `AuthLayout` — centered form
- `DashboardLayout` — sidebar, topbar, breadcrumbs
- `ShopLayout` — shop-specific navigation

### 11.2 Feature Components

**Auth:** LoginForm, RegisterForm, ForgotPasswordForm

**Children:** ChildCard, ChildList, ChildProfile, ChildStats

**Schedule:** ScheduleCalendar, ScheduleList, SessionCard

**Attendance:** AttendanceTable, AttendanceMark, AttendanceHistory

**Subscription:** SubscriptionCard, PlanSelector, UsageProgress

**Payments:** PaymentForm, PaymentHistory, PaymentStatus

**Shop:** ProductCard, ProductGrid, CartDrawer, CheckoutForm, **FormBuilder** (конструктор формы)

**Matches:** MatchCard, MatchForm, EventTimeline, ScoreBoard

**Media:** GalleryGrid, AlbumView, MediaUploader, Lightbox

**News:** NewsCard, NewsList, ArticleView

**Notifications:** NotificationBell, NotificationList, NotificationItem

**Admin:** DataTable, CRUDForm, StatsCard, ChartWidget

### 11.3 Shared Components
- SearchBar, FilterPanel, Pagination
- DateRangePicker, Avatar, Badge
- ConfirmDialog, Toast notifications
- FileUpload (drag & drop)

---

## 12. План UI Kit (`@favorit/ui`)

> Полные guidelines — в [UI_GUIDELINES.md](./UI_GUIDELINES.md). UX-принципы — в [UX_PRINCIPLES.md](./UX_PRINCIPLES.md).

### 12.1 Design Tokens (фирменный стиль)

```css
/* Primary — современный спортивный красный (НЕ зелёный) */
--color-primary:        #DC2626;
--color-primary-hover:  #B91C1C;
--color-primary-light:  #FEE2E2;

/* Neutrals */
--color-white:          #FFFFFF;
--color-background:     #F5F5F7;   /* Светло-серый фон страниц */
--color-surface:          #FFFFFF;   /* Белые карточки */
--color-border:           #E5E7EB;

/* Text */
--color-text:           #1F2937;   /* Тёмно-серый */
--color-text-secondary: #6B7280;
--color-text-muted:     #9CA3AF;

/* Radius & Shadows */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
```

### 12.2 Base Components (shadcn/ui based)
Button, Input, Textarea, Select, Checkbox, Radio, Switch, Label, Form, Card, Dialog, Sheet, Dropdown, Tabs, Table, Avatar, Badge, Skeleton, Toast, Tooltip, Popover, Calendar, Command

### 12.3 Custom Components
- `StatCard` — крупная метрика + тренд
- `ChildCard` — фото + имя + группа + stats
- `EventCard` — ближайшее событие
- `ProgressCard` — прогресс-бар абонемента
- `ActionCard` — быстрое действие
- `EmptyState` — иллюстрация + CTA
- `ErrorState` / `SuccessState` — feedback
- `LoadingSkeleton` — shimmer-скелетоны
- `PageHeader` — заголовок + primary action
- `Sidebar` — навигация кабинета
- `QuickActions` — панель быстрых действий
- `ThemeToggle` — dark/light (Future)
- `FormPreview` — конструктор формы (Future)

### 12.4 Animations (Framer Motion)
- Page transitions (fade + slide, 300ms)
- List stagger (50ms delay)
- Card hover (translateY + shadow)
- Micro-interactions (checkbox bounce, count-up)
- Skeleton shimmer
- Toast slide-in

---

## 13. План безопасности

| Область | Мера |
|---------|------|
| **Auth** | bcrypt (cost 12), JWT RS256, refresh rotation |
| **RBAC** | Guards на каждом endpoint, ownership checks |
| **Input** | Zod validation, SQL injection via Prisma |
| **XSS** | React escaping, CSP headers, DOMPurify для CMS |
| **CSRF** | SameSite cookies, CSRF token для forms |
| **Rate Limit** | 100 req/min (API), 10 req/min (auth) |
| **Files** | MIME validation, size limits, virus scan |
| **Payments** | Webhook signature verification (ЮKassa) |
| **Secrets** | .env, Vault в production |
| **Audit** | Все admin-действия в AuditLog |
| **HTTPS** | Strict HSTS, TLS 1.3 |
| **CORS** | Whitelist origins |
| **Headers** | X-Frame-Options, X-Content-Type-Options |
| **GDPR** | Согласие, право на удаление, privacy policy |

---

## 14. План масштабирования

### 14.1 Горизонтальное
- API: stateless, multiple instances behind load balancer
- Workers: separate BullMQ workers, auto-scale
- DB: read replicas для отчётов
- CDN: static assets + media
- Redis: cluster mode

### 14.2 Вертикальное
- Connection pooling (PgBouncer)
- Redis caching: schedule, public pages
- ISR для публичных страниц (revalidate: 3600)
- Image optimization (next/image, WebP)
- Lazy loading, code splitting

### 14.3 Будущее
- Mobile app (React Native / Expo) — shared types
- Multi-academy (tenant isolation)
- WebSocket real-time (посещаемость, уведомления)
- Analytics (Metabase / Grafana)
- i18n (ru/en)

---

## 15. Конструктор формы — спецификация (Future v1.1)

> Входит в **Future**, не в MVP. См. [MVP_SCOPE.md](./MVP_SCOPE.md).

```
FormBuilder Component:
├── Input Panel (left)
│   ├── Фамилия (text input)
│   ├── Номер (number input, 1-99)
│   ├── Размер (select: XS-XXL)
│   └── Цвет формы (color picker / presets)
├── Preview Panel (right)
│   ├── 3D/2D preview футболки
│   ├── Фамилия на спине (real-time)
│   ├── Номер на спине (real-time)
│   └── Цена (динамический расчёт)
└── State: Zustand store
    └── Persist to cart on "Добавить в корзину"
```

---

## 16. Dashboard — требования

> Dashboard каждого кабинета — **самый красивый экран системы**. Подробные wireframes — в [PRODUCT_VISION.md](./PRODUCT_VISION.md#9-dashboard--сердце-продукта).

### Общие требования

1. Первый экран после входа — всегда Dashboard
2. Персонализация: «Доброе утро, {имя}!»
3. Крупные информативные карточки (grid, gap 24px)
4. Quick Actions — 3-4 самых частых действия
5. Живой контент: фото, новости, события
6. Прогресс визуально: абонемент, посещаемость
7. Skeleton loading при загрузке
8. Empty states с иллюстрациями

### Dashboard родителя

| Блок | Содержание |
|------|------------|
| ChildCard | Фото, имя, группа, quick stats |
| NextEvent | Ближайшая тренировка (дата, время, место) |
| SubscriptionProgress | Остаток тренировок, прогресс-бар |
| RecentPhotos | 4 превью + ссылка на альбом |
| QuickActions | Оплатить, Расписание, Статистика, Уведомления |
| AcademyNews | Последняя новость академии |

### Dashboard тренера

| Блок | Содержание |
|------|------------|
| NextSession | Следующая тренировка + кнопка «Отметить» |
| MyGroups | Список групп с количеством детей |
| QuickActions | Посещаемость, Матч, Фото |
| RecentAnnouncements | Последние объявления |

### Dashboard администратора

| Блок | Содержание |
|------|------------|
| StatCards | Дети, посещаемость %, истекающие абонементы, доход |
| AttentionRequired | Список «требует внимания» |
| QuickActions | + Ребёнок, Расписание, Оплаты |

---

## 17. Emotional Design

> Подробно — в [PRODUCT_VISION.md](./PRODUCT_VISION.md#8-emotional-design).

**Принцип:** платформа не должна восприниматься как CRM. Каждый экран — современный спортивный цифровой продукт.

| Экран | Целевая эмоция |
|-------|----------------|
| Публичная главная | Вдохновение, доверие |
| Dashboard родителя | Спокойствие, гордость |
| Карточка ребёнка | Гордость (статистика как в FIFA) |
| Посещаемость | Прозрачность (календарь, не таблица) |
| Dashboard тренера | Эффективность |
| Dashboard админа | Контроль без перегруза |

**Антипаттерны:** таблицы на 15 колонок, серые формы, CRM-терминология, пустые экраны без иллюстраций.

---

## 18. Индекс документации

| Документ | Содержание |
|----------|------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Техническая архитектура, БД, API, роутинг |
| [PRODUCT_VISION.md](./PRODUCT_VISION.md) | Философия, цели, сценарии, Emotional Design |
| [UI_GUIDELINES.md](./UI_GUIDELINES.md) | Палитра, типографика, анимации, компоненты |
| [UX_PRINCIPLES.md](./UX_PRINCIPLES.md) | Простота, клики, анти-CRM паттерны |
| [MVP_SCOPE.md](./MVP_SCOPE.md) | Границы MVP vs Future, план 12 недель |
| [SCREEN_SPECIFICATION.md](./SCREEN_SPECIFICATION.md) | Спецификация всех 74 экранов |
| [COMPONENT_MAP.md](./COMPONENT_MAP.md) | Карта ~158 UI-компонентов |

---

*Документ подготовлен для этапа 0 — Проектирование. Следующий этап: Foundation (инициализация monorepo).*
