# Code Style — naming, JSX без JS, useEffect, типы

## 1. Принципы

- **Один файл — одна ответственность.** Компонент либо отображает, либо оркестрирует данные, либо держит
  форму. Смешение — сигнал разделить.
- **Расширение добавлением.** Новый вариант — новая запись в карте или новая ветка `switch`, которую
  требует компилятор, а не ещё один `else if`. Правила ветвлений — ниже.
- **Однотипное — взаимозаменяемо.** Хуки `use<Entity>…` возвращают `UseQueryResult`/`UseMutationResult`
  как есть.
- **Узкие пропсы.** Компоненту нужен статус — принимает `status`, а не всю бронь.
- **Стрелки зависимостей:** `UI → features/*/model → entities/*/api → repository → axiosClient`.

```ts
const STATUS_LABEL: Record<BookingStatus, string> = {
  future: TEXTS.common.statusFuture,
  ongoing: TEXTS.common.statusOngoing,
  past: TEXTS.common.statusPast,
}
```

### Ветвления — без цепочек `if / else if`

| Случай | Как |
|---|---|
| Выбор по одному ключу (статус, код ошибки, вид, режим) | `Record<Key, Value>` или `Record<Key, () => …>` |
| Выбор по типу/варианту, ветки возвращают разное | `switch` по дискриминанту, `default: return assertNever(x)` из `shared/lib/assert-never.ts` |
| Объекты с разным поведением | фабрика: `createTimeDisplay({ mode, … })` возвращает объект с методами |
| Последовательные проверки «первая нарушенная — ответ» (правила брони) | массив `[{ check, code }]` и `find` |

- Цепочка из 3+ веток `if / else if` запрещена.
- После `return` — без `else`: ранний `return`.

```ts
const failed = CHECKS.find((rule) => !rule.check(input))
return failed ? { code: failed.code } : null
```

## 2. Naming

### Файлы и папки
- Всё в **kebab-case**: `booking-block.tsx`, `use-bookings.ts`, `format-duration.ts`.
- **Никаких `index.*`** — ни barrel, ни `index.tsx`-контейнеров. Без исключений.
- Страница — `<name>.page.tsx`. Стор — `<name>.store.ts`. Типы — `<entity>.types.ts`. Схема — `<name>.schema.ts`.
- Хук — файл = имя хука: `use-bookings.ts` → `useBookings`.

### Идентификаторы
- Компоненты, типы, `as const`-карты — **PascalCase**: `BookingBlock`, `type Booking`, `BookingStatus`.
- Функции, переменные — **camelCase**. Константы-таблицы — `SCREAMING_SNAKE_CASE`: `STATUS_LABEL`, `ROUTES`.
- Пропсы компонента — `type <Component>Props`, экспортируется.

## 3. Хендлеры

- Проп — `on[Action]`, реализация в теле — `handle[Action]`. Не миксуем.
- Проп пробрасывается как есть, если своей логики нет; обёртка — только когда есть аргументы или
  несколько эффектов.

```tsx
// ✅
function BookingBlock({ booking, onOpen }: BookingBlockProps) {
  const handleClick = () => {
    onOpen(booking.id)
  }
  return <div role="button" tabIndex={0} onClick={handleClick}>…</div>
}

// ❌ инлайн-стрелка
<div onClick={() => onOpen(booking.id)} />
```

## 4. JSX без JS

### Условный рендер — без тернарок и без `&&`
```tsx
// ❌
{isLoading ? <GridSkeleton /> : <Grid />}
{selected && <PanelContent />}
```

Как делать:

1. **Ранний `return`:**
   ```tsx
   if (query.isPending) return <GridSkeleton variant="day" />
   if (query.isError) return <Notice variant="error" action={retry}>{TEXTS.calendar.loadFailed}</Notice>
   return <Grid bookings={query.data} />
   ```
2. **`<Gate>`** (`shared/ui/gate.tsx`):
   ```tsx
   export function Gate({ when, children, fallback = null }: GateProps) {
     if (!when) return <>{fallback}</>
     return <>{children}</>
   }

   <Gate when={hasDraft}><DraftBlock {...draftProps} /></Gate>
   ```
3. **Карта состояний:**
   ```tsx
   const PANEL_VIEW: Record<PanelMode, ReactNode> = { empty: <PanelEmpty />, details: details, form: form }
   return PANEL_VIEW[mode]
   ```

### Вычисления в атрибутах — запрещены
Всё сложнее чтения переменной считается в теле: `const rootCn = cn("…", selected && "…")`.

## 5. Магические значения

- Роуты — `ROUTES`. Перечисления — `as const`, `enum` запрещён.
- Ключи запросов — фабрики (`bookingKeys.list(...)`).
- Цвета, размеры, отступы — токены (`docs/ui.md` §1).
- Рабочие часы, шаг, длительности, горизонт, выходные — из `settings`, не константами (SPEC D17).
- Тексты — `shared/consts/texts.ts` (`docs/routing.md` §2).

## 6. useEffect discipline

- Не запускай эффект ради того, что считается при рендере или в обработчике события.
- Не синхронизируй состояние из пропсов — `key=` или производное значение.
- Загрузка данных — только TanStack Query, не `useEffect`.
- Хуки — строго до любого раннего `return`.
- Подписки на `window`/`document` (Esc, `visibilitychange`, resize) — только в `useEffect` с отпиской.

## 7. Мемоизация

React Compiler включён. `React.memo`/`useMemo`/`useCallback` профилактически не ставим — только по
замеру профилировщиком, с комментарием.

## 8. Типы

- `strict`, `noUncheckedIndexedAccess`. `any` запрещён — `unknown` + сужение (Zod, type guard).
- `!` non-null assertion запрещён.
- `as unknown as X` — только с комментарием, почему иначе нельзя.
- `type`, не `interface` (кроме глобальных `.d.ts`).
- Импорт только типа — `import type`.
- `id` — всегда `string`.
- Строковые даты контракта — алиасы в `shared/lib/time/types.ts`: `type IsoDate = string` (`YYYY-MM-DD`),
  `type HhMm = string` (`HH:mm`).

## 9. Запрещено (ESLint падает)

- `any`, `enum`, `!` non-null assertion.
- `console.*`, кроме `console.error`.
- Тернарка и `&&` в JSX; инлайн-стрелка в хендлере.
- Импорт `index.*`.
- Хук после раннего `return`.
- `window.confirm/alert/prompt`.
- Нативные контролы вне `shared/ui` (`AGENTS.md` §3.9).
- Цепочка из 3+ веток `if / else if`; `else` после `return`; одинокий `if` в `else` (§1).
- `switch` по union без всех вариантов; вложенная тернарка.
- Вложенность блоков глубже 3; цикломатическая сложность функции больше 12 — разбить на функции.
- Больше 3 параметров у функции — объект параметров; булев флаг в позиционных параметрах — тоже.
- Функция длиннее 40 строк в `.ts` и 80 строк в `.tsx` — разбить на хуки, функции, подкомпоненты.
- Вычисления в JSX-атрибутах: вызов, объект, сравнение, логическое выражение — константой в теле.
- Тип `…Props` больше 8 полей — сгруппировать (`selection`, `actions`) или разбить компонент.
- Индекс массива в `key`; неиспользуемый экспорт; приведение `as`, сужающее тип без проверки.
- `workingWeekdays.includes` вне `entities/booking/lib` — только `isWorkingDay` (`docs/data.md` §6).
- Строка медиазапроса вне `shared/consts/breakpoints.ts`; `announce` в `**/ui/**` (`docs/ui.md` §7).

## 10. Флаг ревью (не ESLint)

- Файл > 300 строк без разбиения; компонент с > 3 `useEffect`.
- Одинаковая логика в двух местах — выносим в общее в том же коммите.
- «Скопировать соседний файл и поправить» — долг.
