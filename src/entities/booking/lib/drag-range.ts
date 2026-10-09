import { fromMinutes, toMinutes } from "@/shared/lib/time/minutes";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";

import type { Booking } from "../model/booking.types";
import type { BookingRulesConfig, RulesNow } from "../model/booking-rules.types";

import { earliestStart } from "./booking-rules";

export type DragRangeParams = {
  date: IsoDate;
  /** Слот, с которого начали протягивание; остаётся внутри интервала (T07, открытый вопрос 1). */
  anchor: HhMm;
  /** Начало слота под указателем; другой день недели — только его время (T07 §4.2г). */
  pointer: HhMm;
  config: BookingRulesConfig;
  now: RulesNow;
  /** Брони комнаты; фильтр по дате — внутри. */
  bookings: readonly Booking[];
};

export type DragRange = {
  start: HhMm;
  end: HhMm;
  /** Интервал упёрся в максимум длительности: подпись «Не больше 2 часов» (R4, D26). */
  atLimit: boolean;
};

/**
 * Интервал протягивания (T07): шаг слота, 30–120 минут, без захода на чужую бронь (касание можно), в
 * пределах рабочего дня и не в прошлом. Вниз растёт окончание, вверх — начало.
 */
export function dragRange({ date, anchor, pointer, config, now, bookings }: DragRangeParams): DragRange {
  const step = config.slotMinutes;
  const anchorStart = toMinutes(anchor);
  const anchorEnd = anchorStart + step;
  const pointerStart = toMinutes(pointer);
  const dayBookings = bookings.filter((booking) => booking.date === date);

  if (pointerStart >= anchorStart) {
    const wanted = pointerStart + step;
    const maxEnd = anchorStart + config.maxDurationMinutes;
    const nextStarts = dayBookings.map((booking) => toMinutes(booking.start)).filter((start) => start >= anchorEnd);
    const cap = Math.min(maxEnd, toMinutes(config.workdayEnd), ...nextStarts);
    const end = Math.max(anchorEnd, Math.min(wanted, cap));
    return { start: anchor, end: fromMinutes(end), atLimit: wanted > maxEnd && cap === maxEnd };
  }

  const minStart = anchorEnd - config.maxDurationMinutes;
  const earliest = earliestStart(date, config, now);
  const previousEnds = dayBookings.map((booking) => toMinutes(booking.end)).filter((end) => end <= anchorStart);
  const floor = Math.max(
    minStart,
    toMinutes(config.workdayStart),
    earliest === null ? anchorStart : toMinutes(earliest),
    ...previousEnds,
  );
  const start = Math.min(anchorStart, Math.max(pointerStart, floor));
  return {
    start: fromMinutes(start),
    end: fromMinutes(anchorEnd),
    atLimit: pointerStart < minStart && floor === minStart,
  };
}
