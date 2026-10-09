import { cn } from "@/shared/lib/cn";
import { Gate } from "@/shared/ui/gate";
import { StatusBadge } from "@/shared/ui/status-badge";

import type { DayHeaderState } from "../lib/grid-view";

export type DayHeaderProps = {
  /** «Пн 5». */
  text: string;
  state: DayHeaderState;
};

const STATE_CN: Record<DayHeaderState, string> = {
  normal: "border-grey-20 text-grey-100",
  today: "border-b-2 border-accent font-semibold text-accent",
  weekend: "border-grey-20 text-grey-50",
  outOfHorizon: "border-grey-20 text-grey-50",
};

/** Заголовок колонки недели, 40 px, колонка не уже 112 px. */
export function DayHeader({ text, state }: DayHeaderProps) {
  const isWeekend = state === "weekend";
  const rootCn = cn(
    "flex h-10 min-w-28 items-center justify-center gap-1 border-b bg-white px-2 text-small whitespace-nowrap",
    STATE_CN[state],
  );

  return (
    <div className={rootCn}>
      <span>{text}</span>
      <Gate when={isWeekend}>
        <StatusBadge variant="weekend" />
      </Gate>
    </div>
  );
}
