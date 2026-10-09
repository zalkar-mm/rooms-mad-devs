import { useState } from "react";

import { useQueryState } from "nuqs";

import { isViewableDate } from "@/entities/booking/lib/booking-rules";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import { MEDIA } from "@/shared/consts/breakpoints";
import { formatDayTitle, formatMonthTitle, formatWeekTitle } from "@/shared/lib/time/format";
import {
  addIsoDays,
  addIsoMonths,
  diffIsoDays,
  isoDateRange,
  isoMonthEnd,
  isoMonthStart,
  isoWeekEnd,
  isoWeekStart,
} from "@/shared/lib/time/iso-date";
import type { IsoDate } from "@/shared/lib/time/types";

import type { CalendarView } from "../lib/grid-view";

import { calendarSearchParams } from "./calendar-search-params";

type PeriodShape = {
  /** Первая и последняя дата сетки периода. */
  bounds: (date: IsoDate) => { start: IsoDate; end: IsoDate };
  /** Опорная дата соседнего периода: «Назад» и «Вперёд» (SPEC §6.2). */
  step: (date: IsoDate, direction: -1 | 1) => IsoDate;
  /** Даты, по которым видно, есть ли соседний период в просмотре. */
  edge: (date: IsoDate, direction: -1 | 1) => IsoDate;
  title: (date: IsoDate, start: IsoDate, end: IsoDate) => string;
};

/** Месяц — полные недели с понедельника, захватывающие месяц (SPEC §6.2, T14 §3.2). */
const PERIOD: Record<CalendarView, PeriodShape> = {
  day: {
    bounds: (date) => ({ start: date, end: date }),
    step: (date, direction) => addIsoDays(date, direction),
    edge: (date, direction) => addIsoDays(date, direction),
    title: (date) => formatDayTitle(date),
  },
  week: {
    bounds: (date) => ({ start: isoWeekStart(date), end: isoWeekEnd(date) }),
    step: (date, direction) => addIsoDays(date, 7 * direction),
    edge: (date, direction) => (direction < 0 ? addIsoDays(isoWeekStart(date), -1) : addIsoDays(isoWeekEnd(date), 1)),
    title: (_date, start, end) => formatWeekTitle(start, end),
  },
  month: {
    bounds: (date) => ({ start: isoWeekStart(isoMonthStart(date)), end: isoWeekEnd(isoMonthEnd(date)) }),
    step: (date, direction) => addIsoMonths(date, direction),
    edge: (date, direction) => (direction < 0 ? addIsoDays(isoMonthStart(date), -1) : addIsoDays(isoMonthEnd(date), 1)),
    title: (date) => formatMonthTitle(date),
  },
};

const clamp = (date: IsoDate, min: IsoDate, max: IsoDate) => {
  if (date < min) return min;
  if (date > max) return max;
  return date;
};

type LimitsParams = {
  shape: PeriodShape;
  date: IsoDate;
  start: IsoDate;
  end: IsoDate;
  firstDate: IsoDate;
  lastDate: IsoDate;
};

/** Границы запроса и листания: только даты внутри просмотра (T04 §9). */
function periodLimits({ shape, date, start, end, firstDate, lastDate }: LimitsParams) {
  return {
    query: { from: clamp(start, firstDate, lastDate), to: clamp(end, firstDate, lastDate) },
    canPrev: shape.edge(date, -1) >= firstDate,
    canNext: shape.edge(date, 1) <= lastDate,
  };
}

/** Вид и дата из адреса: дата не по формату или вне просмотра — сегодня (T03 §6). */
function useAddressPeriod(config: BookingRulesConfig, now: RulesNow) {
  const [rawDate, setRawDate] = useQueryState("date", calendarSearchParams.date);
  const [rawView, setRawView] = useQueryState("view", calendarSearchParams.view);
  // Вид по умолчанию берётся по ширине один раз, при открытии: смена ширины его не меняет (T04 §8).
  const [defaultView] = useState<CalendarView>(() => (window.matchMedia(MEDIA.md).matches ? "week" : "day"));
  const isAddressDateValid = rawDate !== null && isViewableDate(rawDate, config, now);
  const firstDate = addIsoDays(now.date, -config.historyDays);
  const lastDate = addIsoDays(now.date, config.bookingHorizonDays);

  return {
    view: rawView ?? defaultView,
    date: isAddressDateValid ? rawDate : now.date,
    firstDate,
    lastDate,
    setView: (next: CalendarView) => void setRawView(next),
    setDate: (next: IsoDate) => {
      const clamped = clamp(next, firstDate, lastDate);
      void setRawDate(clamped === now.date ? null : clamped);
    },
  };
}

/** Период календаря: дата и вид из адреса, даты колонок, заголовок, границы запроса и листания (SPEC §6.2, T04). */
export function useCalendarPeriod(config: BookingRulesConfig, now: RulesNow) {
  const address = useAddressPeriod(config, now);
  const { view, date, setDate, firstDate, lastDate } = address;
  const shape = PERIOD[view];
  const { start, end } = shape.bounds(date);

  return {
    ...address,
    dates: isoDateRange(start, diffIsoDays(end, start) + 1),
    title: shape.title(date, start, end),
    ...periodLimits({ shape, date, start, end, firstDate, lastDate }),
    goPrev: () => {
      setDate(shape.step(date, -1));
    },
    goNext: () => {
      setDate(shape.step(date, 1));
    },
    /** Месяц → «День» на дату (D27, T14 §3.1). */
    openDay: (day: IsoDate) => {
      setDate(day);
      address.setView("day");
    },
    goToday: () => {
      setDate(now.date);
    },
  };
}
