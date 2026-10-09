import type { ReactNode } from "react";

import { cn } from "../lib/cn";

import { Gate } from "./gate";

export type EmptyStateProps = {
  text: string;
  action?: ReactNode;
  /** Поверх пустой сетки: клики проходят в сетку везде, кроме самого блока. */
  overlay?: boolean;
  className?: string;
};

export function EmptyState({ text, action, overlay = false, className }: EmptyStateProps) {
  const hasAction = action !== undefined;
  const rootCn = cn(
    "flex justify-center p-4",
    overlay && "pointer-events-none absolute inset-0 z-30 items-center",
    !overlay && "py-8",
    className,
  );
  const blockCn = cn(
    "flex max-w-80 flex-col items-center gap-3 text-center",
    overlay && "pointer-events-auto rounded-m bg-white/90 p-4",
  );

  return (
    <div className={rootCn}>
      <div className={blockCn}>
        <p className="text-body text-grey-50">{text}</p>
        <Gate when={hasAction}>{action}</Gate>
      </div>
    </div>
  );
}
