import { useId, useState } from "react";

import { CalendarIcon } from "lucide-react";
import { Popover } from "radix-ui";
import type { Matcher } from "react-day-picker";

import { TEXTS } from "../consts/texts";
import { cn } from "../lib/cn";
import { fromIsoDate, toIsoDate } from "../lib/time/iso-date";
import type { IsoDate } from "../lib/time/types";

import { DatePickerCalendar } from "./date-picker-calendar";
import { FieldLabel } from "./field-label";
import { Gate } from "./gate";

/** Доступные даты: вне `min…max` — зачёркнуты; «сегодня» во времени комнаты — компонент его не вычисляет. */
export type DatePickerRange = {
  min: IsoDate;
  max: IsoDate;
  today: IsoDate;
  isWeekend: (date: IsoDate) => boolean;
};

/** `field` — поле формы с подписью и ошибкой, `button` — кнопка в шапке календаря. */
export type DatePickerTriggerKind = { kind: "button" } | { kind: "field"; label: string; error?: string };

export type DatePickerProps = {
  value: IsoDate | undefined;
  onChange: (value: IsoDate) => void;
  /** `view` — выходные выбираются, `book` — нет. */
  mode: "view" | "book";
  range: DatePickerRange;
  trigger: DatePickerTriggerKind;
  /** Готовая подпись выбранной даты: «Ср, 7 октября». */
  valueText: string;
  disabled?: boolean;
};

const TRIGGER_BASE_CN = cn(
  "inline-flex shrink-0 items-center rounded-m border border-grey-20 bg-white bg-clip-padding text-grey-100",
  "whitespace-nowrap transition-all hover:bg-grey-10 focus-ring disabled:pointer-events-none",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

const FIELD_CN = cn(
  TRIGGER_BASE_CN,
  "h-11 w-full justify-start gap-2 px-3 text-body md:h-10",
  "aria-expanded:border-accent data-invalid:border-danger disabled:bg-grey-10 disabled:text-grey-50",
);

const BUTTON_CN = cn(TRIGGER_BASE_CN, "size-11 justify-center aria-expanded:bg-grey-10 disabled:opacity-50 md:size-10");

const CONTENT_CN = cn(
  "z-50 flex w-auto origin-(--radix-popover-content-transform-origin) flex-col gap-4 rounded-m border border-grey-20",
  "bg-white p-0 text-small text-grey-100 shadow-1 outline-hidden duration-150 motion-reduce:animate-none",
  "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
  "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
  "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
);

/** Кнопка-поле и календарь в поповере (не модальное окно). Esc закрывает и возвращает фокус на триггер. */
export function DatePicker({ value, onChange, mode, range, trigger, valueText, disabled = false }: DatePickerProps) {
  const label = trigger.kind === "field" ? trigger.label : undefined;
  const error = trigger.kind === "field" ? trigger.error : undefined;
  const [open, setOpen] = useState(false);
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = error !== undefined;
  const invalid = hasError || undefined;
  const describedBy = hasError ? errorId : undefined;
  const hasLabel = label !== undefined;

  const selected = value === undefined ? undefined : fromIsoDate(value);
  const todayDate = fromIsoDate(range.today);
  const min = fromIsoDate(range.min);
  const max = fromIsoDate(range.max);
  const outOfHorizon: Matcher[] = [{ before: min }, { after: max }];
  const weekendMatcher = (date: Date) => range.isWeekend(toIsoDate(date));
  const disabledDays = mode === "book" ? [...outOfHorizon, weekendMatcher] : outOfHorizon;
  const modifiers = { outOfHorizon, weekend: weekendMatcher };

  const handleSelect = (date: Date) => {
    onChange(toIsoDate(date));
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Gate when={hasLabel}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
      </Gate>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild disabled={disabled}>
          <DatePickerTrigger
            id={id}
            kind={trigger.kind}
            valueText={valueText}
            invalid={invalid}
            describedBy={describedBy}
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content data-slot="popover-content" align="start" sideOffset={4} className={CONTENT_CN}>
            <DatePickerCalendar
              selected={selected}
              onSelect={handleSelect}
              today={todayDate}
              startMonth={min}
              endMonth={max}
              disabled={disabledDays}
              modifiers={modifiers}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <Gate when={hasError}>
        <p id={errorId} className="text-caption text-danger">
          {error}
        </p>
      </Gate>
    </div>
  );
}

type DatePickerTriggerProps = {
  id: string;
  kind: DatePickerTriggerKind["kind"];
  valueText: string;
  invalid: true | undefined;
  describedBy: string | undefined;
};

/** Триггер поповера: Radix передаёт сюда ref и обработчики через `asChild`. */
function DatePickerTrigger({ id, kind, valueText, invalid, describedBy, ...radixProps }: DatePickerTriggerProps) {
  if (kind === "button") {
    return (
      <button
        {...radixProps}
        id={id}
        type="button"
        data-slot="button"
        aria-label={TEXTS.calendar.pickDate}
        className={BUTTON_CN}
      >
        <CalendarIcon aria-hidden className="size-5" />
      </button>
    );
  }

  // Роль button не поддерживает aria-invalid: ошибка читается через aria-describedby, рамка — по data-invalid.
  return (
    <button
      {...radixProps}
      id={id}
      type="button"
      data-slot="button"
      data-invalid={invalid}
      aria-describedby={describedBy}
      className={FIELD_CN}
    >
      <CalendarIcon aria-hidden className="size-4 text-grey-50" />
      <span className="truncate">{valueText}</span>
    </button>
  );
}
