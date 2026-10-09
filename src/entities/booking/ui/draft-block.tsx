import { cn } from "@/shared/lib/cn";

export type DraftBlockProps = {
  top: number;
  height: number;
  timeText: string;
  /** Протягивание упёрлось в 2 часа: под блоком подпись `limitText`. */
  atLimit?: boolean;
  limitText?: string;
  conflict?: boolean;
};

/** Несохранённая бронь в сетке. Не фокусируется: фокус в форме панели. */
export function DraftBlock({ top, height, timeText, atLimit = false, limitText, conflict = false }: DraftBlockProps) {
  const position = { top, height };
  // Live-регион смонтирован всегда, меняется только текст: так подпись гарантированно объявляется.
  const limitLabel = atLimit ? limitText : undefined;
  const blockCn = cn(
    "h-full rounded-s border-2 border-dashed border-accent bg-white px-2 py-1 text-caption text-grey-100 tabular-nums",
    conflict && "border-danger",
  );
  const limitCn = cn(
    "absolute top-full left-0 mt-1 text-caption text-grey-100",
    atLimit && "rounded-s bg-white px-1 shadow-1",
  );

  return (
    <div className="pointer-events-none absolute inset-x-0.5 z-20 py-px" style={position}>
      <div className={blockCn}>{timeText}</div>
      <p aria-live="polite" className={limitCn}>
        {limitLabel}
      </p>
    </div>
  );
}
