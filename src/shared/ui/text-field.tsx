import { type ComponentProps, useId } from "react";

import { clsx } from "clsx";

import { cn } from "../lib/cn";

import { FieldLabel } from "./field-label";
import { Gate } from "./gate";

export type TextFieldProps = Omit<ComponentProps<"input">, "className" | "maxLength" | "size"> & {
  label: string;
  error?: string;
  /** Готовая подпись счётчика: «12 из 60». */
  counter?: string;
  /** Только для подсветки счётчика: ввод не обрезается. */
  maxLength?: number;
  className?: string;
};

/** Поле названия брони. Совместимо с react-hook-form: `ref`, `name`, `onChange`, `onBlur` уходят в `input`. */
export function TextField({ label, error, counter, maxLength, className, value, ...inputProps }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const counterId = `${id}-counter`;
  const hasError = error !== undefined;
  const ariaInvalid = hasError || undefined;
  const hasCounter = counter !== undefined;
  const hasHint = hasError || hasCounter;
  const exceeded = typeof value === "string" && maxLength !== undefined && value.length > maxLength;
  const describedBy = clsx(hasError && errorId, hasCounter && counterId) || undefined;

  const rootCn = cn("flex flex-col gap-2", className);
  const inputCn = cn(
    "h-11 w-full min-w-0 rounded-m border border-grey-20 bg-white px-3 py-1 text-body text-grey-100 md:h-10",
    "transition-[color,box-shadow] placeholder:text-grey-50 focus-ring focus-visible:border-accent",
    "aria-invalid:border-danger disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-grey-10 disabled:text-grey-50",
  );
  const counterCn = cn("ml-auto text-caption text-grey-50 tabular-nums", exceeded && "text-danger");

  return (
    <div className={rootCn}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        {...inputProps}
        id={id}
        data-slot="input"
        value={value}
        aria-invalid={ariaInvalid}
        aria-describedby={describedBy}
        className={inputCn}
      />
      <Gate when={hasHint}>
        <div className="flex gap-2">
          <Gate when={hasError}>
            <p id={errorId} className="text-caption text-danger">
              {error}
            </p>
          </Gate>
          <Gate when={hasCounter}>
            <p id={counterId} className={counterCn}>
              {counter}
            </p>
          </Gate>
        </div>
      </Gate>
    </div>
  );
}
