import type { MouseEvent } from "react";

import type { useTimeDisplay } from "@/features/time-mode/model/use-time-display";
import { TimeModeSwitch } from "@/features/time-mode/ui/time-mode-switch";

import { isWorkingDay } from "@/entities/booking/lib/booking-rules";
import type { Settings } from "@/entities/settings/model/settings.types";
import type { Now } from "@/entities/settings/model/use-now";

import { ROUTES } from "@/shared/consts/routes";
import { TEXTS } from "@/shared/consts/texts";
import { formatDayTitle } from "@/shared/lib/time/format";
import type { IsoDate } from "@/shared/lib/time/types";
import { DatePicker } from "@/shared/ui/date-picker";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { CALENDAR_VIEWS, type CalendarView } from "../lib/grid-view";
import type { useCalendarPeriod } from "../model/use-calendar-period";

import { CalendarHeader, type CalendarHeaderProps } from "./calendar-header";

export type RoomCalendarHeaderProps = {
  roomName: string;
  settings: Settings;
  now: Now;
  period: ReturnType<typeof useCalendarPeriod>;
  timeDisplay: ReturnType<typeof useTimeDisplay>;
  book: CalendarHeaderProps["book"];
  /** «Все комнаты» с черновиком — вопрос в панели (D33). */
  onBackClick: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const DATE_BUTTON = { kind: "button" } as const;
const VIEW_OPTIONS = CALENDAR_VIEWS.map((value) => ({ value, label: TEXTS.calendar.views[value] }));

/** Шапка календаря комнаты: период и листание, выбор даты и вида, пояс и «Моё время», «Забронировать». */
export function RoomCalendarHeader({
  roomName,
  settings,
  now,
  period,
  timeDisplay,
  book,
  onBackClick,
}: RoomCalendarHeaderProps) {
  const isWeekend = (date: IsoDate) => !isWorkingDay(date, settings);
  const dateRange = { min: period.firstDate, max: period.lastDate, today: now.date, isWeekend };
  const dateText = formatDayTitle(period.date);
  const isDevice = timeDisplay.display.mode === "device";
  const handleViewChange = (view: CalendarView) => {
    period.setView(view);
  };
  const nav = {
    title: period.title,
    onPrev: period.goPrev,
    onNext: period.goNext,
    onToday: period.goToday,
    prevDisabled: !period.canPrev,
    nextDisabled: !period.canNext,
  };
  const zoneSwitch = (
    <TimeModeSwitch
      available={timeDisplay.canSwitch}
      checked={isDevice}
      ariaLabel={timeDisplay.switchLabel}
      onCheckedChange={timeDisplay.setDevice}
    />
  );
  const zone = { label: timeDisplay.display.zoneLabel(period.date), switch: zoneSwitch };
  const back = { href: ROUTES.ROOMS, onClick: onBackClick };
  const dateSlot = (
    <DatePicker
      trigger={DATE_BUTTON}
      mode="view"
      value={period.date}
      valueText={dateText}
      onChange={period.setDate}
      range={dateRange}
    />
  );
  const viewSlot = (
    <SegmentedControl
      label={TEXTS.calendar.viewLabel}
      options={VIEW_OPTIONS}
      value={period.view}
      onChange={handleViewChange}
      className="w-full md:w-fit"
    />
  );

  return (
    <CalendarHeader
      roomName={roomName}
      back={back}
      nav={nav}
      dateSlot={dateSlot}
      viewSlot={viewSlot}
      zone={zone}
      book={book}
    />
  );
}
