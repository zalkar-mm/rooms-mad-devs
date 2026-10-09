import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfISOWeek,
  endOfMonth,
  format,
  getISODay,
  parseISO,
  startOfISOWeek,
  startOfMonth,
} from "date-fns";

import type { IsoDate, IsoWeekday } from "./types";

/** `Date` → `YYYY-MM-DD` по календарной дате объекта, без пересчёта пояса. */
export function toIsoDate(date: Date): IsoDate {
  return format(date, "yyyy-MM-dd");
}

/** `YYYY-MM-DD` → `Date` на полночь этой даты: для компонентов календаря, не для «сейчас». */
export function fromIsoDate(value: IsoDate): Date {
  return parseISO(value);
}

/** Календарная арифметика над строками контракта: пояс не участвует. */
export function addIsoDays(date: IsoDate, days: number): IsoDate {
  return toIsoDate(addDays(fromIsoDate(date), days));
}

/** `later − earlier` в календарных днях. */
export function diffIsoDays(later: IsoDate, earlier: IsoDate): number {
  return differenceInCalendarDays(fromIsoDate(later), fromIsoDate(earlier));
}

const ISO_WEEKDAYS: readonly IsoWeekday[] = [1, 2, 3, 4, 5, 6, 7];

/** День недели ISO; дата не по календарю (`2026-13-45`) — `null`. */
export function isoWeekday(date: IsoDate): IsoWeekday | null {
  const day = getISODay(fromIsoDate(date));
  return ISO_WEEKDAYS.find((weekday) => weekday === day) ?? null;
}

/** Понедельник недели, в которой лежит `date`. */
export function isoWeekStart(date: IsoDate): IsoDate {
  return toIsoDate(startOfISOWeek(fromIsoDate(date)));
}

/** Даты подряд с `from` включительно. */
export function isoDateRange(from: IsoDate, count: number): IsoDate[] {
  return Array.from({ length: count }, (_, index) => addIsoDays(from, index));
}

/** Сдвиг на месяцы: 31 октября − 1 месяц → 30 сентября. */
export function addIsoMonths(date: IsoDate, months: number): IsoDate {
  return toIsoDate(addMonths(fromIsoDate(date), months));
}

export function isoMonthStart(date: IsoDate): IsoDate {
  return toIsoDate(startOfMonth(fromIsoDate(date)));
}

export function isoMonthEnd(date: IsoDate): IsoDate {
  return toIsoDate(endOfMonth(fromIsoDate(date)));
}

/** Воскресенье недели, в которой лежит `date`. */
export function isoWeekEnd(date: IsoDate): IsoDate {
  return toIsoDate(endOfISOWeek(fromIsoDate(date)));
}
