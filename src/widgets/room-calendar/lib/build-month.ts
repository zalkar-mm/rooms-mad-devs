import { isViewableDate, isWorkingDay } from "@/entities/booking/lib/booking-rules";
import { bookingStatus } from "@/entities/booking/lib/booking-status";
import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import { TEXTS } from "@/shared/consts/texts";
import { formatSpokenDate } from "@/shared/lib/time/format";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";

import type { MonthDayLine, MonthDayState } from "./grid-view";

/** В ячейке — до трёх броней, дальше «ещё N» (D27). */
const LINES_PER_DAY = 3;

export type MonthCellView = {
  date: IsoDate;
  dayNumber: number;
  state: MonthDayState;
  lines: MonthDayLine[];
  moreText?: string;
  ariaLabel: string;
};

type CellQuery = { date: IsoDate; month: string; config: BookingRulesConfig; now: RulesNow };

function cellState({ date, month, config, now }: CellQuery): MonthDayState {
  // Вне просмотра броней нет и нажатие ничего не делает (T14 §3.4).
  if (!isViewableDate(date, config, now)) return "outOfHorizon";
  if (date === now.date) return "today";
  if (date.slice(0, 7) !== month) return "otherMonth";
  if (!isWorkingDay(date, config)) return "weekend";
  return "normal";
}

export type BuildMonthParams = {
  /** Даты сетки месяца: с понедельника первой недели по воскресенье последней. */
  dates: readonly IsoDate[];
  selectedDate: IsoDate;
  bookings: readonly Booking[];
  config: BookingRulesConfig;
  now: RulesNow;
  /** Подписи времени броней в поясе режима (D23). */
  display: TimeDisplay;
};

/** Ячейки месяца по датам сетки: брони по началу, прошедшие помечены (T14). Чистая функция. */
export function buildMonth({ dates, selectedDate, bookings, config, now, display }: BuildMonthParams): MonthCellView[] {
  const month = selectedDate.slice(0, 7);
  return dates.map((date) => {
    const state = cellState({ date, month, config, now });
    const dayBookings = state === "outOfHorizon" ? [] : bookings.filter((booking) => booking.date === date);
    const more = dayBookings.length - LINES_PER_DAY;
    return {
      date,
      dayNumber: Number(date.slice(8, 10)),
      state,
      lines: dayBookings.slice(0, LINES_PER_DAY).map((booking) => ({
        id: booking.id,
        time: display.time(date, booking.start),
        title: booking.title,
        past: bookingStatus(booking, now) === "past",
      })),
      moreText: more > 0 ? TEXTS.calendar.moreBookings(more) : undefined,
      ariaLabel: TEXTS.calendar.monthDaySpoken(formatSpokenDate(date), dayBookings.length),
    };
  });
}
