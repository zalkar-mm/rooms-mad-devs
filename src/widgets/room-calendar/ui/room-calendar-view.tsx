import type { PointerEvent, ReactNode } from "react";

import { useLeaveDraft } from "@/features/leave-draft/model/use-leave-draft";
import { useSlotRangeDrag } from "@/features/select-slot-range/model/use-slot-range-drag";
import { useTimeDisplay } from "@/features/time-mode/model/use-time-display";

import type { Booking } from "@/entities/booking/model/booking.types";
import type { Room } from "@/entities/room/model/room.types";
import type { Settings } from "@/entities/settings/model/settings.types";
import type { Now } from "@/entities/settings/model/use-now";

import { DOM_IDS } from "@/shared/consts/dom-ids";
import { TEXTS } from "@/shared/consts/texts";
import { cn } from "@/shared/lib/cn";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";
import { SkipLink } from "@/shared/ui/skip-link";

import { buildPanelProps, type CalendarPanelProps } from "../model/calendar-panel-props";
import { useCalendarGrid } from "../model/use-calendar-grid";
import { useCalendarLayout } from "../model/use-calendar-layout";
import { useCalendarPanel } from "../model/use-calendar-panel";
import { useCalendarPeriod } from "../model/use-calendar-period";
import { usePeriodBookings } from "../model/use-period-bookings";

import { CalendarBody, type CalendarBodyProps } from "./calendar-body";
import { RoomCalendarHeader } from "./room-calendar-header";
import { RoomNotFound } from "./room-not-found";

export type RoomCalendarViewProps = {
  room: Room;
  settings: Settings;
  now: Now;
  renderPanel: (props: CalendarPanelProps) => ReactNode;
};

type HandlersSource = {
  bookings: readonly Booking[] | undefined;
  panel: ReturnType<typeof useCalendarPanel>;
  drag: ReturnType<typeof useSlotRangeDrag>;
  onOpenDay: (date: IsoDate) => void;
};

/** События сетки: бронь открывается по `id` из загруженного периода, слот — черновиком или протягиванием. */
const gridHandlersOf = ({ bookings, panel, drag, onOpenDay }: HandlersSource): CalendarBodyProps["handlers"] => ({
  onOpenBooking: (id: string) => {
    const booking = bookings?.find((item) => item.id === id);
    if (booking) panel.onOpenBooking(booking);
  },
  onActivateSlot: (date: IsoDate, start: HhMm) => {
    panel.onActivateSlot(date, start);
  },
  onSlotPointerDown: (date: IsoDate, start: HhMm, event: PointerEvent<HTMLElement>) => {
    drag.onSlotPointerDown(date, start, event);
  },
  onSlotPointerEnter: drag.onSlotPointerEnter,
  onOpenDay,
});

/** Экран «Календарь комнаты» (SPEC §6.2): шапка, сетка периода и боковая панель. */
export function RoomCalendarView({ room, settings, now, renderPanel }: RoomCalendarViewProps) {
  const period = useCalendarPeriod(settings, now);
  const bookings = usePeriodBookings({ roomId: room.id, ...period.query });
  const panelParams = { roomId: room.id, config: settings, now, date: period.date, dates: period.dates };
  const panel = useCalendarPanel({ ...panelParams, bookings: bookings.bookings });
  const timeDisplay = useTimeDisplay({
    settings,
    date: period.date,
    dates: period.dates,
    sharedAxis: period.view !== "month",
  });
  const leaveDraft = useLeaveDraft(room.id);
  const { density, layout, overlayOpen } = useCalendarLayout(panel.isOpen || leaveDraft.confirming);
  const dragParams = { config: settings, now, bookings: bookings.bookings ?? [], onSelect: panel.onSelectRange };
  const drag = useSlotRangeDrag(dragParams);
  const display = timeDisplay.display;
  const gridParams = { settings, now, period, bookings: bookings.bookings, draft: panel.draft, display, density };
  const gridView = useCalendarGrid({ ...gridParams, preview: drag.preview });

  if (bookings.roomMissing) return <RoomNotFound />;

  const mainCn = cn("min-w-0 flex-1 pb-24 md:pb-0", overlayOpen && "hidden");
  // В «Месяце» создания нет (D27, SPEC §14).
  const book = {
    onBook: panel.onBook,
    disabled: !bookings.bookings || period.view === "month",
    barHidden: overlayOpen,
  };
  const grid = { ...gridView, density, selectedId: panel.selectedId };
  const handlers = gridHandlersOf({ bookings: bookings.bookings, panel, drag, onOpenDay: period.openDay });
  const leaveConfirm = leaveDraft.confirming ? { onStay: leaveDraft.stay, onLeave: leaveDraft.leave } : undefined;
  const panelProps = buildPanelProps({
    roomId: room.id,
    panel,
    onDraftDateChange: period.setDate,
    display,
    layout,
    leaveConfirm,
  });

  return (
    <div className="flex min-h-dvh flex-col bg-grey-10">
      <SkipLink targetId={DOM_IDS.calendarGrid}>{TEXTS.calendar.skipToCalendar}</SkipLink>
      <RoomCalendarHeader
        roomName={room.name}
        settings={settings}
        now={now}
        period={period}
        timeDisplay={timeDisplay}
        book={book}
        onBackClick={leaveDraft.requestLeave}
      />
      <div className="relative flex min-h-0 flex-1">
        <main className={mainCn}>
          <CalendarBody
            period={gridView.period}
            failed={bookings.failed}
            onRetry={bookings.retry}
            grid={grid}
            handlers={handlers}
          />
        </main>
        {renderPanel(panelProps)}
      </div>
    </div>
  );
}
