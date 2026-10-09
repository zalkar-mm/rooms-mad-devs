import { earliestStart, overlaps, slotAvailability } from "@/entities/booking/lib/booking-rules";
import { type BookingStatus, bookingStatus } from "@/entities/booking/lib/booking-status";
import { slotStarts } from "@/entities/booking/lib/time-slots";
import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import { TEXTS } from "@/shared/consts/texts";
import { formatColumnDay, formatSpokenDate } from "@/shared/lib/time/format";
import { fromMinutes, toMinutes } from "@/shared/lib/time/minutes";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";

import { type DayHeaderState, SLOT_PX, type SlotCellState, type SlotDensity } from "./grid-view";

export type SlotView = {
  start: HhMm;
  state: SlotCellState;
  halfHour: boolean;
  ariaLabel: string;
};

export type BookingView = {
  booking: Booking;
  status: BookingStatus;
  top: number;
  height: number;
  compact: boolean;
  timeText: string;
  ariaLabel: string;
  /** Индекс слота начала: блок встаёт в порядок Tab рядом со своим слотом (SPEC §12). */
  startSlot: number;
  /** Пересекается с черновиком, на который сервер ответил `409` (D13). */
  conflict: boolean;
};

/** Что сказать о дне целиком (SPEC §10): выходной и «после 17:30» — даже при бронях. */
export type DayNote = "weekend" | "todayClosed" | "emptyPast" | "empty" | null;

/** Черновик в колонке (SPEC §6.2): позиция, интервал, пересечение с бронью. */
export type DraftView = {
  top: number;
  height: number;
  timeText: string;
  conflict: boolean;
  /** Протягивание упёрлось в максимум: подпись «Не больше 2 часов» (T07). */
  atLimit: boolean;
  /** Подпись упора с максимумом длительности из настроек. */
  limitText: string;
};

export type ColumnView = {
  date: IsoDate;
  isToday: boolean;
  /** «Пн 5» и состояние заголовка колонки недели (SPEC §6.2). */
  headerText: string;
  headerState: DayHeaderState;
  slots: SlotView[];
  bookings: BookingView[];
  /** Позиция линии «сейчас» в px; только сегодня в рабочие часы (SPEC §6.2). */
  nowTop?: number;
  draft?: DraftView;
  note: DayNote;
};

type DayQuery = { date: IsoDate; config: BookingRulesConfig; now: RulesNow };

/** Доступность дня по календарю: выходной и горизонт проверяются по первому слоту. */
const dayAvailability = ({ date, config, now }: DayQuery) =>
  slotAvailability({ date, start: config.workdayStart, config, now });

function dayNote({ hasBookings, ...day }: DayQuery & { hasBookings: boolean }): DayNote {
  const { date, config, now } = day;
  if (dayAvailability(day) === "weekend") return "weekend";
  if (date === now.date && earliestStart(date, config, now) === null) return "todayClosed";
  if (hasBookings) return null;
  return date < now.date ? "emptyPast" : "empty";
}

function headerState(day: DayQuery): DayHeaderState {
  if (day.date === day.now.date) return "today";
  const availability = dayAvailability(day);
  if (availability === "weekend") return "weekend";
  if (availability === "outOfHorizon") return "outOfHorizon";
  return "normal";
}

export type BuildColumnParams = {
  date: IsoDate;
  dayBookings: readonly Booking[];
  config: BookingRulesConfig;
  now: RulesNow;
  density: SlotDensity;
  /** Интервал черновика или протягивания, если он на этой дате. */
  draft?: { start: HhMm; end: HhMm; atLimit?: boolean };
  /** Сервер ответил `409` на черновик: пересекающие его брони выделяются (T09 §3.6). */
  highlightConflicts?: boolean;
  /** Подписи времени в поясе режима; расчёты и позиции — во времени комнаты (D23). */
  display: TimeDisplay;
};

/** Общее для частей колонки: перевод минут в px и подписи времени этой даты. */
type ColumnContext = BuildColumnParams & {
  show: (time: HhMm) => HhMm;
  spokenDate: string;
  dayStart: number;
  slotPx: number;
  toPx: (minutes: number) => number;
};

function columnContext(params: BuildColumnParams): ColumnContext {
  const { date, config, display } = params;
  const dayStart = toMinutes(config.workdayStart);
  const slotPx = SLOT_PX[params.density];
  return {
    ...params,
    show: (time) => display.time(date, time),
    spokenDate: formatSpokenDate(date),
    dayStart,
    slotPx,
    toPx: (minutes) => ((minutes - dayStart) / config.slotMinutes) * slotPx,
  };
}

function buildSlots({ date, dayBookings, config, now, show, spokenDate }: ColumnContext): SlotView[] {
  return slotStarts(config).map((start) => {
    const slotEnd = fromMinutes(toMinutes(start) + config.slotMinutes);
    const busy = dayBookings.some((booking) => overlaps(booking, { start, end: slotEnd }));
    const state: SlotCellState = busy ? "busy" : slotAvailability({ date, start, config, now });
    const ariaLabel = TEXTS.calendar.slotSpoken(spokenDate, show(start), TEXTS.calendar.slotStateSpoken[state]);
    // Пунктир — у слотов, начинающихся не на ровный час.
    return { start, state, halfHour: toMinutes(start) % 60 !== 0, ariaLabel };
  });
}

function buildBookingView(ctx: ColumnContext, booking: Booking): BookingView {
  const { config, show, toPx } = ctx;
  const status = bookingStatus(booking, ctx.now);
  const startMin = toMinutes(booking.start);
  const duration = toMinutes(booking.end) - startMin;
  const compact = duration <= config.slotMinutes;
  const ariaLabel = TEXTS.calendar.bookingSpoken({
    title: booking.title,
    date: ctx.spokenDate,
    start: show(booking.start),
    end: show(booking.end),
    status: TEXTS.calendar.bookingStatusSpoken[status],
  });
  const highlighted = ctx.highlightConflicts === true && ctx.draft !== undefined && overlaps(booking, ctx.draft);
  return {
    booking,
    status,
    top: toPx(startMin),
    height: (duration / config.slotMinutes) * ctx.slotPx,
    compact,
    timeText: compact ? show(booking.start) : ctx.display.interval(ctx.date, booking.start, booking.end),
    ariaLabel,
    startSlot: Math.floor((startMin - ctx.dayStart) / config.slotMinutes),
    conflict: highlighted,
  };
}

function buildDraftView({ draft, toPx, display, date, dayBookings, config }: ColumnContext): DraftView | undefined {
  if (!draft) return undefined;
  return {
    top: toPx(toMinutes(draft.start)),
    height: Math.max(0, toPx(toMinutes(draft.end)) - toPx(toMinutes(draft.start))),
    timeText: display.interval(date, draft.start, draft.end),
    conflict: dayBookings.some((booking) => overlaps(booking, draft)),
    atLimit: draft.atLimit ?? false,
    limitText: TEXTS.calendar.dragLimit(config.maxDurationMinutes),
  };
}

/** Колонка дня: состояния ячеек по правилам, позиции и статусы броней, линия «сейчас». Чистая функция. */
export function buildColumn(params: BuildColumnParams): ColumnView {
  const ctx = columnContext(params);
  const { date, config, now, dayBookings } = params;
  const nowMin = toMinutes(now.time);
  const isToday = date === now.date;
  const nowInDay = isToday && nowMin >= ctx.dayStart && nowMin < toMinutes(config.workdayEnd);

  return {
    date,
    isToday,
    draft: buildDraftView(ctx),
    headerText: formatColumnDay(date),
    headerState: headerState({ date, config, now }),
    slots: buildSlots(ctx),
    bookings: dayBookings.map((booking) => buildBookingView(ctx, booking)),
    nowTop: nowInDay ? ctx.toPx(nowMin) : undefined,
    note: dayNote({ date, config, now, hasBookings: dayBookings.length > 0 }),
  };
}
