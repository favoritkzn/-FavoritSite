# ФК «Фаворит» — UI Guidelines

> Версия: 1.0 | Дата: 30.06.2026  
> Связанные документы: [PRODUCT_VISION.md](./PRODUCT_VISION.md) · [UX_PRINCIPLES.md](./UX_PRINCIPLES.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 1. Философия дизайна

Интерфейс «Фаворит» — это **современный SaaS-продукт уровня Apple, Stripe, Vercel, Notion и Linear**, адаптированный под футбольную академию.

Мы не копируем эти продукты — мы заимствуем их принципы:

| Продукт | Что берём |
|---------|-----------|
| **Apple** | Воздух, типографика, внимание к деталям |
| **Stripe** | Чистота форм, чёткая иерархия, доверие |
| **Vercel** | Минимализм, тёмные акценты, скорость ощущения |
| **Notion** | Карточки, пустые состояния, дружелюбность |
| **Linear** | Плавные анимации, keyboard-first, плотность без перегруза |

**Наша идентичность:** спортивная энергия + премиальная простота.

---

## 2. Фирменная палитра

### Основные цвета

> ⚠️ **Зелёный не используется как основной цвет.** Акцент — современный спортивный красный.

```css
/* ─── Primary ─── */
--color-primary:        #DC2626;   /* Красный — основной акцент */
--color-primary-hover:  #B91C1C;   /* Hover-состояние */
--color-primary-light:  #FEE2E2;   /* Светлый фон для акцентов */
--color-primary-subtle: #FEF2F2;   /* Едва заметный красный фон */

/* ─── Neutrals ─── */
--color-white:          #FFFFFF;   /* Белый — карточки, контент */
--color-background:     #F5F5F7;   /* Светло-серый — фон страниц */
--color-surface:        #FFFFFF;   /* Поверхности (карточки) */
--color-border:         #E5E7EB;   /* Границы */
--color-border-subtle:  #F3F4F6;   /* Едва заметные границы */

/* ─── Text ─── */
--color-text:           #1F2937;   /* Тёмно-серый — основной текст */
--color-text-secondary: #6B7280;   /* Вторичный текст */
--color-text-muted:     #9CA3AF;   /* Приглушённый текст */
--color-text-inverse:   #FFFFFF;   /* Текст на красном фоне */

/* ─── Semantic ─── */
--color-success:        #16A34A;   /* Успех (единственное допустимое зелёное) */
--color-success-light:  #DCFCE7;
--color-warning:        #F59E0B;   /* Предупреждение */
--color-warning-light:  #FEF3C7;
--color-error:          #DC2626;   /* Ошибка (= primary) */
--color-error-light:    #FEE2E2;
--color-info:           #3B82F6;   /* Информация */
--color-info-light:     #DBEAFE;
```

### Тёмная тема (архитектура заложена, реализация — Future)

```css
--color-dark-background:  #0F0F0F;
--color-dark-surface:     #1A1A1A;
--color-dark-border:      #2D2D2D;
--color-dark-text:        #F5F5F5;
--color-dark-text-muted:  #9CA3AF;
```

### Использование красного

| Контекст | Применение |
|----------|------------|
| CTA-кнопки | Primary button |
| Активные элементы | Выбранный таб, активный пункт меню |
| Прогресс | Кольца, бары (абонемент, посещаемость) |
| Акценты | Бейджи, иконки, hover-линии |
| Hero-секции | Градиент или overlay на фото |

**Не использовать красный:** для фона всей страницы, для больших заливок, для текста основного контента.

---

## 3. Типографика

### Шрифты

```css
--font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Inter', sans-serif;  /* Заголовки — тот же шрифт, другой weight */
```

> Inter — как у Linear, Vercel, Notion. Отличная читаемость, поддержка кириллицы.

### Шкала

| Token | Size | Weight | Line-height | Использование |
|-------|------|--------|-------------|---------------|
| `display-xl` | 48px | 700 | 1.1 | Hero заголовки |
| `display-lg` | 36px | 700 | 1.15 | Заголовки страниц |
| `heading-lg` | 24px | 600 | 1.25 | Секции Dashboard |
| `heading-md` | 20px | 600 | 1.3 | Заголовки карточек |
| `heading-sm` | 16px | 600 | 1.4 | Подзаголовки |
| `body-lg` | 16px | 400 | 1.6 | Основной текст |
| `body-md` | 14px | 400 | 1.5 | Вторичный текст |
| `body-sm` | 12px | 400 | 1.5 | Подписи, метки |
| `label` | 12px | 500 | 1.4 | Badges, labels (uppercase tracking) |

### Правила

- Заголовки — `font-weight: 600-700`, тёмно-серый
- Основной текст — `14-16px`, regular
- Минимальный размер — `12px` (только для меток)
- Межбуквенный интервал для uppercase labels: `0.05em`

---

## 4. Spacing & Layout

### Принцип: большие отступы

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
--space-20:  80px;
--space-24:  96px;
```

### Правила отступов

| Элемент | Padding | Gap |
|---------|---------|-----|
| Карточка | 24px (`space-6`) | — |
| Секция Dashboard | — | 24px между карточками |
| Страница (контент) | 32px horizontal, 40px vertical | — |
| Между секциями | — | 48-64px |
| Внутри формы | — | 16px между полями |
| Кнопки | 12px 24px | 12px между кнопками |

### Grid

- **Dashboard:** CSS Grid, 12 колонок, gap 24px
- **Карточки:** `border-radius: 16px`, `padding: 24px`
- **Максимальная ширина контента:** 1280px (centered)
- **Sidebar:** 260px fixed, collapsible на tablet

---

## 5. Карточки (Cards)

Карточка — основной строительный блок интерфейса.

### Базовая карточка

```css
.card {
  background: var(--color-white);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}
```

### Типы карточек

| Тип | Описание | Пример |
|-----|----------|--------|
| `StatCard` | Крупная цифра + подпись + тренд | «52 детей · +3 за месяц» |
| `ChildCard` | Фото + имя + группа + quick stats | Карточка ребёнка на Dashboard |
| `EventCard` | Дата + время + место + действие | Ближайшая тренировка |
| `MediaCard` | Фото с overlay | Превью альбома |
| `ActionCard` | Иконка + текст + CTA | Быстрое действие |
| `ProgressCard` | Прогресс-бар + метрики | Абонемент: 8/12 |

### Glassmorphism (точечно)

Использовать **только** для:
- Hero-overlay на публичной главной
- Floating navigation при скролле
- Modal backdrop

```css
.glass {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

---

## 6. Закругления (Border Radius)

```css
--radius-sm:   8px;    /* Кнопки, inputs, badges */
--radius-md:   12px;   /* Мелкие карточки, dropdown */
--radius-lg:   16px;   /* Основные карточки */
--radius-xl:   24px;   /* Hero-секции, модалы */
--radius-full: 9999px; /* Аватары, pills, toggle */
```

---

## 7. Тени (Shadows)

```css
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.06);
--shadow-md:  0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.12);
--shadow-xl:  0 16px 48px rgba(0, 0, 0, 0.16);
```

Тени мягкие, едва заметные — как у Apple/Linear. Никаких жёстких `box-shadow: 0 2px 4px #000`.

---

## 8. Анимации

### Принципы

1. **Быстрые** — 150-300ms, не заставлять ждать
2. **Осмысленные** — анимация объясняет, что произошло
3. **Плавные** — `ease-out` для появления, `ease-in` для исчезновения
4. **Ненавязчивые** — не отвлекают от контента

### Page Transitions

```typescript
// Framer Motion — переход между страницами
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.2 } },
};
```

### Hover-анимации

| Элемент | Эффект | Duration |
|---------|--------|----------|
| Карточка | `translateY(-2px)` + тень | 200ms |
| Кнопка | `scale(1.02)` + затемнение фона | 150ms |
| Ссылка | Подчёркивание снизу (красная линия) | 200ms |
| Аватар | `scale(1.05)` | 200ms |
| Иконка действия | `scale(1.1)` + красный цвет | 150ms |

### Микроанимации

| Действие | Анимация |
|----------|----------|
| Отметка посещаемости | Checkbox: scale bounce + зелёная галочка |
| Успешная оплата | Confetti или checkmark с scale |
| Добавление в корзину | Иконка «летит» в корзину |
| Загрузка фото | Progress bar + fade-in превью |
| Переключение таба | Underline slide |
| Появление уведомления | Slide-in справа + fade |
| Счётчик (статистика) | Count-up animation |

### List Stagger

```typescript
// Элементы списка появляются каскадом
const listVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};
```

---

## 9. Skeleton Loading

Показывать скелетон вместо спиннера. Форма скелетона повторяет форму контента.

```css
.skeleton {
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Где использовать

| Экран | Скелетон |
|-------|----------|
| Dashboard | 4 карточки-скелетона в grid |
| Список детей | 6 карточек с аватаром + 2 строки |
| Расписание | 5 строк с временем + названием |
| Галерея | Grid из 8 прямоугольников |
| Новости | 3 карточки с изображением + текст |

**Никогда:** полноэкранный спиннер (кроме auth-операций).

---

## 10. Empty States

Каждый пустой экран — возможность для эмоции и действия.

### Структура

```
┌─────────────────────────────┐
│                             │
│      [Иллюстрация]          │  ← SVG, 120-160px, красный акцент
│                             │
│   Заголовок                 │  ← heading-md, дружелюбный
│   Описание в 1-2 строки     │  ← body-md, text-secondary
│                             │
│   [ CTA Button ]            │  ← primary, если есть действие
│                             │
└─────────────────────────────┘
```

### Примеры

| Экран | Заголовок | CTA |
|-------|-----------|-----|
| Нет детей (родитель) | «Пока нет привязанных детей» | «Связаться с администратором» |
| Нет фото | «Фото появятся после тренировки» | — |
| Нет уведомлений | «Всё спокойно!» | — |
| Нет заказов | «Магазин ждёт вас» | «Перейти в магазин» |
| Нет матчей | «Добавьте первый матч» | «+ Добавить матч» |
| Пустая корзина | «Корзина пуста» | «В каталог» |

---

## 11. Success States

### Оплата прошла

```
┌─────────────────────────────┐
│                             │
│      ✓ (анимация)           │  ← Зелёная галочка, scale bounce
│                             │
│   Оплата прошла!            │
│   Абонемент продлён до      │
│   15.08.2026                │
│                             │
│   [На главную]  [Чек]       │
└─────────────────────────────┘
```

### Посещаемость отмечена

- Toast: «Посещаемость сохранена ✓» (зелёный, 3 сек, auto-dismiss)
- Краткая вибрация на мобильном (future)

### Заказ оформлен

- Success-страница с номером заказа
- Анимация checkmark
- «Мы сообщим, когда форма будет готова»

---

## 12. Error States

### Принципы

- **Не пугать** — спокойный тон, без красных заливок на весь экран
- **Объяснить** — что случилось и что делать
- **Действие** — кнопка «Попробовать снова»

### Inline-ошибки (формы)

```css
.input-error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px var(--color-error-light);
}
/* Текст ошибки под полем: body-sm, color-error */
```

### Страничные ошибки

```
┌─────────────────────────────┐
│                             │
│      [Иллюстрация]          │  ← Мяч в сетке ворот (для 404)
│                             │
│   Что-то пошло не так       │
│   Попробуйте обновить       │
│   страницу                  │
│                             │
│   [Обновить]  [На главную]  │
└─────────────────────────────┘
```

### 404

- Иллюстрация: мяч летит мимо ворот
- Текст: «Эта страница не на поле» (юмор, в духе бренда)
- CTA: «Вернуться на главную»

---

## 13. Кнопки

### Иерархия

| Тип | Стиль | Использование |
|-----|-------|---------------|
| **Primary** | Красный фон, белый текст | Главное действие (1 на экран) |
| **Secondary** | Белый фон, красная обводка | Вторичное действие |
| **Ghost** | Прозрачный, серый текст | Третичное, навигация |
| **Danger** | Красный outline | Удаление, отмена |
| **Icon** | Круглая, иконка | Компактные действия |

```css
.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-sm);
  padding: 12px 24px;
  font-weight: 500;
  font-size: 14px;
  transition: background 0.15s, transform 0.15s;
}
.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: scale(1.02);
}
```

---

## 14. Иконки

- **Библиотека:** Lucide Icons (как у shadcn/ui)
- **Размер:** 16px (inline), 20px (кнопки), 24px (навигация)
- **Стиль:** Outline, stroke-width: 1.5
- **Цвет:** `text-secondary` по умолчанию, `primary` при активности

---

## 15. Адаптивность

### Breakpoints

```css
--breakpoint-sm:  640px;   /* Mobile landscape */
--breakpoint-md:  768px;   /* Tablet */
--breakpoint-lg:  1024px;  /* Desktop */
--breakpoint-xl:  1280px;  /* Wide desktop */
```

### Правила

| Экран | Поведение |
|-------|-----------|
| Mobile (< 768px) | Sidebar → bottom nav, карточки в 1 колонку |
| Tablet (768-1024px) | Sidebar collapsed (иконки), 2 колонки |
| Desktop (> 1024px) | Full sidebar, 3-4 колонки grid |

### Touch targets

- Минимум **44x44px** для кликабельных элементов на мобильном
- Отступ между кнопками — минимум 8px

---

## 16. Чеклист для каждого экрана

Перед сдачей экрана проверить:

- [ ] Соответствует палитре (красный/белый/серый, без зелёного)
- [ ] Достаточно воздуха (padding ≥ 24px)
- [ ] Карточки с border-radius 16px
- [ ] Skeleton loading реализован
- [ ] Empty state с иллюстрацией
- [ ] Error state обработан
- [ ] Hover-анимации на интерактивных элементах
- [ ] Адаптивность: mobile + desktop
- [ ] Типографика по шкале
- [ ] Не выглядит как CRM-таблица

---

*Этот документ — источник правды для всех UI-решений. При разработке компонентов в `@favorit/ui` следовать этим guidelines.*
