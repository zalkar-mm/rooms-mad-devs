import { fromMinutes, toMinutes } from "@/shared/lib/time/minutes";
import type { HhMm } from "@/shared/lib/time/types";

import type { BookingRulesConfig } from "../model/booking-rules.types";

type DayGrid = Pick<BookingRulesConfig, "workdayStart" | "workdayEnd" | "slotMinutes">;

/** Начала слотов рабочего дня: 09:00…17:30 при шаге 30 (R9, D3, P2). */
export function slotStarts(config: DayGrid): HhMm[] {
  const starts: HhMm[] = [];
  for (
    let minute = toMinutes(config.workdayStart);
    minute < toMinutes(config.workdayEnd);
    minute += config.slotMinutes
  ) {
    starts.push(fromMinutes(minute));
  }
  return starts;
}

/** Допустимые окончания: 09:30…18:00 (P2, D8). */
export function slotEnds(config: DayGrid): HhMm[] {
  return slotStarts(config).map((start) => fromMinutes(toMinutes(start) + config.slotMinutes));
}
