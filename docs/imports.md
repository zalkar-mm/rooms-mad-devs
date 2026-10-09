# Импорты

## 1. Основные правила

1. **Никаких `index.*` и barrel-ре-экспортов** — нигде в `src/`.
2. Импорт — **сверху вниз по слоям FSD**; между слайсами одного слоя — запрещён.
3. **Между слоями — alias `@/`**, **внутри своего слайса — относительный путь**.
4. Alias на свой же слой запрещён: `@/features/*` из `features/*` — это всегда либо кросс-импорт, либо
   самоимпорт через alias. ESLint ловит оба.
5. `src/mocks` импортирует только `app/`.

## 2. Alias

Один alias `@/*` → `src/*`, в `tsconfig.app.json` и `vite.config.ts`. Других (`~app`, `@features`) не заводим.

## 3. Направление

| Из | Может импортировать |
|---|---|
| `app` | всё, включая `src/mocks` |
| `pages` | `widgets`, `features`, `entities`, `shared` |
| `widgets` | `features`, `entities`, `shared` |
| `features` | `entities`, `shared` |
| `entities` | `shared` + свой слайс (относительно) |
| `shared` | только `shared` (относительно) |
| `mocks` | `entities/*/model`, `entities/*/lib`, `shared` (`docs/mocks.md` §1) |

Дополнительно (ESLint `no-restricted-imports`):
- `axios` — только `shared/api/**`, `entities/*/api/**`.
- `radix-ui`, `react-day-picker` — только `shared/ui/**`.
- `sonner` — только `shared/ui/**` (`toaster.tsx`) и `shared/lib/notify.ts`.
- `msw` — только `src/mocks/**`.

## 4. Конкретный файл, без barrel

```ts
import { Button } from "@/shared/ui/button"
import { useBookings } from "@/entities/booking/api/use-bookings"
import { BookingBlock } from "@/entities/booking/ui/booking-block"
```

Публичная поверхность слайса — `docs/architecture.md` §4.

## 5. Относительные пути внутри слайса

```ts
// entities/booking/api/use-bookings.ts
import type { BookingListParams } from "../model/booking.types"
import { bookingKeys } from "./booking-keys"
import { bookingRepository } from "./booking-repository"
```

Внутри `shared` — тоже относительно (`../lib/cn`).

## 6. Порядок групп (`simple-import-sort`)

Группы разделяются пустой строкой:

```ts
// 1. node: и react
import { useState } from "react"

// 2. Внешние пакеты
import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

// 3. Слои FSD сверху вниз: @/app → @/pages → @/widgets → @/features → @/entities → @/shared
import { useBookingForm } from "@/features/booking-form/model/use-booking-form"
import { BookingBlock } from "@/entities/booking/ui/booking-block"
import { cn } from "@/shared/lib/cn"

// 4. @/mocks (только в app)

// 5. Относительные
import { bookingKeys } from "./booking-keys"

// 6. CSS и side-effects
import "./index.css"
```

## 7. type-only импорты

`import type { Booking } from "…"`. Смешанный — `import { type X, useX } from "…"`, если из одного файла.

## 8. Проверки

ESLint падает на: импорт вверх по слою, кросс-слайс, alias на свой слой, `index.*`, запрещённые пакеты
вне разрешённых мест, неотсортированные импорты, циклы.
