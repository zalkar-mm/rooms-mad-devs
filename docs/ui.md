# UI — токены, Tailwind, кит, формы, уведомления, доступность

## 1. Tailwind CSS v4 и токены

### Конфигурация — только CSS
- **Нет `tailwind.config.*`.** Точка входа — `src/app/index.css`:
  ```css
  @import "tailwindcss";
  @import "tw-animate-css";
  @import "@fontsource-variable/commissioner";
  @import "./styles/tokens.css";
  ```
- `tw-animate-css` подключается через `@import` (в v4 не `@plugin`).
- Токены — в `src/app/styles/tokens.css`: значения в `:root`, регистрация в `@theme`. Там же варианты
  состояний Radix (`data-open:`, `data-closed:`, `data-checked:`, `data-unchecked:`, `data-disabled:`).
- **Источник значений — UI kit дизайнера** (промпт этапа UI kit, раздел «Токены»). Других цветов,
  размеров и теней в проекте нет.
- Только светлая тема: `.dark` и `dark:` не используются.

### Шкалы
| Группа | Токены |
|---|---|
| Цвета | `accent`, `accent-hover`, `accent-subtle`, `on-accent`, `danger`, `danger-subtle`, `success`, `success-subtle`, `grey-10/20/40/50/100`, `white` |
| Текст (межстрочный 130%) | `caption` 12, `small` 14, `body` 16, `title` 20/600 |
| Радиусы | `radius-s` 4, `radius-m` 8 |
| Тени | `shadow-1`, `shadow-2` |
| Отступы | шкала Tailwind 1/2/3/4/6/8 (4–32 px) |
| Узор недоступного | утилита `.bg-hatch` |

### Что можно в className
- Только токены и шкалы: `bg-accent-subtle`, `text-grey-50`, `gap-4`, `rounded-m`.
- Арбитрарные значения (`bg-[#…]`, `gap-[14px]`) запрещены. Исключение — размеры, которые явно заданы
  в спеке кита и которых нет в шкале; тогда комментарий над строкой.
- `!important`, `user-select: none`, `touch-action` — запрещены.
- `env(safe-area-inset-bottom)` — только у липкой кнопки «Забронировать» на мобильном.

### `style={{…}}` — только рантайм-значения
Позиция и высота брони в сетке (`top`, `height`) — единственный случай. Исключение — переменные темы
sonner на хосте `Toaster`: их перекрывает только инлайн-стиль, значения — токены.

### Mobile-first
Сначала без префикса, затем `md:` (768), `xl:` (1200, кастомный в `@theme`, если стандартный не совпал).
Опорные ширины SPEC §11: 360, 768, 1200.

## 2. Утилита `cn` — `shared/lib/cn.ts`

```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- Вызывается в теле компонента, результат — в константу (`rootCn`), в JSX — только `className={rootCn}`.
- Пробрасываемый `className` — последним аргументом.

## 3. shadcn — источник кода, не зависимость

- Код примитивов shadcn перенесён в кит-компоненты `shared/ui/*` и правится как наш. CLI не используется,
  `components.json` нет. Одно имя — один компонент: второго `Button` рядом с китовым не бывает.
- Новый примитив — взять код с сайта shadcn вручную и сразу влить в кит-компонент. Оставить Radix из
  `radix-ui`, `cva`, `data-slot`, a11y-атрибуты; убрать `dark:`, цвета не из токенов, `select-none`,
  тернарки и `&&` в JSX. Перенесённый код проходит ESLint без исключений.
- Часть, нужная одному компоненту и не влезающая в его файл, — соседний плоский файл
  `shared/ui/<component>-<part>.tsx` (`date-picker-calendar.tsx`). Снаружи кита не импортируется.
- `radix-ui`, `react-day-picker`, `sonner` импортируются только в `shared/ui/**` (`sonner` — ещё
  `shared/lib/notify.ts`), ESLint.
- Не берём: `dialog`, `alert-dialog`, `sheet`, `toast`, `form`, `table`, `command`.

## 4. Кит — `shared/ui/` и доменный UI

- `shared/ui/` — компоненты без домена: `button`, `icon-button`, `segmented-control`, `switch`, `text-field`,
  `time-select`, `date-picker`, `chip`, `chip-group`, `status-badge`, `notice`, `empty-state`, `skeleton`,
  `h-scroll`, `live-region`, `skip-link`, `screen-message`, `spinner`, `gate`, `action-bar`, `toaster`,
  `field-label` (подпись полей кита). Код Radix, react-day-picker и sonner — внутри этих файлов (§3).
- `entities/<entity>/ui/` — компоненты сущности: `room-card`, `booking-block`, `draft-block`, `booking-details`.
- `features/<slug>/ui/` — презентация сценария: `booking-form`, `delete-confirm`.
- `widgets/<slug>/ui/` — блоки экрана: `calendar-header`, `slot-cell`, `month-day-cell`, `panel-container`.
- Все компоненты презентационные: данные через пропсы и слоты, события через колбэки, без запросов,
  сторов и «сейчас». Доступен ли слот, статус брони, подписи — приходят готовыми.
- Типы пропсов экспортируются из файла компонента: `export type ButtonProps`.
- Варианты — `cva`; логические ветвления — не через `cva`.
- Состояния hover/focus для страницы `/ui-kit` — через `data-state` на обёртке и варианты
  `data-[state=hover]:`, без отдельных веток кода.

## 5. Иконки — `lucide-react`

- Импорт напрямую: `import { CalendarIcon } from "lucide-react"`. Свою обёртку `<Icon>` не делаем.
- Размер — `size-3/4/5`, цвет — `text-*` родителя.
- Иконка рядом с текстом — `aria-hidden`. Иконка без текста — только в `IconButton` с `label`.

## 6. Формы — React Hook Form + Zod

- `useForm` + `zodResolver` — в `features/<slug>/model/use-<slug>.ts`, не в `ui/`.
- Схема — `features/<slug>/model/<slug>.schema.ts`; проверки правил — вызовы `entities/booking/lib`
  (`superRefine`), не копия правил.
- Поля — кит-компоненты: `TextField` принимает `register(...)` (пробрасывает `ref`), `TimeSelect` и
  `DatePicker` — через `Controller`. Готовые компоненты форм и свои обёртки над RHF не используем.
- Ошибка сервера с `field` → `form.setError(field, { message: localizeApiError(error) })`;
  без `field` → сообщение `FormStatus` над кнопками.
- При `409`, `5xx`, сети значения формы **не сбрасываются** (SPEC §9, D13). `reset()` — только после успеха.
- Фокус уходит к первому полю с ошибкой (`shouldFocusError`).

## 7. Уведомления

### Озвучка — `shared/lib/announce.ts`
- `announce(text, "polite" | "assertive")` пишет в `<LiveRegion />` (`shared/ui/live-region.tsx`), который
  смонтирован один раз в `app/app.tsx`.
- Обязательна для: результата отправки, `409`, `404`, сбоев, смены периода и вида (SPEC §12).
- Вызов — в `features/*/model` или `widgets/*/model`, не в `ui/`. Событие (ответ сервера, нажатие) —
  `announce` в обработчике; статус запроса (сбой загрузки, «Не найдена») — `useAnnounceWhen(active, text)`
  в model-хуке. `Notice` только показывает текст и сам ничего не объявляет.

### Тосты — `shared/lib/notify.ts`
- Движок — `sonner`; напрямую его импортируют только `shared/ui/toaster.tsx` и `shared/lib/notify.ts`.
- API: `notify.success(text)`, `notify.error(text)`, `notify.apiError(error, settings)` (внутри — `localizeApiError`:
  тексты правил зависят от настроек).
- `Toaster` из `@/shared/ui/toaster` монтируется один раз в `app/app.tsx`: светлая тема, цвета — токены,
  без `richColors`.
- Тост **дополняет**, а не заменяет обязательное по SPEC: сообщение в панели (`Notice`) и `announce`.
- Тосты не перекрывают боковую панель и кнопку «Забронировать» (позиция — `bottom-left` на десктопе,
  `top-center` на мобильном).

### Подтверждения
Модальных окон нет (SPEC D12, §14). Удаление и уход с черновиком подтверждаются **в боковой панели**
(`DeleteConfirm`, `LeaveDraftConfirm`). `window.confirm/alert/prompt` запрещены.

## 8. Даты и время в интерфейсе

- `<input type="date|time">` запрещены: дата — `DatePicker` (react-day-picker внутри кита),
  время — `TimeSelect` со значениями шага из `settings.slotMinutes`.
- Значения полей — строки `YYYY-MM-DD` и `HH:mm`, как в контракте.
- Подписи («Ср, 7 октября», «Октябрь 2026») — `shared/lib/time/format-*.ts` с локалью `ru`.
- Время на экране — всегда `HH:mm` (SPEC §14).

## 9. Доступность (SPEC §12)

- Порядок Tab: шапка → сетка → панель. `SkipLink` «Перейти к календарю» — первым.
- Доступные слоты и брони фокусируются; Enter на слоте = двойное нажатие, Enter на брони — открыть.
  Esc закрывает панель.
- Поля с `label`, ошибки связаны через `aria-describedby`, `aria-invalid`.
- Недоступное отличается не только цветом: штриховка, зачёркивание, бейдж, подпись.
- Видимое кольцо фокуса на всём интерактивном, отличное от hover.
- После сохранения фокус — на созданную бронь, после удаления — в пустую панель.
- Тач-цели ≥ 44 px, поля 16 px, на 360 px нет горизонтальной прокрутки страницы.
- `prefers-reduced-motion` — без анимаций, кроме мгновенных переходов.

## 10. Запрещено

- `tailwind.config.*`, классы под конкретный компонент в CSS, `.dark`.
- Генераторы компонентов (CLI) и папка сгенерированных примитивов; второй компонент с именем кит-компонента.
- `radix-ui`, `react-day-picker` вне `shared/ui`.
- `Dialog`, `AlertDialog`, `Sheet`, любые окна поверх страницы.
- Нативные контролы вместо кита (таблица — `AGENTS.md` §3.9).
- `import … from "sonner"` вне `shared/lib/notify.ts` и `shared/ui/toaster.tsx`.
- Свой компонент `Icon`, статические `style={{…}}`, `!important`.
