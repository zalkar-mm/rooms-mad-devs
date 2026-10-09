import type { KeyboardEvent } from "react";

import { cn } from "@/shared/lib/cn";
import { Gate } from "@/shared/ui/gate";

import type { MonthDayLine, MonthDayState } from "../lib/grid-view";

export type MonthDayCellProps = {
  dayNumber: number;
  state: MonthDayState;
  /** До трёх броней «10:00 Созвон». */
  lines: readonly MonthDayLine[];
  /** «ещё 2». */
  moreText?: string;
  onOpenDay: () => void;
  /** «Среда 7 октября, 3 брони». */
  ariaLabel: string;
};

const STATE_CN: Record<MonthDayState, string> = {
  normal: "bg-white",
  today: "bg-white",
  weekend: "bg-grey-10",
  otherMonth: "bg-white text-grey-50",
  outOfHorizon: "bg-hatch text-grey-50",
};

/** Ячейка дня в виде «Месяц»: только обзор, нажатие открывает день (D27). Создания нет. */
export function MonthDayCell({ dayNumber, state, lines, moreText, onOpenDay, ariaLabel }: MonthDayCellProps) {
  const isEnabled = state !== "outOfHorizon";
  const tabIndex = isEnabled ? 0 : -1;
  const ariaDisabled = !isEnabled || undefined;
  const hasMore = moreText !== undefined;
  const rootCn = cn(
    "flex h-24 min-w-0 flex-col gap-1 overflow-hidden border-t border-l border-grey-20 p-2 md:h-28",
    STATE_CN[state],
    isEnabled && "cursor-pointer hover:bg-accent-subtle focus-ring-inset",
  );
  const numberCn = cn(
    "flex size-6 shrink-0 items-center justify-center rounded-full text-small tabular-nums",
    state === "today" && "bg-accent font-semibold text-on-accent",
  );

  const handleClick = () => {
    if (isEnabled) onOpenDay();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isEnabled || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onOpenDay();
  };

  return (
    <div
      role="button"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={rootCn}
    >
      <span className={numberCn}>{dayNumber}</span>
      <ul aria-hidden className="flex min-w-0 flex-col">
        {lines.map((line) => (
          <MonthDayLineItem key={line.id} line={line} />
        ))}
      </ul>
      <Gate when={hasMore}>
        <span aria-hidden className="text-caption text-accent">
          {moreText}
        </span>
      </Gate>
    </div>
  );
}

function MonthDayLineItem({ line }: { line: MonthDayLine }) {
  const lineCn = cn("truncate text-caption tabular-nums", line.past && "text-grey-50");
  return (
    <li className={lineCn}>
      {line.time} {line.title}
    </li>
  );
}
