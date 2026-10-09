import { cn } from "@/shared/lib/cn";

import { ROW_HEIGHT_CN, type SlotDensity } from "../lib/grid-view";

export type TimeColumnProps = {
  /** Подписи границ слотов: 09:00…17:30 и последней строкой 18:00. В каком поясе — решает родитель. */
  labels: readonly string[];
  density?: SlotDensity;
};

/** Колонка времени слева от сетки, 56 px. Подпись стоит у верхней границы своей строки. */
export function TimeColumn({ labels, density = "default" }: TimeColumnProps) {
  const rowLabels = labels.slice(0, -1);
  const lastLabel = labels.at(-1);
  const rowCn = cn("pr-2 text-right", ROW_HEIGHT_CN[density]);

  return (
    <div aria-hidden className="relative w-14 shrink-0 bg-white text-caption text-grey-50 tabular-nums">
      {rowLabels.map((label) => (
        <div key={label} className={rowCn}>
          {label}
        </div>
      ))}
      <div className="absolute right-2 bottom-0 translate-y-full">{lastLabel}</div>
    </div>
  );
}
