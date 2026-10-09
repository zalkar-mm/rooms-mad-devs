import { cn } from "../lib/cn";

export type SkeletonProps = {
  className?: string;
};

/** Заготовка grey-20 с мерцанием. Контейнер, который её показывает, ставит `aria-busy="true"`. */
export function Skeleton({ className }: SkeletonProps) {
  const rootCn = cn("rounded-s bg-grey-20 motion-safe:animate-shimmer", className);
  return <div data-slot="skeleton" aria-hidden className={rootCn} />;
}
