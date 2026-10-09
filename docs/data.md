# Data — axios, ошибки, TanStack Query, правила, часы, Zustand, nuqs

## 1. HTTP-клиент

Единственный инстанс — `shared/api/axios-client.ts`:

```ts
import axios from "axios"

import { env } from "../config/env"
import { normalizeApiError } from "./normalize-api-error"

export const axiosClient = axios.create({ baseURL: env.VITE_API_BASE_URL })

axiosClient.interceptors.response.use(undefined, (error: unknown) => Promise.reject(normalizeApiError(error)))
```

- `baseURL` — `VITE_API_BASE_URL` (по умолчанию `/api`). Пути в репозиториях — без `/api`: `"/bookings"`.
- Авторизации нет: ни cookie, ни токенов, ни refresh.
- Второй инстанс axios не создаём. `axios` импортируется только в `shared/api/**` и `entities/*/api/**`.

## 2. Ошибки — `ApiError`

Контракт ответа об отказе (SPEC §13, D10): `{ code, message, field? }`.

```ts
// shared/api/api-error.ts
export const ApiErrorCode = {
  OutsideWorkingHours: "OUTSIDE_WORKING_HOURS",
  // … все коды SPEC §9
  Conflict: "CONFLICT",
  NotFound: "NOT_FOUND",
  RoomNotFound: "ROOM_NOT_FOUND",
  Network: "NETWORK",           // клиентский: нет ответа, таймаут или 5xx
} as const
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode]

// Поля объявлены явно: parameter properties запрещает `erasableSyntaxOnly` в tsconfig.
export class ApiError extends Error {
  override readonly name = "ApiError"
  readonly code: ApiErrorCode
  readonly status: number         // 0 — нет ответа
  readonly field?: string

  constructor(code: ApiErrorCode, status: number, message: string, field?: string) {
    super(message)
    this.code = code
    this.status = status
    this.field = field
  }
}
```

- `normalizeApiError(unknown) → ApiError` — единственное место, где разбирается ошибка axios.
  Нет ответа или `5xx` → `code: "NETWORK"`.
- `localizeApiError(error) → string`: `message` из ответа, при пустом — текст по `code` из
  `shared/consts/texts.ts` (SPEC §9).
- Ветвление в сценариях — по `error.code`, никогда по тексту и не по `status`.

## 3. Repository — тонкий слой над axios

```ts
// entities/booking/api/booking-repository.ts
export const bookingRepository = {
  list: (params: BookingListParams) =>
    axiosClient.get<Booking[]>("/bookings", { params }).then((r) => r.data),
  create: (input: CreateBookingInput) =>
    axiosClient.post<Booking>("/bookings", input).then((r) => r.data),
  update: ({ id, ...patch }: UpdateBookingInput) =>
    axiosClient.patch<Booking>(`/bookings/${id}`, patch).then((r) => r.data),
  remove: (id: string) => axiosClient.delete(`/bookings/${id}`).then(() => undefined),
}
```

- Только HTTP: без хуков, тостов, инвалидации, правил и сторов.
- Типы — из `model/<entity>.types.ts`. Контракт SPEC уже в camelCase: **DTO и мапперов нет**.
- Repository приватный: импортируется только из соседних `entities/<entity>/api/*`.

## 4. TanStack Query — единственный кэш серверных данных

### Ключи — только через фабрику

```ts
// entities/booking/api/booking-keys.ts
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (params: BookingListParams) => [...bookingKeys.lists(), params] as const,
}
```

Корни: `["settings"]`, `["rooms"]`, `["bookings"]`. Строковый ключ мимо фабрики — запрещён.

### Запросы

```ts
// entities/booking/api/use-bookings.ts
export function useBookings(params: BookingListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: () => bookingRepository.list(params),
    placeholderData: keepPreviousData,   // SPEC §8: старые брони остаются до прихода новых
    enabled: options?.enabled,
  })
}
```

- Результат `useQuery`/`useMutation` возвращается как есть, без переупаковки.
- Ответы `settings` и `rooms` проверяются Zod-схемой в `queryFn` (`settingsSchema.parse`): T01 требует
  все поля настроек. Провал схемы — состояние ошибки экрана.
- `staleTime`: `settings` и `rooms` — 60 с, брони — 0 с комментарием (R8: свежесть важнее кэша).
- `refetchOnWindowFocus` — **по умолчанию (true)**: SPEC D19 требует перезапрос при возврате на вкладку.

### Мутации

Хуки мутаций — в `entities/<entity>/api/`: `use-create-booking.ts`, `use-update-booking.ts`,
`use-delete-booking.ts`. Хук знает только про сервер и кэш:

```ts
export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: bookingRepository.create,
    onSettled: () => qc.invalidateQueries({ queryKey: bookingKeys.lists() }),
  })
}
```

- Инвалидация — в `onSettled` по префиксу `bookingKeys.lists()`: после успеха, `409` и `404` период
  перезапрашивается (SPEC §8).
- Сценарий (тост, `announce`, перевод панели, выделение конфликтующей брони, `setError` полей) — в
  `features/*/model`, через колбэки `mutate(vars, { onSuccess, onError })`.
- Оптимистичных обновлений нет: R8 требует ответа сервера.

### QueryClient — `app/providers/query-provider.tsx`
- `queries: { retry: 1 }`, `mutations: { retry: 0 }`, остальное по умолчанию.
- Глобального тоста на ошибки нет: каждое состояние ошибки показывает экран (SPEC §9).
- Devtools — только в dev.

## 5. Контракт и типы

- `entities/settings/model/settings.types.ts` — объект SPEC §4, включая `serverNow` и `timezone`.
- `entities/room/model/room.types.ts` — `Room { id, name }`.
- `entities/booking/model/booking.types.ts` — `Booking { id, roomId, date, start, end, title }`, входы
  `CreateBookingInput`, `UpdateBookingInput`, `BookingListParams` (`roomId` + `date` или `from`/`to`).
- Эти же типы использует mock-сервер. Второго описания контракта нет.

## 6. Бизнес-правила — `entities/booking/lib/`

- Правила R1–R8 и P1–P9 — чистые функции без React, сети и часов:
  `validateBooking(input, { config, now, bookings, editingId }) → BookingRuleError | null`
  и мелкие функции под ней (`isOnGrid`, `overlaps`, `firstAvailableStart`, `isBookable`…).
- `config: BookingRulesConfig` — подмножество настроек, тип в `entities/booking/model`. `now` — аргумент.
- Результат — код из `ApiErrorCode` и, если есть, `field`. Текст — по коду из `texts.ts`.
- Используют: Zod-схема формы (`features/booking-form/model`), сетка (доступность слотов),
  mock-сервер (`src/mocks/handlers`). Копия правил в другом месте — блокер ревью.
- Статус брони (`past | ongoing | future`, D6, D25) — `entities/booking/lib/booking-status.ts`.

## 7. Часы «сейчас» и пояс

- Источник «сейчас» — `settings.serverNow` (D22). Пояс — `settings.timezone`.
- `shared/lib/time/clock.ts` — **единственный файл приложения**, где вызывается `Date.now()`: функция
  `clockNow(): number`.
- `entities/settings/model/use-now.ts` — хук: `serverNow + (clockNow() − dataUpdatedAt)`, пересчёт в
  начале каждой минуты; отдаёт `{ date: "YYYY-MM-DD", time: "HH:mm" }` в поясе комнаты.
- Преобразования пояса, сложение дат, слоты — `shared/lib/time/*` на `date-fns` + `@date-fns/tz`.
  Функции принимают пояс аргументом.
- «Моё время» (D23) — только отображение: подписи пересчитываются в пояс устройства, данные и правила
  всегда во времени комнаты.

## 8. Zustand — клиентское состояние

Только состояние, которое:
- читается вне React (флаги mock-сервера — `src/mocks/controls.ts`), или
- делится между далёкими виджетами (черновик слота — `entities/booking/model/booking-draft.store.ts`).

Не живёт в Zustand: серверные данные (TanStack Query), URL-состояние (`nuqs`), значения формы (RHF),
локальный UI-стейт (`useState`). `persist` и `localStorage` в сторах приложения не используем.

**Исключение:** режим отображения времени (T15 §3.9) хранится в `localStorage` через `persist` —
`features/time-mode/model/time-mode.store.ts`, ключ `rooms-mad-dev:time-mode:v1`. Чтение и запись
обёрнуты в `try/catch`: хранилище недоступно — режим комнаты. Других данных приложения в браузерном
хранилище нет.

```ts
// entities/booking/model/booking-draft.store.ts
type BookingDraftState = {
  draft: BookingDraft | null
  setDraft: (draft: BookingDraft) => void
  clear: () => void
}

export const useBookingDraftStore = create<BookingDraftState>()((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clear: () => set({ draft: null }),
}))
```

## 9. URL-состояние — `nuqs`

- Календарь: `view` (`day | week | month`), `date` (`YYYY-MM-DD`), `booking` (id открытой брони).
  Режим «Моё время» в адресе не хранится — он общий для всех комнат (§8).
- Парсеры — в `widgets/room-calendar/model/calendar-search-params.ts`, одно место.
- Значение по умолчанию для `view` зависит от ширины (D28): решает виджет, в URL не пишется, пока
  пользователь не выбрал вид.
- Адаптер — `nuqs/adapters/react-router/v7` в `app/app.tsx`.

## 10. Запрещено

- `axios`/`fetch` вне `shared/api` и `entities/*/api`.
- Строковый `queryKey` мимо фабрики; `staleTime: 0` без комментария.
- Серверные данные в Zustand или `useState`; `useEffect` для загрузки данных.
- URL-состояние в `useState`.
- Второй axios-инстанс; DTO-мапперы.
- Ветвление по тексту ошибки или по `status` вместо `code`.
- `Date.now()` / `new Date()` для «сейчас» вне `shared/lib/time/clock.ts`.
- `localStorage`/`sessionStorage` в коде приложения (в `src/mocks/db` — можно, `docs/mocks.md`). Исключение —
  режим отображения времени (T15 §3.9): `persist` в `time-mode.store.ts` (§8); других данных приложения в
  браузерном хранилище нет.
