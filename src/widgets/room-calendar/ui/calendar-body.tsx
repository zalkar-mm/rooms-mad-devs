import type { ReactNode } from "react";

import { TEXTS } from "@/shared/consts/texts";
import { assertNever } from "@/shared/lib/assert-never";
import type { IsoDate } from "@/shared/lib/time/types";
import { EmptyState } from "@/shared/ui/empty-state";
import { Gate } from "@/shared/ui/gate";
import { RetryNotice } from "@/shared/ui/retry-notice";

import type { DayNote } from "../lib/build-column";
import type { MonthCellView } from "../lib/build-month";
import type { PeriodView } from "../lib/build-period";
import type { CalendarView } from "../lib/grid-view";

import { GridSkeleton, type GridSkeletonShape } from "./grid-skeleton";
import { MonthGrid } from "./month-grid";
import { type GridAppearance, type GridHandlers, TimeGrid, type TimeGridProps } from "./time-grid";

export type CalendarBodyProps = {
  period: PeriodView;
  /** Брони периода не загрузились (первая загрузка или обновление). */
  failed: boolean;
  onRetry: () => void;
  grid: GridAppearance & {
    /** Размер заготовки до прихода броней. */
    skeletonShape: GridSkeletonShape;
  };
  handlers: GridHandlers & {
    /** Месяц: нажатие на день открывает «День» (D27). */
    onOpenDay: (date: IsoDate) => void;
  };
};

const NOTE_TEXT: Record<Exclude<DayNote, null>, string> = {
  weekend: TEXTS.calendar.weekend,
  todayClosed: TEXTS.calendar.todayClosed,
  emptyPast: TEXTS.calendar.emptyPastDay,
  empty: TEXTS.calendar.emptyDay,
};

/** Сетка периода в состояниях SPEC §8, T03 §5: заготовка, сбой с «Повторить», данные, пустой день. */
export function CalendarBody({ period, failed, onRetry, grid, handlers }: CalendarBodyProps) {
  const failure = <RetryNotice text={TEXTS.calendar.loadFailed} onRetry={onRetry} className="m-4" />;
  // Сбой обновления при уже показанных бронях: сообщение над сеткой, брони остаются.
  const notice = <Gate when={failed}>{failure}</Gate>;

  switch (period.kind) {
    case "loading":
      return <LoadingBody failure={failure} failed={failed} view={period.view} grid={grid} />;
    case "month":
      return <MonthBody cells={period.cells} onOpenDay={handlers.onOpenDay} notice={notice} />;
    case "grid":
      return (
        <TimeGridBody columns={period.columns} view={period.view} notice={notice} grid={grid} handlers={handlers} />
      );
    default:
      return assertNever(period);
  }
}

type LoadingBodyProps = Pick<CalendarBodyProps, "failed" | "grid"> & { failure: ReactNode; view: CalendarView };

/** Броней периода ещё нет: заготовка, а при сбое первой загрузки — сообщение с «Повторить». */
function LoadingBody({ failure, failed, view, grid }: LoadingBodyProps) {
  if (failed) return <>{failure}</>;
  return (
    <div aria-busy="true">
      <GridSkeleton variant={view} shape={grid.skeletonShape} density={grid.density} />
    </div>
  );
}

type MonthBodyProps = {
  cells: readonly MonthCellView[];
  onOpenDay: (date: IsoDate) => void;
  notice: ReactNode;
};

function MonthBody({ cells, onOpenDay, notice }: MonthBodyProps) {
  const isEmpty = cells.every((cell) => cell.lines.length === 0);
  const monthNote = isEmpty ? TEXTS.calendar.emptyMonth : undefined;
  return (
    <>
      {notice}
      <div className="relative">
        <MonthGrid cells={cells} onOpenDay={onOpenDay} />
        <OptionalNote text={monthNote} />
      </div>
    </>
  );
}

type TimeGridBodyProps = Pick<TimeGridProps, "columns" | "grid" | "handlers"> & {
  view: "day" | "week";
  notice: ReactNode;
};

function TimeGridBody({ columns, view, notice, grid, handlers }: TimeGridBodyProps) {
  // Тексты дня (SPEC §10) — только в виде «День»: для недели их нет (T04, открытый вопрос 1).
  const note = view === "day" ? columns[0]?.note : null;
  const noteText = note === null || note === undefined ? undefined : NOTE_TEXT[note];

  return (
    <>
      {notice}
      <div className="relative">
        <TimeGrid columns={columns} grid={grid} handlers={handlers} />
        <OptionalNote text={noteText} />
      </div>
    </>
  );
}

function OptionalNote({ text }: { text: string | undefined }) {
  if (text === undefined) return null;
  // Над колонками дней: колонка времени (w-14) остаётся читаемой; в месяце её нет — отступ не мешает.
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 left-14">
      <EmptyState text={text} overlay />
    </div>
  );
}
