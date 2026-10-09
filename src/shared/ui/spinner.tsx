import { Loader2 } from "lucide-react";

import { cn } from "../lib/cn";

export type SpinnerProps = {
  className?: string;
};

/** Индикатор загрузки 16 px. При `prefers-reduced-motion` не вращается. */
export function Spinner({ className }: SpinnerProps) {
  const rootCn = cn("size-4 shrink-0 motion-safe:animate-spin", className);
  return <Loader2 aria-hidden className={rootCn} />;
}
