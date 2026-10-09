import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type ActionBarProps = {
  /** Кнопки по порядку: второстепенные, основная — последней. */
  children: ReactNode;
  className?: string;
};

/**
 * Ряд кнопок панели: справа, основная последней; на ширине < 768 — столбиком на всю ширину, основная сверху.
 * Общий для футера панели, формы брони и подтверждений.
 */
export function ActionBar({ children, className }: ActionBarProps) {
  const rootCn = cn(
    "flex flex-col-reverse gap-2 *:w-full md:flex-row md:flex-wrap md:justify-end md:*:w-auto",
    className,
  );
  return <div className={rootCn}>{children}</div>;
}
