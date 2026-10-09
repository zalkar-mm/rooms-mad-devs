import type { ApiErrorCode } from "@/shared/api/api-error";
import type { HhMm, IsoDate, IsoWeekday } from "@/shared/lib/time/types";

/**
 * Подмножество настроек, нужное правилам (docs/architecture.md §5): `settings → config` сшивает фича
 * или mock-сервер, `entities/booking` не импортирует `entities/settings`.
 */
export type BookingRulesConfig = {
  workdayStart: HhMm;
  workdayEnd: HhMm;
  slotMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  bookingHorizonDays: number;
  /** Просмотр назад от сегодня (P4). */
  historyDays: number;
  workingWeekdays: IsoWeekday[];
  titleMaxLength: number;
};

/** «Сейчас» во времени комнаты (D22). Правила не читают часы сами. */
export type RulesNow = {
  date: IsoDate;
  time: HhMm;
};

export type BookingField = "title" | "date" | "start" | "end";

/** Первое нарушенное правило. `earliestStart` — для текста `PAST_TIME` «…не раньше {HH:mm}». */
export type BookingRuleError = {
  code: ApiErrorCode;
  field?: BookingField;
  earliestStart?: HhMm;
};
