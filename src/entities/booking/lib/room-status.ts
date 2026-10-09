import { addIsoDays, isoWeekday } from "@/shared/lib/time/iso-date";
import { toMinutes } from "@/shared/lib/time/minutes";
import type { HhMm, IsoWeekday } from "@/shared/lib/time/types";

import type { Booking } from "../model/booking.types";
import type { BookingRulesConfig, RulesNow } from "../model/booking-rules.types";

import { isWorkingDay } from "./booking-rules";

/** Строка «Сейчас» карточки комнаты (D29). */
export type RoomNow =
  | { kind: "busy"; until: HhMm; title: string }
  | { kind: "freeUntil"; until: HhMm }
  | { kind: "freeAllDay" }
  | { kind: "offHours" };

/** Когда комната откроется: на следующий рабочий день в начало дня (SPEC §6.1). */
export type RoomOpens = { day: "tomorrow" } | { day: "weekday"; weekday: IsoWeekday };

export type RoomStatus = {
  now: RoomNow;
  /** Брони с началом в `(сейчас, сейчас + 60 мин]`, до трёх, по началу (D29). */
  nextHour: Booking[];
  /** Только после конца рабочего дня и в выходные (T13 §3.6); утром будня — нет (T13, открытый вопрос 3). */
  opens?: RoomOpens;
};

const NEXT_HOUR_MINUTES = 60;
const NEXT_HOUR_LIMIT = 3;

/** Состояние комнаты на «сейчас» по сегодняшним броням этой комнаты (T13, D29). Чистая функция. */
export function roomStatus(todayBookings: readonly Booking[], config: BookingRulesConfig, now: RulesNow): RoomStatus {
  const nowMin = toMinutes(now.time);
  const sorted = todayBookings
    .filter((booking) => booking.date === now.date)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const nextHour = sorted
    .filter((booking) => toMinutes(booking.start) > nowMin && toMinutes(booking.start) <= nowMin + NEXT_HOUR_MINUTES)
    .slice(0, NEXT_HOUR_LIMIT);

  const isWorkday = isWorkingDay(now.date, config);
  const beforeOpen = nowMin < toMinutes(config.workdayStart);
  const afterClose = nowMin >= toMinutes(config.workdayEnd);
  if (!isWorkday || beforeOpen || afterClose) {
    return {
      now: { kind: "offHours" },
      nextHour,
      opens: isWorkday && beforeOpen ? undefined : nextOpening(config, now),
    };
  }

  const current = sorted.find((booking) => toMinutes(booking.start) <= nowMin && nowMin < toMinutes(booking.end));
  if (current) return { now: { kind: "busy", until: current.end, title: current.title }, nextHour };
  const upcoming = sorted.find((booking) => toMinutes(booking.start) > nowMin);
  if (upcoming) return { now: { kind: "freeUntil", until: upcoming.start }, nextHour };
  return { now: { kind: "freeAllDay" }, nextHour };
}

/** «Завтра» — только из рабочего дня: в воскресенье по SPEC §6.1 «в понедельник», а не «завтра» (T13 §3.6). */
function nextOpening(config: BookingRulesConfig, now: RulesNow): RoomOpens | undefined {
  const todayIsWorkday = isWorkingDay(now.date, config);
  for (let offset = 1; offset <= 7; offset += 1) {
    const date = addIsoDays(now.date, offset);
    const weekday = isoWeekday(date);
    if (weekday === null || !isWorkingDay(date, config)) continue;
    return offset === 1 && todayIsWorkday ? { day: "tomorrow" } : { day: "weekday", weekday };
  }
  return undefined;
}
