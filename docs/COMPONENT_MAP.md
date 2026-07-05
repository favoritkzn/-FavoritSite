# ФК «Фаворит» — Component Map

> Версия: 1.0 | Дата: 30.06.2026  
> Статус: UX/UI проектирование (до реализации)  
> Связанные документы: [SCREEN_SPECIFICATION.md](./SCREEN_SPECIFICATION.md) · [UI_GUIDELINES.md](./UI_GUIDELINES.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Соглашения

| Колонка | Описание |
|---------|----------|
| **Переисп.** | ✅ — shared (`@favorit/ui`), ⚠️ — feature-specific, 🔒 — page-only |
| **Пакет** | `ui` = `@favorit/ui`, `web` = `apps/web/components` |
| **MVP** | ✅ в первой версии, Future — позже |

---

## 1. Layout-компоненты

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `PublicLayout` | ⚠️ | web | Header + main + footer для публичного сайта | `/`, `/about`, `/coaches`, `/news`, `/gallery`, `/contacts`, `/pricing`, `/schedule`, `/privacy`, `/terms` |
| `AuthLayout` | ⚠️ | web | Центрированная карточка на фоне | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| `DashboardLayout` | ⚠️ | web | Sidebar + topbar + content area | Все `/parent/*`, `/coach/*`, `/admin/*` |
| `ShopLayout` | ⚠️ | web | Header магазина + cart badge | `/shop/*` (Future) |
| `PublicHeader` | ✅ | ui | Sticky header: logo, nav, login CTA | PublicLayout |
| `PublicFooter` | ✅ | ui | Footer: навигация, контакты, legal | PublicLayout |
| `Sidebar` | ✅ | ui | Боковая навигация кабинета, collapsible | DashboardLayout |
| `Topbar` | ✅ | ui | Avatar, notifications bell, breadcrumbs | DashboardLayout |
| `BottomNav` | ✅ | ui | Mobile navigation (5 иконок) | DashboardLayout (mobile) |
| `PageContainer` | ✅ | ui | max-width 1280px, padding wrapper | Все страницы |
| `MobileDrawer` | ✅ | ui | Hamburger menu drawer | PublicHeader (mobile) |

---

## 2. Навигация

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `NavLink` | ✅ | ui | Ссылка с active state (красный accent) | Sidebar, PublicHeader, BottomNav |
| `Breadcrumbs` | ✅ | ui | Хлебные крошки (depth > 2) | Admin detail pages |
| `Tabs` | ✅ | ui | Underline tabs с slide animation | Child card, settings |
| `ChildSwitcher` | ⚠️ | web | Tabs переключения детей | Parent dashboard |
| `Pagination` | ✅ | ui | «Показать ещё» / page numbers | News, admin lists |
| `BackLink` | ✅ | ui | «← Назад» с hover | Detail pages |

---

## 3. Base UI (shadcn/ui — `@favorit/ui`)

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `Button` | ✅ | ui | Primary, Secondary, Ghost, Danger, Icon | Везде |
| `Input` | ✅ | ui | Text input с label и error | Forms |
| `Textarea` | ✅ | ui | Multiline input | Contacts, announcements, news |
| `Select` | ✅ | ui | Dropdown select | Filters, forms |
| `Checkbox` | ✅ | ui | Checkbox с label | Register, attendance |
| `Radio` | ✅ | ui | Radio group | — |
| `Switch` | ✅ | ui | Toggle switch | Settings |
| `Label` | ✅ | ui | Form label | Forms |
| `Form` | ✅ | ui | React Hook Form wrapper | All forms |
| `FormField` | ✅ | ui | Field + label + error | All forms |
| `Card` | ✅ | ui | Base card container | Везде |
| `Dialog` | ✅ | ui | Modal dialog | Confirm, create modals |
| `Sheet` | ✅ | ui | Side panel / bottom sheet | Mobile filters |
| `Dropdown` | ✅ | ui | Dropdown menu | Avatar menu, actions |
| `Popover` | ✅ | ui | Popover | Date picker trigger |
| `Tooltip` | ✅ | ui | Hover tooltip | Icon buttons |
| `Avatar` | ✅ | ui | User/child photo, fallback initials | Profile, cards, topbar |
| `Badge` | ✅ | ui | Status badge (цвет + текст) | Attendance, payments, orders |
| `Separator` | ✅ | ui | Horizontal divider | Layout |
| `Calendar` | ✅ | ui | Date picker | Schedule, matches |
| `Command` | ✅ | ui | Search command palette | Admin search (Future) |
| `Table` | ✅ | ui | Data table (max 6 cols) | Admin payments, optional lists |
| `Toast` | ✅ | ui | Notification toast | Success/error feedback |
| `Toaster` | ✅ | ui | Toast container | Root layout |
| `Skeleton` | ✅ | ui | Shimmer skeleton primitive | Loading states |

---

## 4. Feedback & States

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `EmptyState` | ✅ | ui | Иллюстрация + title + description + CTA | Lists без данных |
| `ErrorState` | ✅ | ui | Error block + retry button | API errors |
| `SuccessState` | ✅ | ui | Checkmark animation + message | Payment success |
| `LoadingSkeleton` | ✅ | ui | Page-level skeleton composition | Dashboard, lists |
| `PageSkeleton` | ✅ | ui | Full page skeleton | Route loading |
| `ConfirmDialog` | ✅ | ui | «Вы уверены?» modal | Delete actions |
| `InlineError` | ✅ | ui | Form field error message | Forms |
| `Spinner` | ✅ | ui | Button inline spinner | Submit loading |

---

## 5. Typography & Content

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `PageHeader` | ✅ | ui | Title + description + action slot | Все dashboard pages |
| `PageGreeting` | ✅ | ui | Time-based greeting | Parent dashboard |
| `SectionTitle` | ✅ | ui | H2 section heading + optional link | Public pages |
| `Prose` | ✅ | ui | Rich text content wrapper | News article, about, legal |
| `StatValue` | ✅ | ui | Large number + label + trend | StatCards, dashboard |
| `TimeAgo` | ✅ | ui | Relative time formatter | Notifications, feed |

---

## 6. Cards (ключевые building blocks)

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `StatCard` | ✅ | ui | Метрика: число + подпись + тренд | Admin dashboard, statistics |
| `ChildCard` | ✅ | ui | Фото + имя + группа + mini stats | Parent/coach children lists, dashboard |
| `EventCard` | ✅ | ui | Дата/время + место + CTA | Dashboard, schedule |
| `ProgressCard` | ✅ | ui | Прогресс-бар + метрики | Subscription, dashboard |
| `ActionCard` | ✅ | ui | Иконка + текст + click action | Quick actions variant |
| `CoachCard` | ✅ | ui | Фото + имя + опыт | `/coaches`, home preview |
| `NewsCard` | ✅ | ui | Обложка + заголовок + дата | `/news`, dashboard |
| `GroupCard` | ✅ | ui | Название + count + next session | Coach/admin groups |
| `PaymentCard` | ✅ | ui | Дата + сумма + status badge | Payment history |
| `MatchCard` | ✅ | ui | Счёт + дата + соперник | Coach matches |
| `ProductCard` | ✅ | ui | Фото + название + цена | Shop catalog (Future) |
| `AlbumCard` | ✅ | ui | Обложка + название + count | Gallery, media |
| `NotificationItem` | ✅ | ui | Icon + title + time + read state | Notifications |
| `AnnouncementCard` | ⚠️ | web | Title + date + group | Coach announcements |
| `PlanCard` | ✅ | ui | Тариф: цена + sessions + CTA | `/pricing` |
| `AlertItem` | ✅ | ui | Warning + text + link | Admin attention block |

---

## 7. Dashboard-специфичные

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `QuickActions` | ✅ | ui | Row of 3–4 action buttons with icons | All 3 dashboards |
| `MediaStrip` | ✅ | ui | 4 photo thumbnails + link | Parent dashboard |
| `NewsBanner` | ✅ | ui | Single news highlight | Parent dashboard |
| `SessionList` | ⚠️ | web | List of training sessions | Coach dashboard, schedule |
| `GroupList` | ⚠️ | web | Compact group list | Coach dashboard |
| `AttentionList` | ⚠️ | web | Admin warnings list | Admin dashboard |
| `ActivityTimeline` | ⚠️ | web | Recent activity feed | Admin dashboard |
| `MiniBarChart` | ⚠️ | web | 7-day attendance chart | Admin dashboard |

---

## 8. Forms & Inputs

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `LoginForm` | ⚠️ | web | Email + password | `/login` |
| `RegisterForm` | ⚠️ | web | Registration fields + consent | `/register` |
| `ForgotPasswordForm` | ⚠️ | web | Email field | `/forgot-password` |
| `ResetPasswordForm` | ⚠️ | web | New password fields | `/reset-password` |
| `ProfileForm` | ⚠️ | web | Name, phone, email | Profile, settings |
| `PasswordChangeForm` | ⚠️ | web | Old + new password | Settings |
| `ContactForm` | ⚠️ | web | Заявка на запись | `/contacts` |
| `ChildForm` | ⚠️ | web | Create/edit child (admin) | Admin children |
| `GroupForm` | ⚠️ | web | Create/edit group | Admin groups |
| `SessionForm` | ⚠️ | web | Create training session | Admin schedule |
| `MatchForm` | ⚠️ | web | Match + events | Coach matches |
| `AnnouncementForm` | ⚠️ | web | Title + content + group | Coach announcements |
| `NewsEditor` | ⚠️ | web | Rich text news editor | Admin news |
| `SiteSettingsForm` | ⚠️ | web | Academy settings | Admin settings |
| `PaymentForm` | ⚠️ | web | Plan selection + ЮKassa | `/parent/payments/new` |
| `SearchInput` | ✅ | ui | Input with search icon | Admin lists |
| `FilterPills` | ✅ | ui | Horizontal filter chips | Lists, catalog |
| `DateRangePicker` | ✅ | ui | From–to date picker | Admin statistics (Future) |
| `FileUpload` | ✅ | ui | Drag & drop upload zone | Coach/admin media |
| `PhoneInput` | ✅ | ui | Phone with mask +7 | Register, profile |

---

## 9. Attendance

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `AttendanceList` | ⚠️ | web | Children list with status dropdown | `/coach/attendance/[sessionId]` |
| `AttendanceRow` | ✅ | ui | Single child row: avatar + name + status select | AttendanceList |
| `AttendanceStatusSelect` | ✅ | ui | Present/Absent/Late/Excused dropdown | AttendanceRow |
| `AttendanceCalendar` | ⚠️ | web | Heatmap calendar | Parent attendance |
| `AttendanceBadge` | ✅ | ui | Colored status badge | Child card, history |
| `MarkAllButton` | ⚠️ | web | «Отметить всех» toggle | Attendance page |

---

## 10. Schedule

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `ScheduleGrid` | ⚠️ | web | Week grid: day × time | Public schedule |
| `ScheduleList` | ✅ | ui | Vertical session list | Parent/coach schedule |
| `SessionRow` | ✅ | ui | Single session: time + group + venue | ScheduleList |
| `WeekNavigator` | ✅ | ui | ← Week → navigation | Schedule pages |

---

## 11. Statistics & Charts

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `StatsRow` | ✅ | ui | Horizontal row of stat items | Child card |
| `StatItem` | ✅ | ui | Icon + value + label | StatsRow |
| `ProgressBar` | ✅ | ui | Animated progress bar | Subscription |
| `ProgressRing` | ✅ | ui | Circular progress | Future |
| `BarChart` | ⚠️ | web | Bar chart (recharts) | Statistics (Future) |
| `EventTimeline` | ⚠️ | web | Match events timeline | Match detail |
| `ScoreBoard` | ⚠️ | web | Match score display | Match card/detail |

---

## 12. Media & Gallery

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `GalleryGrid` | ✅ | ui | Responsive image grid | Gallery, media |
| `Lightbox` | ✅ | ui | Fullscreen image viewer | Gallery, media |
| `ImagePreview` | ✅ | ui | Thumbnail with lazy load | Product, news |
| `MediaUploader` | ⚠️ | web | Upload + progress + preview | Coach media |
| `AlbumGrid` | ✅ | ui | Album cards grid | Gallery, parent media |

---

## 13. Shop (Future v1.1)

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `ProductGrid` | ✅ | ui | Product cards grid | `/shop` |
| `ProductGallery` | ⚠️ | web | Image carousel | `/shop/[id]` |
| `VariantSelector` | ✅ | ui | Size/color picker | Product page |
| `CartDrawer` | ⚠️ | web | Side cart panel | Shop layout |
| `CartItem` | ✅ | ui | Line item in cart | Cart |
| `CartBadge` | ✅ | ui | Item count on icon | Shop header |
| `CheckoutForm` | ⚠️ | web | Shipping + payment | Checkout |
| `OrderStatusBadge` | ✅ | ui | Order production status | Orders |
| `FormBuilder` | ⚠️ | web | Split panel: inputs + live preview | `/shop/form-builder` |
| `FormPreview` | ⚠️ | web | SVG jersey with dynamic text | FormBuilder |
| `PriceCalculator` | ⚠️ | web | Real-time price update | FormBuilder, product |

---

## 14. Auth & User

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `AuthCard` | ✅ | ui | Centered card wrapper | AuthLayout |
| `Logo` | ✅ | ui | Academy logo + text | Header, auth |
| `UserMenu` | ✅ | ui | Avatar dropdown: profile, logout | Topbar |
| `NotificationBell` | ✅ | ui | Bell icon + unread count badge | Topbar |
| `RoleGuard` | ⚠️ | web | HOC/route guard by role | Dashboard routes |
| `ConsentCheckbox` | ✅ | ui | Privacy policy consent | Register |

---

## 15. Marketing (Public)

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `Hero` | ⚠️ | web | Hero section with CTA | `/` |
| `StatsBar` | ✅ | ui | 3 metrics in row | `/` |
| `FeatureGrid` | ✅ | ui | 3 feature cards | `/`, `/about` |
| `CTABanner` | ✅ | ui | Red gradient CTA block | `/`, `/about` |
| `CoachPreview` | ⚠️ | web | Coaches section with link | `/` |
| `NewsPreview` | ⚠️ | web | News section with link | `/` |
| `MapEmbed` | ⚠️ | web | Yandex/Google map iframe | `/contacts` |

---

## 16. Admin

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `DataTable` | ⚠️ | web | Table with sort, max 6 cols | Admin lists |
| `DataTableToolbar` | ⚠️ | web | Search + filters + create button | Admin lists |
| `CreateButton` | ✅ | ui | «+ Создать» FAB or header button | Admin CRUD |
| `EditModal` | ⚠️ | web | Generic edit dialog shell | Admin CRUD |
| `ViewToggle` | ✅ | ui | Cards ↔ Table toggle | Admin children |
| `StatusFilter` | ✅ | ui | Active/Inactive filter pills | Admin lists |

---

## 17. Animation & Motion

| Компонент | Переисп. | Пакет | Описание | Используется на |
|-----------|:--------:|-------|----------|-----------------|
| `PageTransition` | ✅ | ui | Framer Motion page wrapper | Route changes |
| `StaggerList` | ✅ | ui | Stagger children animation | Card grids |
| `FadeIn` | ✅ | ui | Fade + slide up | Sections |
| `CountUp` | ✅ | ui | Animated number | StatCards |
| `Shake` | ✅ | ui | Error shake animation | Form errors |
| `FlyToCart` | ⚠️ | web | Item flies to cart icon | Shop (Future) |
| `CheckmarkAnimation` | ✅ | ui | SVG checkmark draw | Success states |

---

## 18. Providers & Infrastructure (web)

| Компонент | Переисп. | Пакет | Описание |
|-----------|:--------:|-------|----------|
| `QueryProvider` | ⚠️ | web | TanStack Query provider |
| `AuthProvider` | ⚠️ | web | Auth context + token management |
| `ThemeProvider` | ⚠️ | web | Theme context (Future dark mode) |
| `MotionProvider` | ⚠️ | web | Framer Motion LazyMotion |

---

## Сводка

| Категория | Всего | ✅ Shared (`ui`) | ⚠️ Feature (`web`) |
|-----------|-------|-----------------|-------------------|
| Layout | 11 | 7 | 4 |
| Navigation | 6 | 5 | 1 |
| Base UI (shadcn) | 24 | 24 | 0 |
| Feedback & States | 8 | 8 | 0 |
| Typography | 6 | 6 | 0 |
| Cards | 16 | 14 | 2 |
| Dashboard | 8 | 4 | 4 |
| Forms | 18 | 5 | 13 |
| Attendance | 6 | 3 | 3 |
| Schedule | 4 | 3 | 1 |
| Statistics | 7 | 4 | 3 |
| Media | 5 | 4 | 1 |
| Shop (Future) | 11 | 5 | 6 |
| Auth & User | 6 | 5 | 1 |
| Marketing | 7 | 3 | 4 |
| Admin | 6 | 3 | 3 |
| Animation | 7 | 6 | 1 |
| Providers | 4 | 0 | 4 |
| **ИТОГО** | **~158** | **~99 (63%)** | **~59 (37%)** |

---

## Приоритет реализации (MVP)

### Фаза A — Foundation UI
`Button`, `Input`, `Card`, `Avatar`, `Badge`, `Skeleton`, `EmptyState`, `ErrorState`, `Logo`, `PageContainer`

### Фаза B — Layouts
`PublicLayout`, `AuthLayout`, `DashboardLayout`, `Sidebar`, `Topbar`, `BottomNav`, `PublicHeader`, `PublicFooter`

### Фаза C — Auth
`AuthCard`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`

### Фаза D — Dashboard
`PageHeader`, `PageGreeting`, `StatCard`, `ChildCard`, `EventCard`, `ProgressCard`, `QuickActions`, `MediaStrip`, `NewsBanner`, `SessionList`, `AttentionList`, `ActivityTimeline`, `MiniBarChart`

### Фаза E — Features
`AttendanceList`, `MatchForm`, `PaymentForm`, `GalleryGrid`, `NewsCard`, `FileUpload`, admin CRUD forms

### Фаза F — Shop (Future)
`FormBuilder`, `FormPreview`, `ProductCard`, `CartDrawer`, `CheckoutForm`

---

## Зависимости компонентов

```
PublicLayout
├── PublicHeader → Logo, NavLink, Button, MobileDrawer
├── PageContainer
└── PublicFooter

DashboardLayout
├── Sidebar → NavLink, Logo
├── Topbar → NotificationBell, UserMenu, Avatar
├── BottomNav → NavLink (mobile)
└── PageContainer

ParentDashboard
├── PageGreeting
├── ChildSwitcher
├── ChildCard → Avatar, StatItem, ProgressBar
├── EventCard → Button
├── ProgressCard → ProgressBar, Button
├── MediaStrip → ImagePreview
├── QuickActions → ActionCard, Button
└── NewsBanner → NewsCard
```

---

*Каждый новый компонент добавляется в этот документ перед реализацией.*
