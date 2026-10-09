import { slotStarts } from "@/entities/booking/lib/time-slots";
import type { Booking } from "@/entities/booking/model/booking.types";
import { useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import type { Settings } from "@/entities/settings/model/settings.types";
import type { Now } from "@/entities/settings/model/use-now";

import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";

import { applyDragPreview, buildPeriodView, type GridDraft } from "../lib/build-period";
import type { CalendarView, SlotDensity } from "../lib/grid-view";

type GridParams = {
  settings: Settings;
  now: Now;
  period: { view: CalendarView; date: IsoDate; dates: readonly IsoDate[] };
  bookings: readonly Booking[] | undefined;
  /** Сохранённый черновик этой комнаты и бронь в правке. */
  draft: (GridDraft & { editing?: Booking }) | null;
  /** Интервал протягивания, пока кнопка мыши нажата. */
  preview: GridDraft | null;
  display: TimeDisplay;
  density: SlotDensity;
};

/**
 * Сетка периода для показа. База пересобирается только при смене броней, «сейчас», черновика или режима;
 * протягивание пересобирает лишь колонки своей даты и даты черновика (ревью: сетка на каждый hover).
 */
export function useCalendarGrid({ settings, now, period, bookings, draft, preview, display, density }: GridParams) {
  const conflictText = useBookingDraftStore((state) => state.conflictText);
  const buildParams = {
    view: period.view,
    dates: period.dates,
    selectedDate: period.date,
    bookings,
    config: settings,
    now,
    density,
    display,
    draft,
    editingId: draft?.editing?.id,
    highlightConflicts: conflictText !== null,
  };
  const base = buildPeriodView(buildParams);
  const starts = slotStarts(settings);

  return {
    period: applyDragPreview(base, preview, buildParams),
    timeLabels: [...starts, settings.workdayEnd].map((time) => display.time(period.date, time)),
    periodKey: `${period.view}:${period.dates[0] ?? ""}`,
    skeletonShape: { rows: starts.length, cells: period.dates.length },
  };
}
