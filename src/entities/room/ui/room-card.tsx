import { Link } from "react-router";

import { cn } from "@/shared/lib/cn";
import { Gate } from "@/shared/ui/gate";
import { RetryButton } from "@/shared/ui/retry-button";

export type RoomNowTone = "free" | "busy" | "off";

export type RoomCardProps = {
  name: string;
  /** Путь собирает родитель через `ROUTES.ROOM(id)`. */
  href: string;
  now: { tone: RoomNowTone; text: string };
  /** «В ближайший час:» или «В ближайший час: свободна». */
  nextHourLabel: string;
  /** До трёх строк «14:30–15:00 · Встреча». */
  nextHour: readonly string[];
  /** Для нерабочего времени: «Откроется завтра в 09:00». */
  opensText?: string;
  /** Брони не загрузились: вместо двух строк статуса — текст и «Повторить». */
  error?: { text: string; onRetry: () => void };
};

const NOW_TONE: Record<RoomNowTone, { dot: string; text: string }> = {
  free: { dot: "bg-success", text: "text-success" },
  busy: { dot: "bg-danger", text: "text-danger" },
  off: { dot: "bg-grey-50", text: "text-grey-50" },
};

const LINK_CN = cn(
  "text-body font-semibold text-grey-100 focus-visible:outline-none",
  "after:absolute after:inset-0 after:rounded-m",
  "focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent",
);

/** Карточка комнаты: вся карточка — одна ссылка, «Повторить» лежит над ней по z-index. */
export function RoomCard({ name, href, now, nextHourLabel, nextHour, opensText, error }: RoomCardProps) {
  const tone = NOW_TONE[now.tone];
  const hasError = error !== undefined;
  const hasOpensText = opensText !== undefined;
  const linkLabel = [name, error?.text ?? now.text, hasError ? undefined : opensText].filter(Boolean).join(". ");
  const dotCn = cn("size-2 shrink-0 rounded-full", tone.dot);
  const nowCn = cn("text-small tabular-nums", tone.text);

  return (
    <article className="relative flex flex-col gap-2 rounded-m border border-grey-20 bg-white p-4 transition-shadow hover:border-grey-40 hover:shadow-1">
      <Link to={href} aria-label={linkLabel} className={LINK_CN}>
        {name}
      </Link>
      <Gate when={hasError}>
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <p className="text-small text-grey-50">{error?.text}</p>
          <OptionalRetry onRetry={error?.onRetry} />
        </div>
      </Gate>
      <Gate when={!hasError}>
        <p className="flex items-center gap-2">
          <span aria-hidden className={dotCn} />
          <span className={nowCn}>{now.text}</span>
        </p>
        <div className="text-small text-grey-50 tabular-nums">
          <p>{nextHourLabel}</p>
          {nextHour.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <Gate when={hasOpensText}>
          <p className="text-small text-grey-50">{opensText}</p>
        </Gate>
      </Gate>
    </article>
  );
}

function OptionalRetry({ onRetry }: { onRetry: (() => void) | undefined }) {
  if (!onRetry) return null;
  return <RetryButton onRetry={onRetry} />;
}
