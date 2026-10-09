# Маршруты и тексты интерфейса

## 1. React Router v7

### Маршруты — в одном месте
`app/router.tsx` — единственное место, где известны маршруты. Страницы ленивые.

```tsx
// app/router.tsx
import { createBrowserRouter, Navigate } from "react-router"

import { ROUTES } from "@/shared/consts/routes"

const devRoutes = import.meta.env.DEV
  ? [{ path: ROUTES.UI_KIT, lazy: () => import("@/pages/ui-kit/ui-kit.page").then(toRoute) }]
  : []

// Корневой маршрут без пути: HydrateFallback нужен на время загрузки ленивой страницы первого захода,
// без него react-router предупреждает в консоли.
function HydrateFallback() {
  return null
}

export const router = createBrowserRouter([
  {
    HydrateFallback,
    children: [
      { path: ROUTES.ROOMS, lazy: () => import("@/pages/rooms/rooms.page").then(toRoute) },
      { path: ROUTES.ROOM_PATTERN, lazy: () => import("@/pages/room/room.page").then(toRoute) },
      ...devRoutes,
      { path: "*", element: <Navigate to={ROUTES.ROOMS} replace /> },
    ],
  },
])
```

| Путь | Страница | Задачи |
|---|---|---|
| `/` | `pages/rooms` — карточки комнат | T13 |
| `/rooms/:roomId` | `pages/room` — календарь комнаты + панель | T03–T12, T14, T15 |
| `/ui-kit` | `pages/ui-kit` — проверка кита, только dev | UI kit |
| `*` | редирект на `/` | — |

- Неизвестный `roomId` — не редирект: экран `ScreenMessage` «Эта переговорная не найдена…» (SPEC §9).
- Охраны маршрутов (`ProtectedRoute` и т. п.) нет: авторизации нет.
- Пакет — `react-router` (v7), не `react-router-dom`.

### Пути — только константы

```ts
// shared/consts/routes.ts
export const ROUTES = {
  ROOMS: "/",
  ROOM_PATTERN: "/rooms/:roomId",
  ROOM: (roomId: string) => `/rooms/${roomId}`,
  UI_KIT: "/ui-kit",
} as const
```

Никаких строк в `<Link to>`, `<Navigate to>`, `navigate()`.

### Параметры запроса
Вид, дата, пояс, открытая бронь — `nuqs` (`docs/data.md` §9). `useSearchParams` напрямую не используем.

### Уход с черновиком
Переход «Все комнаты» при несохранённом черновике → `LeaveDraftConfirm` в панели (сценарий
`features/leave-draft`), без `window.confirm` и без `useBlocker`-диалогов браузера.

## 2. Тексты интерфейса

### Источник — SPEC
- Тексты для пользователя — **дословно** из источников: `SPEC.md` (§6, §9, §10), `tasks/*` и тексты
  дизайн-спеки / UI kit (SPEC §10 разрешает дизайнеру править формулировки). Своих формулировок нет;
  нужного текста нет — вопрос владельцу.
- Числа из настроек (рабочие часы, шаг, длительности, горизонт, длина названия) в текстах не зашиваются:
  такой текст — функция от настроек (`TEXTS.ruleErrors.*`, `TEXTS.calendar.dragLimit`), форма фразы — как в SPEC.
- Интерфейс только на русском, слоя i18n нет.

### Где живут — `shared/consts/texts.ts`
- Все тексты SPEC — в одном модуле, сгруппированы по экранам: `common`, `rooms`, `calendar`, `panel`,
  `form`, `errors` (по `ApiErrorCode`). Объект `as const`.
- Шаблонные строки — функции: `counter(n)`, `moreBookings(n)`, `pastTime(hhmm)`.
- Причина: тексты SPEC сверяются с одним файлом, а одни и те же строки нужны интерфейсу, `localizeApiError`
  и mock-серверу.
- Ветвление по коду/статусу → `Record<Kind, string>`, не цепочка `if`.
- **Служебные подписи** (панель mock API, подписи состояний на `/ui-kit`) — прямо в JSX, в `texts.ts` не идут.

### Правила текстов (SPEC §10)
- Без восклицательных знаков.
- Без слов «ошибка», «некорректный», «невалидный».
- Текст говорит, что сделать.
- Время — `HH:mm`.
