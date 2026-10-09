import type { HhMm, IsoDateTime, IsoWeekday } from "@/shared/lib/time/types";

/** Настройки системы `GET /api/settings` (SPEC §4, D35). В интерфейсе не зашиваются. */
export type Settings = {
  /** Пояс комнаты, IANA: `Asia/Bishkek`. */
  timezone: string;
  workdayStart: HhMm;
  workdayEnd: HhMm;
  slotMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  bookingHorizonDays: number;
  historyDays: number;
  workingWeekdays: IsoWeekday[];
  titleMaxLength: number;
  titleSuggestions: string[];
  /** Время сервера на момент ответа — единственный источник «сейчас» (D22). */
  serverNow: IsoDateTime;
};
