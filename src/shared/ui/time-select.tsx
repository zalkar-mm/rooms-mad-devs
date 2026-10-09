import { useId } from "react";

import { CheckIcon, ChevronDownIcon, ChevronUpIcon, Clock } from "lucide-react";
import { Select } from "radix-ui";

import { cn } from "../lib/cn";
import type { HhMm } from "../lib/time/types";

import { FieldLabel } from "./field-label";
import { Gate } from "./gate";

export type TimeOption = {
  value: HhMm;
  /** Подпись, если показ отличается от значения: «Моё время» (D23). По умолчанию — само значение. */
  label?: string;
  /** Недоступное значение видно зачёркнутым, стрелки его пропускают. */
  disabled?: boolean;
};

export type TimeSelectProps = {
  label: string;
  value: HhMm | undefined;
  options: readonly TimeOption[];
  onChange: (value: HhMm) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

const TRIGGER_CN = cn(
  "flex h-11 w-full items-center justify-start gap-2 rounded-m border border-grey-20 bg-white px-3 py-2 md:h-10",
  "text-body text-grey-100 whitespace-nowrap tabular-nums transition-[color,box-shadow] focus-ring",
  "data-placeholder:text-grey-50 data-[state=open]:border-accent aria-invalid:border-danger",
  "disabled:cursor-not-allowed disabled:bg-grey-10 disabled:text-grey-50",
  "*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:flex-1",
  "*:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0",
);

// Список выровнен по выбранному значению (item-aligned): Radix позиционирует его сам, без анимации.
const CONTENT_CN = cn(
  "relative z-50 max-h-70 min-w-36 overflow-x-hidden overflow-y-auto rounded-m border border-grey-20 bg-white",
  "text-grey-100 shadow-1",
);

const SCROLL_BUTTON_CN = "z-10 flex cursor-default items-center justify-center bg-white py-1";

const ITEM_CN = cn(
  "relative flex min-h-11 w-full cursor-default items-center gap-2 rounded-s py-2 pr-8 pl-3 md:min-h-9",
  "text-body tabular-nums outline-hidden focus:bg-accent-subtle data-[state=checked]:font-semibold",
  "data-disabled:pointer-events-none data-disabled:text-grey-50 data-disabled:line-through",
);

/** Поле «Начало» / «Окончание»: значения с шагом из настроек приходят готовыми. */
export function TimeSelect({ label, value, options, onChange, error, disabled = false, className }: TimeSelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = error !== undefined;
  const describedBy = hasError ? errorId : undefined;
  const ariaInvalid = hasError || undefined;
  const rootCn = cn("flex flex-col gap-2", className);

  return (
    <div className={rootCn}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger
          id={id}
          data-slot="select-trigger"
          aria-invalid={ariaInvalid}
          aria-describedby={describedBy}
          className={TRIGGER_CN}
        >
          <Clock aria-hidden className="size-4 text-grey-50" />
          <Select.Value data-slot="select-value" />
          <Select.Icon asChild>
            <ChevronDownIcon aria-hidden className="size-4 text-grey-50" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content data-slot="select-content" className={CONTENT_CN}>
            <Select.ScrollUpButton className={SCROLL_BUTTON_CN}>
              <ChevronUpIcon aria-hidden className="size-4" />
            </Select.ScrollUpButton>
            <Select.Viewport>
              {options.map((option) => (
                <TimeSelectItem key={option.value} option={option} />
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className={SCROLL_BUTTON_CN}>
              <ChevronDownIcon aria-hidden className="size-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <Gate when={hasError}>
        <p id={errorId} className="text-caption text-danger">
          {error}
        </p>
      </Gate>
    </div>
  );
}

function TimeSelectItem({ option }: { option: TimeOption }) {
  return (
    <Select.Item data-slot="select-item" value={option.value} disabled={option.disabled} className={ITEM_CN}>
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <Select.ItemIndicator>
          <CheckIcon aria-hidden className="size-4" />
        </Select.ItemIndicator>
      </span>
      <Select.ItemText>{option.label ?? option.value}</Select.ItemText>
    </Select.Item>
  );
}
