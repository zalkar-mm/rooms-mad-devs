import type { ReactNode } from "react";

import { Label } from "radix-ui";

import { cn } from "../lib/cn";

export type FieldLabelProps = {
  htmlFor: string;
  children: ReactNode;
  className?: string;
};

/** Подпись поля кита (TextField, TimeSelect, DatePicker, Switch). Radix не выделяет текст при двойном клике. */
export function FieldLabel({ htmlFor, children, className }: FieldLabelProps) {
  const rootCn = cn("flex items-center gap-2 text-small font-semibold text-grey-100", className);

  return (
    <Label.Root data-slot="label" htmlFor={htmlFor} className={rootCn}>
      {children}
    </Label.Root>
  );
}
