import { useId } from "react";

import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "../lib/cn";

import { FieldLabel } from "./field-label";

export type SwitchProps = {
  /** Видимая подпись справа; клик по ней переключает. */
  label: string;
  /** Доступное имя, если подписи мало: начинается с видимой подписи (WCAG 2.5.3). */
  ariaLabel?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
};

const TRACK_CN = cn(
  "peer relative inline-flex h-4.5 w-8 shrink-0 items-center rounded-full border border-transparent transition-all focus-ring",
  // Невидимое расширение зоны нажатия вокруг дорожки.
  "after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-accent",
  "data-checked:bg-accent data-unchecked:bg-grey-20 hover:data-checked:bg-accent-hover hover:data-unchecked:bg-grey-40",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50",
);

const THUMB_CN = cn(
  "pointer-events-none block size-4 rounded-full bg-grey-10 transition-transform",
  "data-checked:translate-x-3.5 data-unchecked:translate-x-0",
);

const LABEL_CN = "cursor-pointer font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-50";

export function Switch({ label, ariaLabel, checked, onCheckedChange, disabled = false, className }: SwitchProps) {
  const id = useId();
  const rootCn = cn("inline-flex min-h-11 items-center gap-2", className);

  return (
    <div className={rootCn}>
      <SwitchPrimitive.Root
        id={id}
        aria-label={ariaLabel}
        data-slot="switch"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={TRACK_CN}
      >
        <SwitchPrimitive.Thumb data-slot="switch-thumb" className={THUMB_CN} />
      </SwitchPrimitive.Root>
      <FieldLabel htmlFor={id} className={LABEL_CN}>
        {label}
      </FieldLabel>
    </div>
  );
}
