import type { KeyboardEvent } from "react";

import { Clock } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Gate } from "@/shared/ui/gate";
import { StatusBadge } from "@/shared/ui/status-badge";

import type { BookingStatus } from "../lib/booking-status";

/** Вид блока: выбранная в панели, конфликтующая после `409` (D13), на 30 минут — в одну строку. */
export type BookingBlockMarks = { selected?: boolean; conflict?: boolean; compact?: boolean };

export type BookingBlockProps = {
  /** `id` брони — в `data-booking-id`: по нему сетка переводит фокус на созданную бронь (SPEC §12). */
  bookingId: string;
  /** Позиция и высота в px — считает сетка. */
  position: { top: number; height: number };
  title: string;
  /** «10:00–11:00»; в `compact` — начало «10:00». */
  timeText: string;
  /** Статус брони (D6, D25) — вычисляет родитель. */
  status: BookingStatus;
  marks?: BookingBlockMarks;
  onOpen: () => void;
  /** «Созвон, среда 7 октября, с 10:00 до 11:00, будущая». */
  ariaLabel: string;
};

const STATUS_CN: Record<BookingStatus, string> = {
  future: "border-accent bg-accent-subtle text-grey-100 hover:shadow-1",
  ongoing: "border-accent bg-accent-subtle text-grey-100",
  past: "border-grey-40 bg-grey-10 text-grey-50",
};

export function BookingBlock({
  bookingId,
  position,
  title,
  timeText,
  status,
  marks = {},
  onOpen,
  ariaLabel,
}: BookingBlockProps) {
  const { selected = false, conflict = false, compact = false } = marks;
  const isOngoing = status === "ongoing";
  const blockCn = cn(
    "flex h-full cursor-pointer overflow-hidden rounded-s border-l-3 px-2 focus-ring-inset",
    compact && "items-center gap-1",
    !compact && "flex-col py-1",
    STATUS_CN[status],
    selected && "ring-2 ring-accent ring-inset",
    conflict && "border-danger bg-danger-subtle text-grey-100 ring-2 ring-danger ring-inset",
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onOpen();
  };

  return (
    // Отступ 1 px сверху и снизу: касающиеся брони 10:00–11:00 и 11:00–12:00 разделены зазором.
    <div className="absolute inset-x-0.5 z-20 py-px" style={position}>
      <div
        role="button"
        tabIndex={0}
        data-booking-id={bookingId}
        aria-label={ariaLabel}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className={blockCn}
      >
        <Gate when={compact}>
          <span className="min-w-10 truncate text-caption font-semibold">{title}</span>
          <span className="shrink-0 text-caption tabular-nums">· {timeText}</span>
          <Gate when={isOngoing}>
            <Clock aria-hidden className="ml-auto size-3 shrink-0 text-accent" />
          </Gate>
        </Gate>
        <Gate when={!compact}>
          <span className="flex items-start gap-1">
            <span className="min-w-0 flex-1 truncate text-small font-semibold">{title}</span>
            <Gate when={isOngoing}>
              <StatusBadge variant="ongoing" />
            </Gate>
          </span>
          <span className="text-caption tabular-nums">{timeText}</span>
        </Gate>
      </div>
    </div>
  );
}
