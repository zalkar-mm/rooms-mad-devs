import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export type KitCaseProps = {
  /** Служебная подпись состояния. */
  label: string;
  /** Принудительное состояние через data-state на обёртке (варианты hover/focus-visible в index.css). */
  state?: "hover" | "focus";
  children: ReactNode;
  className?: string;
};

export function KitCase({ label, state, children, className }: KitCaseProps) {
  const rootCn = cn("flex min-w-0 flex-col gap-2", className);

  return (
    <figure className={rootCn}>
      <figcaption className="text-caption text-grey-50">{label}</figcaption>
      <div data-state={state}>{children}</div>
    </figure>
  );
}
