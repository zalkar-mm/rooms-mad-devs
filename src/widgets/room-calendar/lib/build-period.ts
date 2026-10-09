import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";

import { buildColumn, type ColumnView } from "./build-column";
import { buildMonth, type MonthCellView } from "./build-month";
import type { CalendarView, SlotDensity } from "./grid-view";

/** Интервал черновика или протягивания на дате. */
export type GridDraft = { date: IsoDate; start: HhMm; end: HhMm; atLimit?: boolean };

export type BuildPeriodParams = {
  view: CalendarView;
  dates: readonly IsoDate[];
  selectedDate: IsoDate;
  /** `undefined` — брони периода ещё не пришли. */
  bookings: readonly Booking[] | undefined;
  config: BookingRulesConfig;
  now: RulesNow;
  density: SlotDensity;
  display: TimeDisplay;
  /** Сохранённый черновик (не протягивание). */
  draft: GridDraft | null;
  /** Бронь в правке: её место в сетке занимает черновик (T10 §4.2). */
  editingId: string | undefined;
  /** Сервер ответил `409`: пересекающие черновик брони выделяются (T09 §3.6). */
  highlightConflicts: boolean;
};

/** Сетка видимого периода: ещё грузится, ячейки месяца или колонки «Дня» и «Недели». */
export type PeriodView =
  | { kind: "loading"; view: CalendarView }
  | { kind: "month"; cells: MonthCellView[] }
  | { kind: "grid"; view: Exclude<CalendarView, "month">; columns: ColumnView[] };

type DayColumnOptions = { draft: GridDraft | null; highlightConflicts: boolean };

function dayColumn(
  params: BuildPeriodParams & { bookings: readonly Booking[] },
  date: IsoDate,
  options: DayColumnOptions,
) {
  return buildColumn({
    ...params,
    date,
    dayBookings: params.bookings.filter((booking) => booking.date === date && booking.id !== params.editingId),
    draft: options.draft?.date === date ? options.draft : undefined,
    highlightConflicts: options.highlightConflicts,
  });
}

/** Сетка видимого периода по броням, сохранённому черновику и правке. Чистая функция. */
export function buildPeriodView(params: BuildPeriodParams): PeriodView {
  const { view, bookings } = params;
  if (!bookings) return { kind: "loading", view };
  if (view === "month") {
    return { kind: "month", cells: buildMonth({ ...params, bookings }) };
  }
  const options = { draft: params.draft, highlightConflicts: params.highlightConflicts };
  return { kind: "grid", view, columns: params.dates.map((date) => dayColumn({ ...params, bookings }, date, options)) };
}

/**
 * Протягивание (T07 §4.3а): пересобираются только колонки его даты и даты сохранённого черновика — тот
 * прячется до отпускания, выделение конфликта гаснет. Остальные колонки остаются теми же объектами.
 */
export function applyDragPreview(period: PeriodView, preview: GridDraft | null, params: BuildPeriodParams): PeriodView {
  const { bookings } = params;
  if (period.kind !== "grid" || !preview || !bookings) return period;
  const touched = new Set([preview.date, params.draft?.date]);
  const options = { draft: preview, highlightConflicts: false };
  const columns = period.columns.map((column) =>
    touched.has(column.date) ? dayColumn({ ...params, bookings }, column.date, options) : column,
  );
  return { ...period, columns };
}
