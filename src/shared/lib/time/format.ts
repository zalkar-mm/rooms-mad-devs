import { tzOffset } from "@date-fns/tz";
import { format } from "date-fns";
import { ru } from "date-fns/locale/ru";

import { fromIsoDate } from "./iso-date";
import type { HhMm, IsoDate } from "./types";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** «Среда, 7 октября 2026» — период вида «День» (SPEC §6.2). */
export function formatDayTitle(date: IsoDate): string {
  return capitalize(format(fromIsoDate(date), "EEEE, d MMMM yyyy", { locale: ru }));
}

/** «Октябрь 2026» — период вида «Месяц» (SPEC §6.2). */
export function formatMonthTitle(date: IsoDate): string {
  return capitalize(format(fromIsoDate(date), "LLLL yyyy", { locale: ru }));
}

/** «Пн» — заголовок колонки месяца. */
export function formatWeekdayShort(date: IsoDate): string {
  return capitalize(format(fromIsoDate(date), "EEEEEE", { locale: ru }));
}

/** «Ср, 7 октября» — дата в панели (SPEC §6.3). */
export function formatShortDate(date: IsoDate): string {
  return capitalize(format(fromIsoDate(date), "EEEEEE, d MMMM", { locale: ru }));
}

/** «7 октября» — в вопросе удаления (SPEC §6.3). */
export function formatDayMonth(date: IsoDate): string {
  return format(fromIsoDate(date), "d MMMM", { locale: ru });
}

/** «среда 7 октября» — для чтения брони и ячейки читалкой (SPEC §12). */
export function formatSpokenDate(date: IsoDate): string {
  return format(fromIsoDate(date), "EEEE d MMMM", { locale: ru });
}

/** «Пн 5» — заголовок колонки недели (SPEC §6.2). */
export function formatColumnDay(date: IsoDate): string {
  return capitalize(format(fromIsoDate(date), "EEEEEE d", { locale: ru }));
}

/** «5–11 октября 2026», «28 сентября – 4 октября 2026», «29 декабря 2025 – 4 января 2026». */
export function formatWeekTitle(from: IsoDate, to: IsoDate): string {
  const start = fromIsoDate(from);
  const end = fromIsoDate(to);
  const tail = format(end, "d MMMM yyyy", { locale: ru });
  if (from.slice(0, 4) !== to.slice(0, 4)) return `${format(start, "d MMMM yyyy", { locale: ru })} – ${tail}`;
  if (from.slice(0, 7) !== to.slice(0, 7)) return `${format(start, "d MMMM", { locale: ru })} – ${tail}`;
  return `${format(start, "d")}–${tail}`;
}

/** «10:00–11:00». */
export function formatInterval(start: HhMm, end: HhMm): string {
  return `${start}–${end}`;
}

/** «UTC+6», «UTC+5:30», «UTC−3» — смещение пояса в момент `instant`. */
export function formatUtcOffset(timeZone: string, instant: number): string {
  const offset = tzOffset(timeZone, new Date(instant));
  const sign = offset < 0 ? "−" : "+";
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const tail = minutes === 0 ? "" : `:${String(minutes).padStart(2, "0")}`;
  return `UTC${sign}${String(hours)}${tail}`;
}
