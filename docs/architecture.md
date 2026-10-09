# Архитектура — FSD

## 1. Слои и направление зависимостей

```
app       ← точка входа, роутер, провайдеры, глобальные стили, запуск mock API
  ↓
pages     ← композиция экрана + параметры URL; без бизнес-логики
  ↓
widgets   ← самостоятельные блоки экрана (список комнат, сетка календаря, боковая панель)
  ↓
features  ← пользовательский сценарий (создать/изменить бронь, удалить, протянуть слот)
  ↓
entities  ← бизнес-сущность (settings, room, booking): контракт, API, правила, базовый UI
  ↓
shared    ← без домена: ui-кит, lib, api-клиент, config, consts
```

- Слой импортирует **только из слоёв ниже**.
- Импорт между слайсами одного слоя — запрещён.
- Проверяется ESLint (`import-x/no-restricted-paths` + `no-restricted-imports`); нарушение — ошибка.

`src/mocks/` — **вне FSD**: это подменный сервер, а не часть приложения. Правила — `docs/mocks.md`.

## 2. Что где живёт

### `app/`
- `main.tsx` — точка входа: запускает MSW при `VITE_API_MOCK=true`, затем рендер.
- `app.tsx` — провайдеры + `<RouterProvider>`, `<Toaster />`, `<LiveRegion />`, служебная панель mock API.
- `router.tsx` — все маршруты, страницы ленивые.
- `providers/query-provider.tsx` — `QueryClient`.
- `index.css` — Tailwind и тема; `styles/tokens.css` — токены (`docs/ui.md` §1).
- Может импортировать всё, включая `src/mocks`.

### `pages/`
- Одна страница = папка `pages/<name>/`, главный файл `<name>.page.tsx`.
- Страницы: `rooms` (`/`), `room` (`/rooms/:roomId`), `ui-kit` (`/ui-kit`, только dev).
- Только композиция widgets/features и чтение параметров URL. Без запросов и правил.

### `widgets/`
- Крупный блок экрана, собирает features + entities.
- Слайсы: `rooms-list`, `room-calendar` (шапка + сетка день/неделя/месяц), `booking-panel` (боковая панель).
- Связывает соседние фичи между собой (пример: успех `booking-form` → панель в режиме «Бронь»).

### `features/`
- Пользовательский сценарий над сущностью.
- Слайсы (ориентир по задачам): `booking-form` (создание и правка, T06/T10/T08/T09), `delete-booking` (T11),
  `select-slot-range` (двойное нажатие и протягивание, T03/T07), `leave-draft` (уход с черновиком).
- Структура — §3.

### `entities/<entity>/`
- `settings` — настройки и часы «сейчас»; `room` — комнаты; `booking` — брони и правила.
- Сегменты:
  - `api/` — сервер: `<entity>-keys.ts`, `<entity>-repository.ts`, `use-<entity>…ts` (запросы и мутации).
  - `model/` — контракт и клиент: `<entity>.types.ts`, `<entity>.schema.ts` (Zod ответа), сторы Zustand.
  - `lib/` — чистые функции сущности: правила брони, статус брони, форматирование.
  - `ui/` — презентационные компоненты сущности: `booking-block.tsx`, `room-card.tsx`.
- **`api/` про сервер, `model/` про контракт и клиент, `lib/` — чистые функции без React и сети.**

### `shared/`
- `api/` — `axios-client.ts`, `api-error.ts` (класс `ApiError` + коды), `normalize-api-error.ts`,
  `localize-api-error.ts`.
- `config/env.ts` — переменные окружения, валидация Zod.
- `consts/` — `routes.ts`, `texts.ts` (тексты SPEC), `dom-ids.ts`, `breakpoints.ts` (медиазапросы).
- `lib/` — `cn.ts`, `notify.ts`, `announce.ts`, `time/*` (даты, слоты, пояс).
- `ui/` — кит (`button.tsx`, `notice.tsx`, `gate.tsx`…). Код Radix, react-day-picker и sonner — внутри
  компонентов; часть одного компонента — соседний `<component>-<part>.tsx` (`docs/ui.md` §3).
- Внутри `shared` — только относительные импорты.

## 3. Структура фичи — UI отдельно от логики

```
features/<slug>/
  model/
    use-<slug>.ts            // сценарий: запросы/мутации сущностей, правила, notify, announce, 409/404
    <slug>.schema.ts         // (форма) Zod, собранный из правил entities/booking/lib
  ui/
    <slug>.tsx               // чистая презентация: значения + колбэки + слоты
    <part>.tsx               // вложенные презентационные части
  lib/                       // (опц.) чистые хелперы фичи
```

- `ui/` — только пропы и слоты. Данные приходят готовыми, события уходят колбэками `onX`.
- `model/` — всё остальное. Хук возвращает значения и хендлеры.
- Сборка `model` + `ui` — в виджете: `widgets/booking-panel` вызывает `useBookingForm()` и рендерит
  `<BookingForm …>`. Отдельный файл-контейнер в фиче не нужен.

Пример (сценарий в `model`, разметка в `ui`):

```ts
// features/delete-booking/model/use-delete-booking.ts
export function useDeleteBooking({ booking, onDeleted }: Params) {
  const remove = useDeleteBookingMutation()

  const handleDelete = () => {
    remove.mutate(booking.id, {
      onSuccess: () => {
        announce(TEXTS.panel.deleted)
        onDeleted()
      },
      onError: (error) => {
        notify.apiError(error, settings)
      },
    })
  }

  return { deleting: remove.isPending, onDelete: handleDelete }
}
```

```tsx
// features/delete-booking/ui/delete-confirm.tsx — только пропы
export function DeleteConfirm({ text, deleting, onKeep, onDelete }: DeleteConfirmProps) { … }
```

## 4. Публичная поверхность слайса — без barrel

Снаружи слайса импортируются конкретные файлы и только предназначенные для этого:

| Сегмент | Снаружи можно | Нельзя |
|---|---|---|
| `entities/*/api` | хуки `use-*.ts` | `*-repository.ts`, `*-keys.ts` |
| `entities/*/model` | `*.types.ts`, сторы | `*.schema.ts` |
| `entities/*/lib` | чистые функции | — |
| `entities/*/ui`, `features/*/ui` | компоненты | — |
| `features/*/model` | хук `use-<slug>.ts` (для виджета), типы `*.types.ts` | внутренние хуки и хелперы |

Нужен repository или ключи снаружи — значит, не хватает хука в слайсе: добавь хук
(например, `useRefetchBookings`), не пробрасывай ключи.

## 5. Кросс-каттинг между слайсами одного слоя

1. Прямой импорт `features/a` → `features/b` и `entities/a` → `entities/b` — запрещён.
2. Чистая утилита без домена → `shared/lib/`. UI-примитив → `shared/ui/`.
3. Правилам брони нужны настройки (`entities/settings`) → функции правил принимают `BookingRulesConfig`
   (подмножество настроек) **аргументом**. Тип объявлен в `entities/booking/model`; сшивает
   `settings → config` фича или mock-сервер. `entities/booking` не импортирует `entities/settings`.
4. Реакция одного сценария на другой (удаление → пустая панель) — связывает виджет или страница.

## 6. Состояние экрана календаря

| Что | Где |
|---|---|
| Комнаты, брони, настройки | TanStack Query (`entities/*/api`) |
| Вид, дата, «Моё время», открытая бронь (`booking`) | URL, `nuqs` |
| Черновик слота (дата, начало, конец) — пишет сетка, читает форма | Zustand, `entities/booking/model/booking-draft.store.ts` |
| Значения формы, ошибки полей | React Hook Form в `features/booking-form/model` |
| Открыт поповер, hover | `useState` в компоненте |

## 7. Добавление кода

**Сущность:** `model/<entity>.types.ts` (контракт SPEC §13, camelCase как есть) → `model/<entity>.schema.ts`
→ `api/<entity>-keys.ts` → `api/<entity>-repository.ts` → `api/use-*.ts` → `lib/` → `ui/`.

**Фича:** `model/use-<slug>.ts` → `ui/<slug>.tsx`. Данные — только через хуки `entities/*/api`.

**Страница:** `pages/<slug>/<slug>.page.tsx` + маршрут в `app/router.tsx` с константой из
`shared/consts/routes.ts`.

**Куда НЕ кладём:**
- HTTP из `features`/`widgets`/`pages` — только хуки `entities/*/api`.
- Сценарий мутации (тост, `announce`, реакция на `409`) — не в `entities/*/api`, а в `features/*/model`.
- Проверку правила — не в компонент и не в обработчик mock, а в `entities/booking/lib`.

## 8. Файлы

- Один компонент — один файл; папка `ui/<name>/` — только если есть сателлиты.
- Ориентир — 200–300 строк.

## 9. Архитектурные блокеры

- Импорт вверх по слоям и между слайсами одного слоя.
- `index.*` и barrel — в любом месте `src/`.
- `axios` вне `shared/api` и `entities/*/api`.
- Импорт `src/mocks` вне `app/`.
- Бизнес-логика в `pages/*` и в `*/ui/*`.
- `entities/<a>/ui` тянет `entities/<b>/*`.

## 10. Дерево на старте

```
src/
├── app/
│   ├── main.tsx
│   ├── app.tsx
│   ├── router.tsx
│   ├── index.css
│   ├── styles/tokens.css
│   └── providers/query-provider.tsx
├── pages/
│   ├── rooms/rooms.page.tsx
│   └── room/room.page.tsx
├── widgets/
├── features/
├── entities/
├── shared/
│   ├── api/axios-client.ts, api-error.ts, normalize-api-error.ts
│   ├── config/env.ts
│   ├── consts/routes.ts
│   ├── lib/cn.ts, notify.ts
│   └── ui/gate.tsx, toaster.tsx
└── mocks/
    ├── browser.ts
    ├── controls.ts
    ├── db/
    └── handlers/
```
