import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type ChipProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

/** Подсказка названия: 32 px, 44 px на ширине < 768. */
export function Chip({ children, onClick, disabled = false, className }: ChipProps) {
  const rootCn = cn(
    "inline-flex h-11 shrink-0 items-center justify-center rounded-m border border-grey-20 bg-white bg-clip-padding px-3",
    "text-small text-grey-100 whitespace-nowrap transition-all md:h-8 hover:bg-grey-10 focus-ring",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-grey-50",
    className,
  );

  return (
    <button type="button" data-slot="button" disabled={disabled} onClick={onClick} className={rootCn}>
      {children}
    </button>
  );
}
