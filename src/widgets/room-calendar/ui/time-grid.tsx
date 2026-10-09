import { type PointerEvent, type RefObject, useRef } from "react";

import { BookingBlock } from "@/entities/booking/ui/booking-block";
import { DraftBlock } from "@/entities/booking/ui/draft-block";

import { DOM_IDS } from "@/shared/consts/dom-ids";
import { TEXTS } from "@/shared/consts/texts";
import { cn } from "@/shared/lib/cn";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";
import { Gate } from "@/shared/ui/gate";
import { HScroll } from "@/shared/ui/h-scroll";

import type { BookingView, ColumnView, DraftView } from "../lib/build-column";
import type { SlotDensity } from "../lib/grid-view";

import { DayHeader } from "./day-header";
import { NowLine } from "./now-line";
import { SlotCell } from "./slot-cell";
import { TimeColumn } from "./time-column";

/** Как показать сетку периода. */
export type GridAppearance = {
  /** Подписи 09:00…18:00 для колонки времени, в поясе режима. */
  timeLabels: readonly string[];
  density: SlotDensity;
  /** Период — ключ прокрутки к сегодняшней колонке на узких экранах. */
  periodKey: string;
  /** Бронь, открытая в панели, — выделена в сетке. */
  selectedId: string | null;
};

/** События сетки, которые проходят до ячеек и броней без изменений. */
export type GridHandlers = {
  onOpenBooking: (id: string) => void;
  /** Двойное нажатие или Enter на доступной ячейке (D3, D34). */
  onActivateSlot: (date: IsoDate, start: HhMm) => void;
  /** Протягивание (T07): нажатие на доступной ячейке и указатель над любой ячейкой. */
  onSlotPointerDown: (date: IsoDate, start: HhMm, event: PointerEvent<HTMLElement>) => void;
  onSlotPointerEnter: (start: HhMm) => void;
};

export type TimeGridProps = {
  columns: readonly ColumnView[];
  grid: GridAppearance;
  handlers: GridHandlers;
};

type SlotHandlers = Omit<GridHandlers, "onOpenBooking">;

/**
 * Сетка по времени (D1): «День» — одна колонка, «Неделя» — семь с заголовками, не уже 840 px с прокруткой
 * внутри (D28). Брони стоят в DOM рядом со слотом своего начала: Tab идёт по времени (SPEC §12).
 */
export function TimeGrid({ columns, grid, handlers }: TimeGridProps) {
  const { timeLabels, density, periodKey, selectedId } = grid;
  const { onOpenBooking, ...slotHandlers } = handlers;
  const todayRef = useRef<HTMLDivElement>(null);
  const isWeek = columns.length > 1;
  const timeColumnCn = cn("pt-2", isWeek && "pt-12");
  const timeColumn = (
    <div className={timeColumnCn}>
      <TimeColumn labels={timeLabels} density={density} />
    </div>
  );
  const days = (
    <div id={DOM_IDS.calendarGrid} tabIndex={-1} className="flex min-w-0 flex-1 pt-2 pb-6 focus:outline-none">
      {columns.map((column) => (
        <GridColumn
          key={column.date}
          column={column}
          withHeader={isWeek}
          density={density}
          todayRef={todayRef}
          selectedId={selectedId}
          onOpenBooking={onOpenBooking}
          slotHandlers={slotHandlers}
        />
      ))}
    </div>
  );

  if (!isWeek) {
    return (
      <div className="flex bg-white">
        {timeColumn}
        {days}
      </div>
    );
  }

  return (
    <HScroll label={TEXTS.calendar.views.week} stickyLeft={timeColumn} scrollToRef={todayRef} scrollKey={periodKey}>
      {days}
    </HScroll>
  );
}

type GridColumnProps = {
  column: ColumnView;
  withHeader: boolean;
  density: SlotDensity;
  todayRef: RefObject<HTMLDivElement | null>;
  selectedId: string | null;
  onOpenBooking: (id: string) => void;
  slotHandlers: SlotHandlers;
};

function GridColumn({
  column,
  withHeader,
  density,
  todayRef,
  selectedId,
  onOpenBooking,
  slotHandlers,
}: GridColumnProps) {
  const ref = column.isToday ? todayRef : undefined;
  const rootCn = cn("group min-w-0 flex-1 bg-white", withHeader && "min-w-28");

  return (
    <div ref={ref} className={rootCn}>
      <Gate when={withHeader}>
        <DayHeader text={column.headerText} state={column.headerState} />
      </Gate>
      <div className="relative border-b border-l border-grey-20 group-last:border-r">
        {column.slots.map((slot, index) => (
          <SlotWithBookings
            key={slot.start}
            column={column}
            slotIndex={index}
            density={density}
            selectedId={selectedId}
            onOpenBooking={onOpenBooking}
            slotHandlers={slotHandlers}
          />
        ))}
        <OptionalNowLine top={column.nowTop} />
        <OptionalDraft draft={column.draft} />
      </div>
    </div>
  );
}

type SlotWithBookingsProps = {
  column: ColumnView;
  slotIndex: number;
  density: SlotDensity;
  selectedId: string | null;
  onOpenBooking: (id: string) => void;
  slotHandlers: SlotHandlers;
};

function SlotWithBookings({
  column,
  slotIndex,
  density,
  selectedId,
  onOpenBooking,
  slotHandlers,
}: SlotWithBookingsProps) {
  const slot = column.slots[slotIndex];
  if (!slot) return null;
  const starting = column.bookings.filter((view) => view.startSlot === slotIndex);
  const isAvailable = slot.state === "available";
  const handleActivate = () => {
    slotHandlers.onActivateSlot(column.date, slot.start);
  };
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isAvailable) slotHandlers.onSlotPointerDown(column.date, slot.start, event);
  };
  const handlePointerEnter = () => {
    slotHandlers.onSlotPointerEnter(slot.start);
  };

  return (
    <>
      <SlotCell
        state={slot.state}
        ariaLabel={slot.ariaLabel}
        halfHour={slot.halfHour}
        density={density}
        onActivate={handleActivate}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
      />
      {starting.map((view) => (
        <GridBooking key={view.booking.id} view={view} selectedId={selectedId} onOpen={onOpenBooking} />
      ))}
    </>
  );
}

type GridBookingProps = {
  view: BookingView;
  selectedId: string | null;
  onOpen: (id: string) => void;
};

function GridBooking({ view, selectedId, onOpen }: GridBookingProps) {
  const marks = { selected: view.booking.id === selectedId, conflict: view.conflict, compact: view.compact };
  const position = { top: view.top, height: view.height };
  const handleOpen = () => {
    onOpen(view.booking.id);
  };

  return (
    <BookingBlock
      bookingId={view.booking.id}
      position={position}
      title={view.booking.title}
      timeText={view.timeText}
      status={view.status}
      marks={marks}
      ariaLabel={view.ariaLabel}
      onOpen={handleOpen}
    />
  );
}

function OptionalNowLine({ top }: { top: number | undefined }) {
  if (top === undefined) return null;
  return <NowLine top={top} />;
}

function OptionalDraft({ draft }: { draft: DraftView | undefined }) {
  if (!draft) return null;
  return (
    <DraftBlock
      top={draft.top}
      height={draft.height}
      timeText={draft.timeText}
      conflict={draft.conflict}
      atLimit={draft.atLimit}
      limitText={draft.limitText}
    />
  );
}
