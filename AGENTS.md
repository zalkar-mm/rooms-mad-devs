# AGENTS.md — правила для AI-ассистента («Бронирование переговорных»)

**Читай этот файл при каждом входе в задачу.** Он — источник истины по конвенциям кода. Продуктовый
источник истины — `SPEC.md` и `tasks/`. Агент проекта — `.claude/agents/frontend-developer.md`.

---

## 0. Контекст и приоритет правил

**Проект.** Тестовое задание Frontend Engineer: SPA «Бронирование переговорных». Один разработчик.
Жёсткого таймбокса нет (SPEC D30): порядок работ задают приоритеты задач, фактическое время — в README.

- Бэкенда нет: только mock API на MSW (`docs/mocks.md`). Слой API заменяется реальным бэкендом сменой
  `VITE_API_BASE_URL` и `VITE_API_MOCK=false`, без правки экранов.
- Авторизации и ролей нет (SPEC §1). Тёмной темы нет. PWA нет. Автотестов нет.
- Пояс и «сейчас» — из `GET /api/settings` (`timezone`, `serverNow`; в mock — `Asia/Bishkek`).
- Маршруты: `/` — комнаты, `/rooms/:roomId` — календарь комнаты, `/ui-kit` — страница проверки кита
  (только dev). Вид и дата календаря — в URL через `nuqs`.

**Приоритет.**
1. `SPEC.md` и `tasks/` — что делаем: правила, экраны, тексты, контракт. Их не правим.
2. `AGENTS.md` и `docs/*.md` — как делаем: архитектура, стиль, процесс.
3. Промпт задачи может уточнять, но не переопределять архитектуру. Предлагает «положи это в widgets» —
   решаешь по слою и зависимостям.
4. Код противоречит правилам → правило выигрывает, флагаешь владельцу.
5. Правило противоречит правилу или SPEC → останавливаешься и спрашиваешь.

---

## 1. Стек (фиксирован)

Пакетный менеджер **npm**, Node >= 22. Мажоры закреплены, внутри мажора — последний минор.

| Пакет | Версия | Зачем |
|---|---|---|
| react, react-dom | ^19 | |
| vite, @vitejs/plugin-react, babel-plugin-react-compiler | vite ^6 | сборка, React Compiler |
| typescript | ~5.8 | |
| react-router | ^7 | маршруты |
| nuqs | ^2 | вид и дата в URL |
| @tanstack/react-query (+ devtools) | ^5 | всё серверное состояние |
| axios | ^1 | HTTP, только `shared/api` и `entities/*/api` |
| zod | ^4 | env, ответы API, схема формы |
| react-hook-form, @hookform/resolvers | ^7, ^5 | форма брони |
| date-fns, @date-fns/tz | ^4, ^1 | даты, пояс комнаты |
| react-day-picker | ^10 | только поле выбора даты, внутри `DatePicker` кита |
| @dnd-kit/core, @dnd-kit/utilities | ^6, ^3 | протягивание и перенос брони (T07) |
| zustand | ^5 | клиентское состояние вне React (`docs/data.md` §8) |
| sonner | ^2 | тосты, только через `notify` |
| radix-ui, class-variance-authority, clsx, tailwind-merge, lucide-react | | UI; Radix — только в `shared/ui` |
| tailwindcss, @tailwindcss/vite, tw-animate-css | ^4 | стили |
| @fontsource-variable/commissioner | ^5 | шрифт |
| msw | ^2 | mock API |
| eslint ^9 + плагины из `eslint.config.js`, prettier, prettier-plugin-tailwindcss | | качество |

Эти пакеты согласованы. **Пакет вне таблицы — только после согласования с владельцем**, причина — в теле
коммита.

---

## 2. Архитектура — FSD

```
app → pages → widgets → features → entities → shared
```

Импорт только вниз. Импорт вверх и между слайсами одного слоя — запрещён. `src/mocks/` — вне FSD,
импортируется только из `app/`. Полные правила — [`docs/architecture.md`](./docs/architecture.md).

---

## 3. Абсолютные запреты в коде

Блокеры, а не рекомендации. Большинство ловит ESLint.

### 3.1. Никаких barrel-файлов и `index.*`
- Ни `index.ts` с ре-экспортами, ни `index.tsx`-контейнеров — нигде в `src/`.
- Импорт всегда в конкретный файл: `@/shared/ui/button`, а не `@/shared/ui`.

### 3.2. Никаких кросс-импортов между слайсами одного слоя
- `features/edit-booking` не импортирует `features/create-booking`; `entities/booking` не импортирует
  `entities/settings`.
- Общее поднимается в `shared/` или связывается уровнем выше (widget/page).

### 3.3. JSX без JS
- **Тернарки в JSX запрещены**: `{isLoading ? <A /> : <B />}`.
- **`&&` в JSX запрещён**: `{open && <Panel />}` — роняет `0` и `""`.
- Условный рендер — ранний `return`, `<Gate when={...}>` из `@/shared/ui/gate` или карта состояний.
- **Инлайн-стрелки в хендлерах запрещены**: `onClick={() => doThing(id)}`.
- **Вычисления в атрибутах запрещены**: классы — через `cn()` в теле, `className={rootCn}`.

### 3.4. Хендлеры: проп `onX`, реализация `handleX`
Никаких `doClick`, `clickHandler`, `_onClick`.

### 3.5. `features/*/ui` — только презентация, логика — в `features/*/model`
- В `ui/`: вёрстка, пропы-значения, колбэки `onX`, слоты (`children`, именованные слоты), чисто
  визуальный `useState`/`useRef` (открыт поповер, hover).
- В `ui/` **запрещены**: хуки запросов и мутаций, `notify.*`, `announce`, `useNavigate`, чтение сторов,
  разбор `ApiError`, `useForm`.
- В `model/use-<slug>.ts`: сценарий — хуки `entities/*/api`, правила `entities/*/lib`, форма, `notify`,
  `announce`, реакция на `409`/`404`, навигация.
- Данные идут в `ui/` через слоты и пропы, события — через колбэки. Образец — `docs/architecture.md` §3.

### 3.6. Время и «сейчас»
- «Сейчас» — только из часов (`docs/data.md` §7). `new Date()` / `Date.now()` для «сейчас» в коде
  приложения запрещены.
- Даты и время в контракте — строки `YYYY-MM-DD` и `HH:mm`. Арифметика — функциями `shared/lib/time/*`,
  не руками в компонентах.

### 3.7. Бизнес-правила — в одном месте
Правила R1–R8 и P1–P9 — чистые функции в `entities/booking/lib/`. Их используют и форма, и mock-сервер.
Второй копии правил нет (`docs/data.md` §6).

### 3.8. Никаких магических значений
- Роуты — только `@/shared/consts/routes`.
- Перечисления — `as const` карты, не `enum`.
- Цвета, размеры, отступы — токены темы (`docs/ui.md` §1). Не `bg-[#F5F5F5]`, не `gap-[14px]`.
- Рабочие часы, шаг, длительности, горизонт, выходные, подсказки — из `settings`, не константами (D17, D35).

### 3.9. Нативные контролы вне `shared/ui` — через кит

| Нативное | Чем заменить |
|---|---|
| `<button>` | `Button` / `IconButton` из `@/shared/ui/*` |
| `<select>` | `TimeSelect` из `@/shared/ui/time-select` |
| `<input type="date">` | `DatePicker` из `@/shared/ui/date-picker` |
| `<input type="time">` | `TimeSelect` |
| `<input type="checkbox">` | `Switch` из `@/shared/ui/switch` |
| `window.confirm/alert/prompt` | подтверждение в боковой панели (SPEC D11, D12) |
| `import … from "sonner"` | `notify` из `@/shared/lib/notify` |
| `import … from "radix-ui"` / `"react-day-picker"` | компонент кита из `@/shared/ui/*` |

Модальных окон, `Dialog`, `AlertDialog`, `Sheet` нет (SPEC D12, §14).

---

## 4. Перед новым кодом

1. Прочитать задачу целиком и нужные разделы `SPEC.md`.
2. Прочитать релевантный `docs/*.md` — не выдумывать конвенцию.
3. Поискать похожее: `shared/ui/`, `shared/lib/`, `entities/<entity>/`.
4. Одинаковый код во втором месте → выносим сразу, в этом же коммите.
5. Проверить слой по зависимостям, а не «по смыслу».
6. До `npm run build` — нет `index.*`, кросс-импорта, тернарки и `&&` в JSX.

---

## 5. Документация

Каждый раздел < 400 строк. Читай по типу задачи:

| Задача | Читать |
|---|---|
| Любая | `AGENTS.md`, `docs/workflow.md` |
| Новый файл / слайс | `docs/architecture.md`, `docs/imports.md` |
| Компонент, вёрстка, форма | `docs/ui.md`, `docs/code-style.md` |
| Запросы, кэш, правила, время | `docs/data.md` |
| Mock API | `docs/mocks.md`, `docs/data.md` |
| Маршруты, тексты | `docs/routing.md` |

- [`docs/architecture.md`](./docs/architecture.md) — FSD, слои, сегменты, дерево `src/`
- [`docs/imports.md`](./docs/imports.md) — направление импортов, alias vs relative, порядок
- [`docs/code-style.md`](./docs/code-style.md) — naming, JSX без JS, useEffect, типы
- [`docs/ui.md`](./docs/ui.md) — токены, Tailwind, кит, формы, уведомления, доступность
- [`docs/data.md`](./docs/data.md) — axios, ошибки, TanStack Query, правила, часы, Zustand, nuqs
- [`docs/mocks.md`](./docs/mocks.md) — слой mock API на MSW
- [`docs/routing.md`](./docs/routing.md) — маршруты, тексты интерфейса
- [`docs/workflow.md`](./docs/workflow.md) — работа в `main`, коммиты, проверки

---

## 6. AI-специфичное

- **Не выдумывай в пробелах.** Правило не покрывает случай — спроси.
- **Не следуй устаревшему коду молча.** Расхождение кода и `docs/` — флагни.
- **«Скопировать соседний файл и поправить» — долг, а не переиспользование.**
- **Работа только в `main`, без feature-веток.** Правки правил (`AGENTS.md`, `docs/*.md`) — первым
  коммитом задачи, до кода, и только когда задача явно на это.
