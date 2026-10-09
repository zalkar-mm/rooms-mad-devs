# Mock API — MSW

Бэкенда нет. Сервер подменяет MSW в браузере. Для приложения это обычный HTTP по контракту SPEC §13:
замена на реальный бэкенд — `VITE_API_MOCK=false` и `VITE_API_BASE_URL`, без правки `src/` вне `mocks/`.

## 1. Место в архитектуре

`src/mocks/` — **вне FSD**: это сервер, а не слой приложения.

| Кто | Что может импортировать из mocks | Что mocks может импортировать |
|---|---|---|
| `src/app/` | `browser.ts`, `ui/mock-panel.tsx` | — |
| остальные слои | ничего | — |
| `src/mocks/` | — | `entities/*/model/*.types.ts` (контракт), `entities/*/lib/*` (правила), `shared/{lib,ui,consts,config}/*`, `shared/api/api-error.ts` |

`mocks` не импортирует `entities/*/api`, `entities/*/ui`, `features`, `widgets`, `pages`. Проверяет ESLint.

## 2. Структура

```
src/mocks/
├── browser.ts              // setupWorker(...handlers)
├── controls.ts             // Zustand: служебные переключатели (§5)
├── db/
│   ├── storage.ts          // чтение/запись состояния в localStorage
│   └── seed.ts             // начальные комнаты и брони относительно даты первого запуска
├── handlers/
│   ├── settings.handlers.ts
│   ├── rooms.handlers.ts
│   └── bookings.handlers.ts
├── lib/
│   ├── respond-error.ts    // HttpResponse.json({ code, message, field? }, { status })
│   └── server-now.ts       // «сейчас» сервера в поясе настроек
└── ui/
    └── mock-panel.tsx      // служебная панель (§5)
```

## 3. Хранилище (SPEC D17, D18)

- Состояние (`rooms`, `bookings`, `seededAt`) — в `localStorage` под одним ключом `rooms-mad-dev:db:v1`.
  Это единственное место проекта, где разрешён `localStorage`, кроме режима «Моё время» (`docs/data.md` §8).
- Каждый обработчик **читает хранилище заново** и пишет после изменения — так данные общие для вкладок
  и переживают перезагрузку. Кэш в памяти не держим.
- Пустое или битое хранилище → `seed()`: три комнаты (T01), прошлые и будущие брони относительно
  текущей даты (T02 §8). Даты seed не зашиваются.
- `id` брони — `crypto.randomUUID()`.

## 4. Обработчики

- Пути — от `env.VITE_API_BASE_URL`: `${base}/settings`, `${base}/rooms`, `${base}/bookings`, `${base}/bookings/:id`.
- `GET /settings` — значения SPEC §4 + `serverNow` (ISO времени ответа).
- `POST`/`PATCH`/`DELETE /bookings` — порядок проверок из T02 §4.5. Существование брони/комнаты и
  `BOOKING_LOCKED` проверяет обработчик; поля, сетку, длительность, дни, горизонт, прошлое и пересечение —
  **`validateBooking` из `entities/booking/lib`**. Своих проверок правил в обработчиках нет.
- Ответ об отказе — `{ code, message, field? }`, `message` — текст SPEC §9 из `shared/consts/texts.ts`.
- Брони в ответе — по `date`, затем по `start` (D32). Название хранится обрезанным (T02 §3.10).
- Искусственной задержки нет (D16).

## 5. Служебные переключатели

`controls.ts` — Zustand-стор, читается в обработчиках через `useMockControls.getState()`:

| Флаг | Действие | Зачем |
|---|---|---|
| `conflictNext` | Следующий `POST`/`PATCH` отвечает `409 CONFLICT` и сбрасывается | Показать R8 в одной вкладке |
| `failNext` | Следующий запрос отвечает `503` и сбрасывается | Показать «Сервер не отвечает» |

Панель `ui/mock-panel.tsx` монтируется в `app/app.tsx` только при `VITE_API_MOCK=true`. Подписи — служебные,
коротко по-русски, не из SPEC. Панель не перекрывает интерфейс (свёрнута в угол).

## 6. Запуск

```ts
// app/main.tsx
async function enableMocks() {
  if (!env.VITE_API_MOCK) return
  const { worker } = await import("@/mocks/browser")
  await worker.start({ onUnhandledRequest: "bypass" })
}

void enableMocks().then(renderApp)
```

- `public/mockServiceWorker.js` — генерируется `npx msw init public --save`, в коммит, не правится.
- Demo-сборка (T16) собирается с `VITE_API_MOCK=true`: проверяющий шлёт запросы в обход интерфейса из
  консоли браузера (`fetch("/api/bookings", …)`) — их тоже перехватывает MSW.
