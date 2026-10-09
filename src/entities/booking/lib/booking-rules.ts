import { ApiErrorCode } from "@/shared/api/api-error";
import { diffIsoDays, isoWeekday } from "@/shared/lib/time/iso-date";
import { ceilToStep, fromMinutes, toMinutes } from "@/shared/lib/time/minutes";
import { HH_MM_PATTERN, type HhMm, ISO_DATE_PATTERN, type IsoDate } from "@/shared/lib/time/types";

import type { Booking } from "../model/booking.types";
import type { BookingField, BookingRuleError, BookingRulesConfig, RulesNow } from "../model/booking-rules.types";

export type BookingCandidate = Pick<Booking, "roomId" | "date" | "start" | "end" | "title">;

export type ValidateContext = {
  config: BookingRulesConfig;
  now: RulesNow;
  /** Брони той же даты или шире; фильтр по комнате и дате — внутри (P8). */
  bookings: readonly Booking[];
  /** При правке бронь не сравнивается сама с собой (R7, P9). */
  editingId?: string;
};

/** Время на сетке шага: минуты кратны `slotMinutes` (P1). Строка не `HH:mm` — тоже не на сетке. */
function isOnGrid(time: string, config: Pick<BookingRulesConfig, "slotMinutes">): boolean {
  return HH_MM_PATTERN.test(time) && toMinutes(time) % config.slotMinutes === 0;
}

/** Пересечение полуинтервалов `[start, end)`: касание не пересечение (R5). */
export function overlaps(a: Pick<Booking, "start" | "end">, b: Pick<Booking, "start" | "end">): boolean {
  return toMinutes(a.start) < toMinutes(b.end) && toMinutes(b.start) < toMinutes(a.end);
}

/** Последнее допустимое начало дня: 17:30 при конце 18:00 и минимуме 30 минут (P2, D8). */
function lastStart(config: BookingRulesConfig): HhMm {
  return fromMinutes(toMinutes(config.workdayEnd) - config.minDurationMinutes);
}

/**
 * Самое раннее начало, доступное на `date` по времени (P3): прошедшая дата — `null`, сегодня — ближайшая
 * граница слота не раньше «сейчас», но не позже последнего начала, будущая дата — начало рабочего дня.
 */
export function earliestStart(date: IsoDate, config: BookingRulesConfig, now: RulesNow): HhMm | null {
  const days = diffIsoDays(date, now.date);
  if (days < 0) return null;
  if (days > 0) return config.workdayStart;
  const earliest = Math.max(ceilToStep(toMinutes(now.time), config.slotMinutes), toMinutes(config.workdayStart));
  if (earliest > toMinutes(lastStart(config))) return null;
  return fromMinutes(earliest);
}

/** Рабочий день (P5): будний по `workingWeekdays` настроек. Единственная проверка выходного в проекте. */
export function isWorkingDay(date: IsoDate, config: Pick<BookingRulesConfig, "workingWeekdays">): boolean {
  const weekday = isoWeekday(date);
  return weekday !== null && config.workingWeekdays.includes(weekday);
}

/** Дата открыта для брони по календарю: будний день (P5) и в горизонте сегодня…сегодня + N (P4). */
function isBookableDate(date: IsoDate, config: BookingRulesConfig, now: RulesNow): boolean {
  const days = diffIsoDays(date, now.date);
  return days >= 0 && days <= config.bookingHorizonDays && isWorkingDay(date, config);
}

/** Дата в периоде просмотра: сегодня − `historyDays` … сегодня + `bookingHorizonDays` (P4, D5). */
export function isViewableDate(date: IsoDate, config: BookingRulesConfig, now: RulesNow): boolean {
  if (!ISO_DATE_PATTERN.test(date)) return false;
  const days = diffIsoDays(date, now.date);
  return days >= -config.historyDays && days <= config.bookingHorizonDays;
}

export type SlotAvailability = "available" | "past" | "weekend" | "outOfHorizon";

/** Слот на дате: правила по календарю и «сейчас». */
export type SlotQuery = {
  date: IsoDate;
  start: HhMm;
  config: BookingRulesConfig;
  now: RulesNow;
};

/**
 * Доступность слота для новой брони по календарю и времени (SPEC §6.2): за горизонтом (P4), выходной
 * (P5), прошедший (R6, P3). Занятость бронями проверяет вызывающий.
 */
export function slotAvailability({ date, start, config, now }: SlotQuery): SlotAvailability {
  // За горизонтом — раньше выходного: суббота за горизонтом показывается «Вне горизонта» (T04 §4.7).
  if (diffIsoDays(date, now.date) > config.bookingHorizonDays) return "outOfHorizon";
  if (!isWorkingDay(date, config)) return "weekend";
  const earliest = earliestStart(date, config, now);
  if (earliest === null || toMinutes(start) < toMinutes(earliest)) return "past";
  return "available";
}

/** Название (P6): шаг 3 порядка T02 §4.5. */
export function validateTitle(
  title: string,
  config: Pick<BookingRulesConfig, "titleMaxLength">,
): BookingRuleError | null {
  const trimmed = title.trim();
  if (trimmed.length === 0) return { code: ApiErrorCode.TitleRequired, field: "title" };
  if (trimmed.length > config.titleMaxLength) return { code: ApiErrorCode.TitleTooLong, field: "title" };
  return null;
}

/** Что знают проверки слота: кандидат, контекст и минуты, посчитанные один раз. */
type SlotFacts = ValidateContext & {
  candidate: Omit<BookingCandidate, "title">;
  startMin: number;
  endMin: number;
  dayStart: number;
  dayEnd: number;
  earliest: HhMm | null;
};

type SlotCheck = {
  code: ApiErrorCode;
  field?: BookingField;
  /** Правило нарушено. Проверки идут по порядку: следующая выполняется, только если прошли предыдущие. */
  fails: (slot: SlotFacts) => boolean;
  /** Ближайшее доступное начало для текста `PAST_TIME`. */
  detail?: (slot: SlotFacts) => Pick<BookingRuleError, "earliestStart">;
};

const hasConflict = ({ candidate, bookings, editingId }: SlotFacts) =>
  bookings.some(
    (booking) =>
      booking.id !== editingId &&
      booking.roomId === candidate.roomId &&
      booking.date === candidate.date &&
      overlaps(booking, candidate),
  );

/** Шаги 4–11 T02 §4.5 в их порядке: первая нарушенная проверка даёт ответ. */
const SLOT_CHECKS: readonly SlotCheck[] = [
  { code: ApiErrorCode.OffGrid, field: "start", fails: (s) => !isOnGrid(s.candidate.start, s.config) },
  { code: ApiErrorCode.OffGrid, field: "end", fails: (s) => !isOnGrid(s.candidate.end, s.config) },
  {
    code: ApiErrorCode.OutsideWorkingHours,
    field: "start",
    fails: (s) => s.startMin < s.dayStart || s.startMin >= s.dayEnd,
  },
  { code: ApiErrorCode.OutsideWorkingHours, field: "end", fails: (s) => s.endMin <= s.dayStart || s.endMin > s.dayEnd },
  { code: ApiErrorCode.InvalidRange, field: "end", fails: (s) => s.startMin >= s.endMin },
  { code: ApiErrorCode.TooShort, field: "end", fails: (s) => s.endMin - s.startMin < s.config.minDurationMinutes },
  { code: ApiErrorCode.TooLong, field: "end", fails: (s) => s.endMin - s.startMin > s.config.maxDurationMinutes },
  // Дата не по формату контракта не попадает ни в один день горизонта.
  { code: ApiErrorCode.OutOfHorizon, field: "date", fails: (s) => !ISO_DATE_PATTERN.test(s.candidate.date) },
  {
    code: ApiErrorCode.Weekend,
    field: "date",
    fails: (s) => !isWorkingDay(s.candidate.date, s.config),
  },
  {
    code: ApiErrorCode.OutOfHorizon,
    field: "date",
    fails: (s) => diffIsoDays(s.candidate.date, s.now.date) > s.config.bookingHorizonDays,
  },
  {
    code: ApiErrorCode.PastTime,
    field: "start",
    fails: (s) => s.earliest === null || s.startMin < toMinutes(s.earliest),
    // Прошедшая дата или закрытый день — без ближайшего начала: его нет.
    detail: (s) => (s.earliest === null ? {} : { earliestStart: s.earliest }),
  },
  { code: ApiErrorCode.Conflict, fails: hasConflict },
];

/**
 * Время и дата (шаги 4–11 T02 §4.5): сетка, рабочий день, диапазон, длительность, выходной, горизонт,
 * прошлое, пересечение. Форма показывает это сразу, не дожидаясь названия.
 */
export function validateSlot(
  candidate: Omit<BookingCandidate, "title">,
  context: ValidateContext,
): BookingRuleError | null {
  const { config, now } = context;
  const facts: SlotFacts = {
    ...context,
    candidate,
    startMin: toMinutes(candidate.start),
    endMin: toMinutes(candidate.end),
    dayStart: toMinutes(config.workdayStart),
    dayEnd: toMinutes(config.workdayEnd),
    earliest: earliestStart(candidate.date, config, now),
  };
  const failed = SLOT_CHECKS.find((check) => check.fails(facts));
  if (!failed) return null;
  const field = failed.field === undefined ? {} : { field: failed.field };
  return { code: failed.code, ...field, ...failed.detail?.(facts) };
}

/**
 * Проверка брони в порядке T02 §4.5 (шаги 3–11); первая нарушенная даёт ответ. Существование брони и
 * комнаты и блокировку (P7) проверяет вызывающий. Используют форма, сетка и mock-сервер.
 */
export function validateBooking(candidate: BookingCandidate, context: ValidateContext): BookingRuleError | null {
  return validateTitle(candidate.title, context.config) ?? validateSlot(candidate, context);
}

export type FreeSlotQuery = {
  date: IsoDate;
  roomId: string;
  config: BookingRulesConfig;
  now: RulesNow;
  bookings: readonly Booking[];
};

/**
 * Ближайший свободный слот длиной `slotMinutes` на `date` (D34): не раньше P3, без пересечений (R5).
 * Дата закрыта для брони или свободного слота нет — `null`.
 */
export function firstFreeSlot({
  date,
  roomId,
  config,
  now,
  bookings,
}: FreeSlotQuery): { start: HhMm; end: HhMm } | null {
  if (!isBookableDate(date, config, now)) return null;
  const earliest = earliestStart(date, config, now);
  if (earliest === null) return null;
  const dayBookings = bookings.filter((booking) => booking.roomId === roomId && booking.date === date);
  for (let minute = toMinutes(earliest); minute <= toMinutes(lastStart(config)); minute += config.slotMinutes) {
    const slot = { start: fromMinutes(minute), end: fromMinutes(minute + config.slotMinutes) };
    if (!dayBookings.some((booking) => overlaps(booking, slot))) return slot;
  }
  return null;
}
