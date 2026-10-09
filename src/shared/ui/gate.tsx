import type { ReactNode } from "react";

export type GateProps = {
  when: boolean;
  children: ReactNode;
  fallback?: ReactNode;
};

/** Условный рендер без тернарок и `&&` в JSX (docs/code-style.md §4). */
export function Gate({ when, children, fallback = null }: GateProps) {
  if (!when) return <>{fallback}</>;
  return <>{children}</>;
}
