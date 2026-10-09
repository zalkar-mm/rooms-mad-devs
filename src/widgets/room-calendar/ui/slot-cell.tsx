import type { KeyboardEvent, PointerEvent } from "react";

import { Plus } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Gate } from "@/shared/ui/gate";

import { ROW_HEIGHT_CN, type SlotCellState, type SlotDensity } from "../lib/grid-view";

export type SlotCellProps = {
  state: SlotCellState;
  /** «Среда 7 октября, 14:00, свободно» / «…прошло» / «…выходной» / «…недоступно». */
  ariaLabel: string;
  /** Двойное нажатие или Enter на доступной ячейке. */
  onActivate?: () => void;
  /** Слот начинается в :30 — верхняя линия пунктиром. */
  halfHour?: boolean;
  density?: SlotDensity;
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerEnter?: (event: PointerEvent<HTMLDivElement>) => void;
};

/** Фон и отклик по состоянию: доступная — белая с наведением, под бронью — белая, остальные — штриховка. */
const STATE_CN: Record<SlotCellState, string> = {
  available: "cursor-pointer bg-white hover:bg-accent-subtle focus-visible:bg-accent-subtle focus-ring-inset",
  busy: "bg-white",
  past: "bg-hatch",
  weekend: "bg-hatch",
  outOfHorizon: "bg-hatch",
};

/** Ячейка 30 минут. Одиночный клик ничего не делает (D12). Фокус получают только доступные. */
export function SlotCell({
  state,
  ariaLabel,
  onActivate,
  halfHour = false,
  density = "default",
  onPointerDown,
  onPointerEnter,
}: SlotCellProps) {
  const isAvailable = state === "available";
  const tabIndex = isAvailable ? 0 : -1;
  const ariaDisabled = !isAvailable || undefined;
  const rootCn = cn(
    "group relative flex items-center justify-center border-t border-grey-20",
    ROW_HEIGHT_CN[density],
    halfHour && "border-dashed",
    STATE_CN[state],
  );

  const handleDoubleClick = () => {
    if (isAvailable) onActivate?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isAvailable || event.key !== "Enter") return;
    event.preventDefault();
    onActivate?.();
  };

  if (state === "busy") return <div aria-hidden className={rootCn} />;

  return (
    <div
      role="button"
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-disabled={ariaDisabled}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      className={rootCn}
    >
      <Gate when={isAvailable}>
        <Plus
          aria-hidden
          className="size-4 text-accent opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        />
      </Gate>
    </div>
  );
}
