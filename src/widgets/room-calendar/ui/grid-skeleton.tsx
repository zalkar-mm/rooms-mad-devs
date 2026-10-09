import { cn } from "@/shared/lib/cn";
import { Skeleton } from "@/shared/ui/skeleton";

import { ROW_HEIGHT_CN, type SlotDensity } from "../lib/grid-view";

export type GridSkeletonVariant = "day" | "week" | "month";

/** Размер заготовки: слоты рабочего дня из настроек и ячейки сетки месяца. */
export type GridSkeletonShape = { rows: number; cells: number };

export type GridSkeletonProps = {
  variant: GridSkeletonVariant;
  shape: GridSkeletonShape;
  density: SlotDensity;
};

const WEEK_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Заготовки броней по колонкам: условные серые блоки, их позиции — классы шкалы. */
const BLOCKS_BY_COLUMN: Record<string, string[]> = {
  mon: ["absolute inset-x-0.5 top-8 h-16", "absolute inset-x-0.5 top-40 h-8"],
  wed: ["absolute inset-x-0.5 top-24 h-24"],
  thu: ["absolute inset-x-0.5 top-64 h-16"],
  fri: ["absolute inset-x-0.5 top-16 h-8", "absolute inset-x-0.5 top-48 h-16"],
};

const keysOf = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, index) => `${prefix}-${String(index)}`);

/** Заготовка сетки на время первой загрузки периода (D16): та же геометрия, линии и серые блоки. */
export function GridSkeleton({ variant, shape, density }: GridSkeletonProps) {
  if (variant === "month") return <MonthSkeleton cells={shape.cells} />;

  const isWeek = variant === "week";
  const columns = isWeek ? WEEK_DAYS : ["mon"];
  const rows = keysOf("row", shape.rows);

  return (
    <div aria-hidden className="flex bg-white">
      <div className="w-14 shrink-0" />
      {columns.map((column) => (
        <SkeletonColumn key={column} column={column} rows={rows} density={density} withHeader={isWeek} />
      ))}
    </div>
  );
}

function MonthSkeleton({ cells }: { cells: number }) {
  return (
    <div aria-hidden className="grid grid-cols-7 border-r border-b border-grey-20 bg-white">
      {keysOf("cell", cells).map((key) => (
        <div key={key} className="flex h-24 flex-col gap-2 border-t border-l border-grey-20 p-2 md:h-28">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

type SkeletonColumnProps = { column: string; rows: readonly string[]; density: SlotDensity; withHeader: boolean };

function SkeletonColumn({ column, rows, density, withHeader }: SkeletonColumnProps) {
  const headerCn = cn("flex h-10 items-center justify-center border-b border-grey-20", !withHeader && "hidden");
  const rowCn = cn("border-t border-grey-20", ROW_HEIGHT_CN[density]);
  const blocks = BLOCKS_BY_COLUMN[column] ?? [];

  return (
    <div className="min-w-28 flex-1 border-l border-grey-20">
      <div className={headerCn}>
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="relative">
        {rows.map((row) => (
          <div key={row} className={rowCn} />
        ))}
        {blocks.map((position) => (
          <Skeleton key={position} className={position} />
        ))}
      </div>
    </div>
  );
}
