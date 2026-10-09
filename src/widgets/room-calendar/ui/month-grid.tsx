import { TEXTS } from "@/shared/consts/texts";
import { formatWeekdayShort } from "@/shared/lib/time/format";
import type { IsoDate } from "@/shared/lib/time/types";
import { HScroll } from "@/shared/ui/h-scroll";

import type { MonthCellView } from "../lib/build-month";

import { MonthDayCell } from "./month-day-cell";

export type MonthGridProps = {
  cells: readonly MonthCellView[];
  onOpenDay: (date: IsoDate) => void;
};

/** Вид «Месяц» (D27): недели с понедельника, не уже 840 px с прокруткой внутри (D28). Только обзор. */
export function MonthGrid({ cells, onOpenDay }: MonthGridProps) {
  const weekdays = cells.slice(0, 7).map((cell) => ({ key: cell.date, text: formatWeekdayShort(cell.date) }));

  return (
    <HScroll label={TEXTS.calendar.views.month}>
      <div aria-hidden className="grid grid-cols-7 bg-white">
        {weekdays.map((weekday) => (
          <div key={weekday.key} className="flex h-10 items-center justify-center text-small text-grey-50">
            {weekday.text}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 border-r border-b border-grey-20 bg-white">
        {cells.map((cell) => (
          <MonthCell key={cell.date} cell={cell} onOpenDay={onOpenDay} />
        ))}
      </div>
    </HScroll>
  );
}

function MonthCell({ cell, onOpenDay }: { cell: MonthCellView; onOpenDay: (date: IsoDate) => void }) {
  const handleOpen = () => {
    onOpenDay(cell.date);
  };

  return (
    <MonthDayCell
      dayNumber={cell.dayNumber}
      state={cell.state}
      lines={cell.lines}
      moreText={cell.moreText}
      onOpenDay={handleOpen}
      ariaLabel={cell.ariaLabel}
    />
  );
}
