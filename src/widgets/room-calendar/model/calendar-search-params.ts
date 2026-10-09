import { parseAsString, parseAsStringLiteral } from "nuqs";

import { CALENDAR_VIEWS } from "../lib/grid-view";

/** Параметры адреса календаря (docs/data.md §9). Одно место для всех парсеров. */
export const calendarSearchParams = {
  /** `YYYY-MM-DD`; нет, не по формату или вне просмотра — сегодня (T03 §6). */
  date: parseAsString,
  /** Нет в адресе — вид по ширине окна при открытии (D28). */
  view: parseAsStringLiteral(CALENDAR_VIEWS),
  /** `id` брони, открытой в панели. */
  booking: parseAsString,
};
