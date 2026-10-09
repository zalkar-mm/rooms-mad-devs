import { buildPeriodView } from "@/widgets/room-calendar/lib/build-period";
import { TimeGrid } from "@/widgets/room-calendar/ui/time-grid";

import { slotStarts } from "@/entities/booking/lib/time-slots";

import { createTimeDisplay } from "@/shared/lib/time/time-display";

import { KIT_BOOKINGS, KIT_DRAFT, KIT_GRID_DATES, KIT_NOW, KIT_SETTINGS, noop } from "./ui-kit.fixtures";

const KIT_ZONE = "Asia/Bishkek";
const display = createTimeDisplay({ mode: "room", roomZone: KIT_ZONE, deviceZone: KIT_ZONE });

/** Сетка строится тем же buildPeriodView, что в приложении: состояния ячеек, статусы броней, черновик, «сейчас». */
const period = buildPeriodView({
  view: "week",
  dates: KIT_GRID_DATES,
  selectedDate: KIT_NOW.date,
  bookings: KIT_BOOKINGS,
  config: KIT_SETTINGS,
  now: KIT_NOW,
  density: "default",
  display,
  draft: KIT_DRAFT,
  editingId: undefined,
  highlightConflicts: true,
});
const columns = period.kind === "grid" ? period.columns : [];

const GRID = {
  timeLabels: [...slotStarts(KIT_SETTINGS), KIT_SETTINGS.workdayEnd],
  density: "default",
  periodKey: "kit",
  selectedId: "k5",
} as const;

const HANDLERS = { onOpenBooking: noop, onActivateSlot: noop, onSlotPointerDown: noop, onSlotPointerEnter: noop };

/** Неделя из фикстур: прошедшее, идущее, выбранное, конфликт с черновиком, выходной и день вне горизонта. */
export function CalendarGridDemo() {
  return <TimeGrid columns={columns} grid={GRID} handlers={HANDLERS} />;
}
