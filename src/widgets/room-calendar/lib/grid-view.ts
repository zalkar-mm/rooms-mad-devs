/** Типы и карты view-модели сетки: их строит `lib`, показывает `ui` (зависимость только `ui → lib`). */

/** Виды календаря в адресе (D1). */
export const CALENDAR_VIEWS = ["day", "week", "month"] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

/** `busy` — под бронью: блок брони лежит поверх и сам получает фокус и чтение. */
export type SlotCellState = "available" | "past" | "weekend" | "outOfHorizon" | "busy";

export type DayHeaderState = "normal" | "today" | "weekend" | "outOfHorizon";

export type MonthDayState = "normal" | "today" | "weekend" | "otherMonth" | "outOfHorizon";

/** Строка брони в ячейке месяца: «10:00 Созвон». */
export type MonthDayLine = { id: string; time: string; title: string; past: boolean };

/** `touch` — слот выше на сенсорных экранах (D36). */
export type SlotDensity = "default" | "touch";

/** Высота слота в px: по ней считаются позиции броней и линии «сейчас». */
export const SLOT_PX: Record<SlotDensity, number> = { default: 32, touch: 48 };

/** Высота строки сетки — одна для ячейки, колонки времени и заготовки. */
export const ROW_HEIGHT_CN: Record<SlotDensity, string> = { default: "h-8", touch: "h-12" };
