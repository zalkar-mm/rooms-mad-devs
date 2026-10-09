import { useEffect, useRef } from "react";

import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "lucide-react";
import {
  type ChevronProps,
  type ClassNames,
  type DayButtonProps,
  DayPicker,
  type Matcher,
  type RootProps,
} from "react-day-picker";
import { ru } from "react-day-picker/locale";

import { cn } from "../lib/cn";

export type DatePickerCalendarModifiers = {
  /** Дата вне горизонта бронирования: видна зачёркнутой. */
  outOfHorizon: Matcher[];
  weekend: Matcher;
};

export type DatePickerCalendarProps = {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
  today: Date;
  startMonth: Date;
  endMonth: Date;
  disabled: Matcher[];
  modifiers: DatePickerCalendarModifiers;
};

const NAV_BUTTON_CN = cn(
  "inline-flex size-11 shrink-0 items-center justify-center rounded-m border border-transparent bg-clip-padding p-0",
  "whitespace-nowrap transition-all hover:bg-grey-10 hover:text-grey-100 focus-ring",
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

// Ячейка дня 44 px — тач-цель (SPEC §11).
const CLASS_NAMES: Partial<ClassNames> = {
  root: "w-fit p-3",
  months: "relative flex flex-col gap-4",
  month: "flex w-full flex-col gap-4",
  nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
  button_previous: NAV_BUTTON_CN,
  button_next: NAV_BUTTON_CN,
  month_caption: "flex h-11 w-full items-center justify-center px-11",
  caption_label: "text-small font-medium",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "flex-1 rounded-m text-caption font-normal text-grey-50",
  week: "mt-2 flex w-full",
  day: "relative aspect-square h-full w-full rounded-m p-0 text-center",
  day_button: cn(
    "relative isolate z-10 flex aspect-square w-full min-w-11 shrink-0 flex-col items-center justify-center gap-1",
    "rounded-m border-0 bg-clip-padding text-small leading-none font-normal whitespace-nowrap transition-all focus-ring",
    "hover:bg-accent-subtle hover:text-grey-100",
    "data-[selected-single=true]:bg-accent data-[selected-single=true]:text-on-accent",
    "disabled:pointer-events-none disabled:opacity-50",
  ),
  today: "rounded-m ring-1 ring-accent ring-inset",
  outside: "text-grey-50",
  disabled: "text-grey-50",
  hidden: "invisible",
};

const MODIFIER_CLASS_NAMES: Record<keyof DatePickerCalendarModifiers, string> = {
  outOfHorizon: "line-through",
  weekend: "text-grey-50",
};

const COMPONENTS = { Root: CalendarRoot, Chevron: CalendarChevron, DayButton: CalendarDayButton };

/** Месяц react-day-picker для поповера DatePicker: неделя с понедельника, подписи по-русски. */
export function DatePickerCalendar({
  selected,
  onSelect,
  today,
  startMonth,
  endMonth,
  disabled,
  modifiers,
}: DatePickerCalendarProps) {
  const defaultMonth = selected ?? today;

  return (
    <DayPicker
      mode="single"
      required
      showOutsideDays
      selected={selected}
      onSelect={onSelect}
      locale={ru}
      weekStartsOn={1}
      today={today}
      defaultMonth={defaultMonth}
      startMonth={startMonth}
      endMonth={endMonth}
      disabled={disabled}
      modifiers={modifiers}
      modifiersClassNames={MODIFIER_CLASS_NAMES}
      classNames={CLASS_NAMES}
      components={COMPONENTS}
    />
  );
}

function CalendarRoot({ rootRef, ...props }: RootProps) {
  return <div data-slot="calendar" ref={rootRef} {...props} />;
}

const CHEVRONS = { left: ChevronLeftIcon, right: ChevronRightIcon, up: ChevronUpIcon, down: ChevronDownIcon };

function CalendarChevron({ className, orientation = "down" }: ChevronProps) {
  const Icon = CHEVRONS[orientation];
  const iconCn = cn("size-4", className);
  return <Icon aria-hidden className={iconCn} />;
}

/** Кнопка дня: фокус с клавиатуры переводит react-day-picker, кнопка его принимает. */
function CalendarDayButton({ day: _day, modifiers, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return <button ref={ref} type="button" data-selected-single={modifiers.selected} {...props} />;
}
