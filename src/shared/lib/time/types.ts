/** Дата контракта `YYYY-MM-DD` (docs/code-style.md §8). */
export type IsoDate = string;

/** Время контракта `HH:mm`. */
export type HhMm = string;

/** Момент времени в ISO 8601 с поясом: `2026-10-07T08:10:00.000Z`. */
export type IsoDateTime = string;

/** Номер дня недели ISO: 1 — понедельник, 7 — воскресенье. */
export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const HH_MM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
