import { useState } from "react";

import type { DayHeaderState } from "@/widgets/room-calendar/lib/grid-view";
import { CalendarHeader } from "@/widgets/room-calendar/ui/calendar-header";
import { DayHeader } from "@/widgets/room-calendar/ui/day-header";
import { GridSkeleton, type GridSkeletonVariant } from "@/widgets/room-calendar/ui/grid-skeleton";
import { MonthDayCell } from "@/widgets/room-calendar/ui/month-day-cell";
import { NowLine } from "@/widgets/room-calendar/ui/now-line";
import { SlotCell, type SlotCellProps } from "@/widgets/room-calendar/ui/slot-cell";

import { BookingBlock } from "@/entities/booking/ui/booking-block";

import { ROUTES } from "@/shared/consts/routes";
import { TEXTS } from "@/shared/consts/texts";
import { DatePicker } from "@/shared/ui/date-picker";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { Switch } from "@/shared/ui/switch";

import { CalendarGridDemo } from "./calendar-grid-demo";
import { KitCase } from "./kit-case";
import { KitSection } from "./kit-section";
import {
  type CalendarView,
  DATE_BUTTON,
  DATES,
  KIT_SKELETON_SHAPE,
  KIT_VIEW_RANGE,
  MONTH_CELLS,
  noop,
  VIEW_OPTIONS,
} from "./ui-kit.fixtures";

const DAY_HEADERS: { text: string; state: DayHeaderState }[] = [
  { text: "Пн 5", state: "normal" },
  { text: "Ср 7", state: "today" },
  { text: "Сб 10", state: "weekend" },
  { text: "Пн 9", state: "outOfHorizon" },
];

const SLOT_CASES: { label: string; forced?: "hover" | "focus"; props: SlotCellProps }[] = [
  { label: "available", props: { state: "available", ariaLabel: "Среда 7 октября, 14:00, свободно" } },
  {
    label: "available · hover",
    forced: "hover",
    props: { state: "available", ariaLabel: "Среда 7 октября, 14:00, свободно" },
  },
  {
    label: "available · focus",
    forced: "focus",
    props: { state: "available", ariaLabel: "Среда 7 октября, 14:00, свободно" },
  },
  {
    label: ":30, пунктир сверху",
    props: { state: "available", ariaLabel: "Среда 7 октября, 14:00, свободно", halfHour: true },
  },
  { label: "past", props: { state: "past", ariaLabel: "Среда 7 октября, 14:00, прошло" } },
  { label: "weekend", props: { state: "weekend", ariaLabel: "Среда 7 октября, 14:00, выходной" } },
  { label: "outOfHorizon", props: { state: "outOfHorizon", ariaLabel: "Среда 7 октября, 14:00, недоступно" } },
  {
    label: "touch (48)",
    props: { state: "available", ariaLabel: "Среда 7 октября, 14:00, свободно", density: "touch" },
  },
];

const SKELETONS: GridSkeletonVariant[] = ["day", "week", "month"];
const TZ_LABEL = TEXTS.calendar.roomTime("UTC+6");

const HEADER_BACK = { href: ROUTES.ROOMS };
const WEEK_NAV = { title: "5–11 октября 2026", onPrev: noop, onNext: noop, onToday: noop };
const EDGE_NAV = { ...WEEK_NAV, title: "Понедельник, 7 сентября 2026", prevDisabled: true };
const ZONE_ONLY = { label: TZ_LABEL };
const BOOK_ENABLED = { onBook: noop };
const BOOK_DISABLED = { onBook: noop, disabled: true };

export function CalendarSection() {
  return (
    <>
      <HeaderCases />
      <CellCases />
      <GridCases />
      <MonthCases />
      <SkeletonCases />
    </>
  );
}

function HeaderCases() {
  const [view, setView] = useState<CalendarView>("week");
  const [myTime, setMyTime] = useState(false);

  const dateSlot = (
    <DatePicker
      trigger={DATE_BUTTON}
      mode="view"
      value={DATES.today}
      valueText={DATES.todayText}
      onChange={noop}
      range={KIT_VIEW_RANGE}
    />
  );
  const viewSlot = (
    <SegmentedControl
      label="Вид календаря"
      options={VIEW_OPTIONS}
      value={view}
      onChange={setView}
      className="w-full md:w-fit"
    />
  );
  const tzSwitch = <Switch label={TEXTS.calendar.myTime} checked={myTime} onCheckedChange={setMyTime} />;
  const zoneWithSwitch = { label: TZ_LABEL, switch: tzSwitch };

  return (
    <KitSection title="CalendarHeader">
      <KitCase label="с «Моё время»; «Забронировать» на мобильном липнет к низу рамки" className="w-full">
        <div className="relative transform-gpu border border-grey-20 pb-24 md:pb-0">
          <CalendarHeader
            roomName="Переговорная 1"
            back={HEADER_BACK}
            nav={WEEK_NAV}
            dateSlot={dateSlot}
            viewSlot={viewSlot}
            zone={zoneWithSwitch}
            book={BOOK_ENABLED}
          />
        </div>
      </KitCase>
      <KitCase label="граница горизонта: «Назад» неактивна, пояса совпадают, бронь недоступна" className="w-full">
        <div className="relative transform-gpu border border-grey-20 pb-24 md:pb-0">
          <CalendarHeader
            roomName="Переговорная 2"
            back={HEADER_BACK}
            nav={EDGE_NAV}
            dateSlot={dateSlot}
            viewSlot={viewSlot}
            zone={ZONE_ONLY}
            book={BOOK_DISABLED}
          />
        </div>
      </KitCase>
    </KitSection>
  );
}

function CellCases() {
  return (
    <KitSection title="DayHeader · SlotCell">
      {DAY_HEADERS.map(({ text, state }) => (
        <KitCase key={state} label={state}>
          <DayHeader text={text} state={state} />
        </KitCase>
      ))}
      {SLOT_CASES.map(({ label, forced, props }) => (
        <KitCase key={label} label={label} state={forced} className="w-32">
          <SlotCell {...props} onActivate={noop} />
        </KitCase>
      ))}
    </KitSection>
  );
}

function GridCases() {
  return (
    <KitSection title="Сетка: брони, черновик, «сейчас»">
      <KitCase
        label="прошедшая, идущая и будущая касаются; компактная; выбранная; конфликт; черновик на пределе"
        className="w-full"
      >
        <CalendarGridDemo />
      </KitCase>
      <KitCase label="NowLine (в сетке выше скрыта идущей бронью: она под бронями)" className="w-48">
        <div className="relative h-16 border-t border-b border-grey-20 bg-white">
          <NowLine top={32} />
        </div>
      </KitCase>
      <KitCase label="BookingBlock · hover" state="hover" className="w-48">
        <BookingStub />
      </KitCase>
      <KitCase label="BookingBlock · focus" state="focus" className="w-48">
        <BookingStub />
      </KitCase>
    </KitSection>
  );
}

function MonthCases() {
  return (
    <KitSection title="MonthDayCell">
      {MONTH_CELLS.map(({ label, state, props }) => (
        <KitCase key={label} label={label} state={state} className="w-36">
          <div className="border-r border-b border-grey-20">
            <MonthDayCell {...props} onOpenDay={noop} />
          </div>
        </KitCase>
      ))}
    </KitSection>
  );
}

function SkeletonCases() {
  return (
    <KitSection title="GridSkeleton">
      {SKELETONS.map((variant) => (
        <KitCase key={variant} label={variant} className="w-full">
          <div aria-busy="true" className="overflow-x-auto">
            <GridSkeleton variant={variant} shape={KIT_SKELETON_SHAPE} density="default" />
          </div>
        </KitCase>
      ))}
    </KitSection>
  );
}

const STUB_POSITION = { top: 0, height: 64 };

function BookingStub() {
  return (
    <div className="relative h-16 bg-white">
      <BookingBlock
        bookingId="stub"
        position={STUB_POSITION}
        title="Встреча"
        timeText="11:00–12:00"
        status="future"
        onOpen={noop}
        ariaLabel="Встреча, среда 7 октября, с 11:00 до 12:00, будущая"
      />
    </div>
  );
}
