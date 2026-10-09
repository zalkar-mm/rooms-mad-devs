import js from "@eslint/js";
import pluginQuery from "@tanstack/eslint-plugin-query";
import prettier from "eslint-config-prettier";
import { createTypeScriptImportResolver } from "eslint-import-resolver-typescript";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/* -------------------------------------------------------------------------------------------------
 * no-restricted-syntax
 * flat-config не мержит опции правила: блок с дополнительными селекторами затирает список целиком,
 * поэтому наборы собираются из констант для каждой группы файлов.
 * ---------------------------------------------------------------------------------------------- */

const BASE_SYNTAX = [
  {
    selector: "TSEnumDeclaration",
    message: "enum запрещён. Используй `as const` карту.",
  },
  {
    selector: "JSXExpressionContainer > ConditionalExpression",
    message: "Тернарка в JSX запрещена. Ранний return, `<Gate when>` или карта состояний (docs/code-style.md §4).",
  },
  {
    selector: "JSXExpressionContainer > LogicalExpression[operator='&&']",
    message: "`&&` в JSX запрещён. Используй `<Gate when>` из `@/shared/ui/gate`.",
  },
  {
    selector: "ImportDeclaration[source.value=/\\/index(\\.(ts|tsx|js|jsx))?$/]",
    message: "Barrel-файлы и index.* запрещены. Импортируй файл напрямую.",
  },
  {
    selector: "TSTypeReference[typeName.name='any']",
    message: "Не используй `any`. Замени на `unknown` + сужение.",
  },
  {
    selector: "IfStatement[alternate.type='IfStatement'][alternate.alternate.type='IfStatement']",
    message:
      "Цепочка из 3+ веток if/else if запрещена: Record-карта, switch с assertNever или фабрика (docs/code-style.md §1).",
  },
  {
    selector:
      "JSXAttribute > JSXExpressionContainer > :matches(CallExpression, ObjectExpression, BinaryExpression, LogicalExpression)",
    message: "Вычисления в JSX-атрибутах запрещены: значение — именованной константой в теле (AGENTS §3.3).",
  },
  {
    selector: "TSTypeAliasDeclaration[id.name=/Props$/] > TSTypeLiteral[members.length>8]",
    message: "Больше 8 пропсов: сгруппируйте (`selection`, `actions`) или разбейте компонент (docs/code-style.md §9).",
  },
];

/** Правило выходного — только `isWorkingDay` (docs/data.md §6). */
const WEEKDAYS_SYNTAX = [
  {
    selector: "CallExpression[callee.property.name='includes'][callee.object.property.name='workingWeekdays']",
    message: "Проверка выходного — только `isWorkingDay` из `entities/booking/lib/booking-rules` (docs/data.md §6).",
  },
];

/** Медиазапросы — только в `shared/consts/breakpoints.ts`. */
const MEDIA_SYNTAX = [
  {
    selector: "Literal[value=/\\((min|max)-width:|\\(pointer:/]",
    message: "Медиазапрос — константой из `@/shared/consts/breakpoints`.",
  },
];

const DOMAIN_SYNTAX = [...WEEKDAYS_SYNTAX, ...MEDIA_SYNTAX];

/** «Сейчас» — только через часы (docs/data.md §7). */
const NOW_SYNTAX = [
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message: "«Сейчас» — только из часов: useNow() из entities/settings или shared/lib/time/clock.",
  },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: "«Сейчас» — только из часов: useNow() из entities/settings или shared/lib/time/clock.",
  },
];

/** Нативные контролы, у которых есть компонент кита. Внутри shared/ui нативные теги, наоборот, нужны. */
const NATIVE_CONTROL_SYNTAX = [
  {
    selector: "JSXOpeningElement[name.name='button']",
    message: "Нативная `<button>` запрещена. Возьми `Button` или `IconButton` из `@/shared/ui/*`.",
  },
  {
    selector: "JSXOpeningElement[name.name='select']",
    message: "Нативный `<select>` запрещён. Возьми `TimeSelect` из `@/shared/ui/time-select`.",
  },
  {
    selector: "JSXOpeningElement[name.name=/^(dialog|table|details|summary)$/]",
    message: "Тег не используется в проекте: окон поверх страницы нет (SPEC D12), таблиц и раскрывашек — тоже.",
  },
  {
    selector: "JSXAttribute[name.name='type'][value.value=/^(date|datetime-local|month|week)$/]",
    message: '`type="date"` запрещён. Возьми `DatePicker` из `@/shared/ui/date-picker`.',
  },
  {
    selector: "JSXAttribute[name.name='type'][value.value='time']",
    message: '`type="time"` запрещён. Возьми `TimeSelect` из `@/shared/ui/time-select`.',
  },
  {
    selector: "JSXAttribute[name.name='type'][value.value='checkbox']",
    message: '`type="checkbox"` запрещён. Возьми `Switch` из `@/shared/ui/switch`.',
  },
];

/* -------------------------------------------------------------------------------------------------
 * no-restricted-imports — пакеты и alias-границы (docs/imports.md §3)
 * ---------------------------------------------------------------------------------------------- */

const PKG = {
  axios: { name: "axios", message: "axios — только в shared/api и entities/*/api (docs/data.md §1)." },
  sonner: { name: "sonner", message: "Тосты — только через `notify` из `@/shared/lib/notify`." },
  radix: {
    group: ["radix-ui", "@radix-ui/*"],
    message: "Radix — только внутри кита shared/ui. Используй компонент из `@/shared/ui/*`.",
  },
  dayPicker: {
    group: ["react-day-picker", "react-day-picker/*"],
    message: "react-day-picker — только внутри кита. Используй `DatePicker` из `@/shared/ui/date-picker`.",
  },
  msw: { group: ["msw", "msw/*"], message: "msw — только в src/mocks (docs/mocks.md)." },
  mocks: { group: ["@/mocks", "@/mocks/*"], message: "src/mocks импортирует только app (docs/mocks.md §1)." },
};

/** `announce` зовут model-хуки, не разметка (docs/ui.md §7). Чтение региона — `live-region.tsx`. */
const ANNOUNCE_IN_UI = {
  group: ["@/shared/lib/announce"],
  importNames: ["announce"],
  message: "announce — только в model-хуке (docs/ui.md §7).",
};

const sameLayer = (layer) => ({
  group: [`@/${layer}/*`],
  message: `Alias на свой слой запрещён: между слайсами ${layer} импорт запрещён, внутри слайса — относительный путь.`,
});

/** `ui` — пакеты UI-движков (Radix, react-day-picker, sonner): разрешены только коду кита в shared/ui. */
const restrictedImports = ({ axios = false, sonner = false, ui = false, msw = false, groups = [] }) => [
  "error",
  {
    paths: [...(axios ? [] : [PKG.axios]), ...(sonner || ui ? [] : [PKG.sonner])],
    patterns: [...(msw ? [] : [PKG.msw]), ...(ui ? [] : [PKG.radix, PKG.dayPicker]), ...groups],
  },
];

const layerImports = (layer, options = {}) =>
  restrictedImports({ ...options, groups: [sameLayer(layer), PKG.mocks, ...(options.groups ?? [])] });

/* -------------------------------------------------------------------------------------------------
 * FSD-зоны — import-x/no-restricted-paths (ловит и относительные пути)
 * ---------------------------------------------------------------------------------------------- */

const FSD_ZONES = [
  {
    target: "./src/shared",
    from: ["./src/app", "./src/pages", "./src/widgets", "./src/features", "./src/entities", "./src/mocks"],
    message: "shared не импортирует вышестоящие слои и mocks",
  },
  {
    target: "./src/entities",
    from: ["./src/app", "./src/pages", "./src/widgets", "./src/features", "./src/mocks"],
    message: "entities импортирует только shared",
  },
  {
    target: "./src/features",
    from: ["./src/app", "./src/pages", "./src/widgets", "./src/mocks"],
    message: "features импортирует только entities и shared",
  },
  {
    target: "./src/widgets",
    from: ["./src/app", "./src/pages", "./src/mocks"],
    message: "widgets импортирует только features, entities, shared",
  },
  {
    target: "./src/pages",
    from: ["./src/app", "./src/mocks"],
    message: "pages не импортирует app и mocks",
  },
  {
    target: "./src/mocks",
    from: ["./src/app", "./src/pages", "./src/widgets", "./src/features"],
    message: "mocks импортирует только entities/*/model, entities/*/lib и shared",
  },
];

export default tseslint.config(
  { ignores: ["dist", "dev-dist", "node_modules", "public"] },

  js.configs.recommended,

  ...tseslint.configs.strictTypeChecked.map((c) => ({ ...c, files: ["**/*.{ts,tsx}"] })),
  ...tseslint.configs.stylisticTypeChecked.map((c) => ({ ...c, files: ["**/*.{ts,tsx}"] })),

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
      "import-x/extensions": [".ts", ".tsx"],
      "import-x/resolver-next": [createTypeScriptImportResolver({ alwaysTryTypes: true, project: "./tsconfig.app.json" })],
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      "simple-import-sort": simpleImportSort,
      "import-x": importX,
      "@tanstack/query": pluginQuery,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/display-name": "off",
      // Дублирует наш запрет `&&` и тернарок в JSX (no-restricted-syntax).
      "react/jsx-no-leaked-render": "off",

      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      ...jsxA11y.configs.recommended.rules,

      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^node:", "^react$", "^react\\u0000$", "^react-dom"],
            ["^@?\\w"],
            ["^@/app(/.*|$)"],
            ["^@/pages(/.*|$)"],
            ["^@/widgets(/.*|$)"],
            ["^@/features(/.*|$)"],
            ["^@/entities(/.*|$)"],
            ["^@/shared(/.*|$)"],
            ["^@/mocks(/.*|$)"],
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            ["^.+\\.css$", "^\\u0000"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",

      "import-x/no-restricted-paths": ["error", { zones: FSD_ZONES }],
      "import-x/no-cycle": ["error", { maxDepth: 3 }],
      "import-x/no-self-import": "error",
      "import-x/no-duplicates": "error",

      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],

      ...pluginQuery.configs.recommended.rules,

      "@typescript-eslint/switch-exhaustiveness-check": "error",

      // Ветвления (docs/code-style.md §1).
      "no-else-return": ["error", { allowElseIf: false }],
      "no-lonely-if": "error",
      "no-nested-ternary": "error",
      "max-depth": ["error", 3],
      complexity: ["error", 12],
      "max-params": ["error", 3],
      "react/no-array-index-key": "error",
      "@typescript-eslint/no-unsafe-type-assertion": "error",
      "import-x/no-unused-modules": [
        "error",
        {
          unusedExports: true,
          ignoreUnusedTypeExports: true,
          src: ["src/**/*.{ts,tsx}"],
          // Страницы и служебная панель грузятся через import(): правило их не видит. notify — точка вызова
          // тостов из docs/ui.md §7: Toaster смонтирован, вызовов пока нет.
          ignoreExports: [
            "src/app/main.tsx",
            "src/pages/**/*.page.tsx",
            "src/mocks/ui/mock-panel.tsx",
            "src/shared/lib/notify.ts",
            "**/*.d.ts",
          ],
        },
      ],

      "no-console": ["error", { allow: ["error"] }],
      "no-restricted-syntax": ["error", ...BASE_SYNTAX],
      "no-restricted-globals": [
        "error",
        { name: "confirm", message: "Подтверждение — в боковой панели (SPEC D11, D12), не window.confirm." },
        { name: "alert", message: "Сообщения — Notice в панели, announce и notify, не window.alert." },
        { name: "prompt", message: "Ввод — полями кита в панели, не window.prompt." },
      ],
    },
  },

  /* ---- Синтаксис по группам файлов ---- */
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...NOW_SYNTAX, ...DOMAIN_SYNTAX] },
  },
  {
    files: ["src/{app,pages,widgets,features,entities}/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...NOW_SYNTAX, ...DOMAIN_SYNTAX, ...NATIVE_CONTROL_SYNTAX],
    },
  },
  {
    // Сервер сам является источником «сейчас» (serverNow).
    files: ["src/mocks/**/*.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...DOMAIN_SYNTAX, ...NATIVE_CONTROL_SYNTAX] },
  },
  {
    // Единственное место приложения, где читается системное время (docs/data.md §7).
    files: ["src/shared/lib/time/clock.ts"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...DOMAIN_SYNTAX] },
  },
  {
    // Единственное место проверки выходного.
    files: ["src/entities/booking/lib/booking-rules.ts"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...NOW_SYNTAX, ...MEDIA_SYNTAX] },
  },
  {
    // Единственное место строк медиазапросов.
    files: ["src/shared/consts/breakpoints.ts"],
    rules: { "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...NOW_SYNTAX, ...WEEKDAYS_SYNTAX] },
  },

  /* ---- Импорты по слоям (порядок важен: более узкий блок ниже) ---- */
  { files: ["src/app/**/*.{ts,tsx}"], rules: { "no-restricted-imports": restrictedImports({}) } },
  { files: ["src/pages/**/*.{ts,tsx}"], rules: { "no-restricted-imports": layerImports("pages") } },
  { files: ["src/widgets/**/*.{ts,tsx}"], rules: { "no-restricted-imports": layerImports("widgets") } },
  { files: ["src/features/**/*.{ts,tsx}"], rules: { "no-restricted-imports": layerImports("features") } },
  { files: ["src/entities/**/*.{ts,tsx}"], rules: { "no-restricted-imports": layerImports("entities") } },
  {
    files: ["src/entities/*/api/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": layerImports("entities", { axios: true }) },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        groups: [{ group: ["@/*"], message: "Внутри shared — только относительные импорты." }],
      }),
    },
  },
  {
    files: ["src/shared/api/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        axios: true,
        groups: [{ group: ["@/*"], message: "Внутри shared — только относительные импорты." }],
      }),
    },
  },
  {
    files: ["src/shared/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        ui: true,
        groups: [{ group: ["@/*"], message: "Внутри shared — только относительные импорты." }],
      }),
    },
  },
  {
    files: ["src/shared/lib/notify.ts"],
    rules: {
      "no-restricted-imports": restrictedImports({
        sonner: true,
        groups: [{ group: ["@/*"], message: "Внутри shared — только относительные импорты." }],
      }),
    },
  },
  {
    files: ["src/mocks/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        msw: true,
        groups: [
          {
            group: ["@/app/*", "@/pages/*", "@/widgets/*", "@/features/*", "@/entities/*/api/*", "@/entities/*/ui/*"],
            message: "mocks импортирует только entities/*/model, entities/*/lib и shared (docs/mocks.md §1).",
          },
        ],
      }),
    },
  },

  /* ---- announce — только в model (docs/ui.md §7) ---- */
  {
    files: ["src/widgets/*/ui/**/*.tsx"],
    rules: { "no-restricted-imports": layerImports("widgets", { groups: [ANNOUNCE_IN_UI] }) },
  },
  {
    files: ["src/features/*/ui/**/*.tsx"],
    rules: { "no-restricted-imports": layerImports("features", { groups: [ANNOUNCE_IN_UI] }) },
  },
  {
    files: ["src/entities/*/ui/**/*.tsx"],
    rules: { "no-restricted-imports": layerImports("entities", { groups: [ANNOUNCE_IN_UI] }) },
  },
  {
    files: ["src/shared/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrictedImports({
        ui: true,
        groups: [
          { group: ["@/*"], message: "Внутри shared — только относительные импорты." },
          { ...ANNOUNCE_IN_UI, group: ["../lib/announce"] },
        ],
      }),
    },
  },

  /* ---- Длина функций (docs/code-style.md §9) ---- */
  {
    files: ["src/**/*.ts"],
    rules: { "max-lines-per-function": ["error", { max: 40, skipBlankLines: true, skipComments: true }] },
  },
  {
    files: ["src/**/*.tsx"],
    rules: { "max-lines-per-function": ["error", { max: 80, skipBlankLines: true, skipComments: true }] },
  },

  /* ---- Исключения ---- */
  {
    files: ["src/app/router.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["**/*.d.ts"],
    rules: { "@typescript-eslint/consistent-type-definitions": "off" },
  },
  {
    files: ["vite.config.ts"],
    languageOptions: { globals: { ...globals.node } },
    rules: { "no-console": "off", "import-x/no-restricted-paths": "off" },
  },
  {
    files: ["eslint.config.js"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: { globals: { ...globals.node } },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "no-console": "off",
      "import-x/no-restricted-paths": "off",
    },
  },

  // Prettier — последним: отключает конфликтующие правила форматирования.
  prettier,
);
