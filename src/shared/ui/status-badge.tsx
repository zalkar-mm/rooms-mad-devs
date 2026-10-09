import { cva } from "class-variance-authority";
import { Clock } from "lucide-react";

import { TEXTS } from "../consts/texts";
import { cn } from "../lib/cn";

import { Gate } from "./gate";

export type StatusBadgeVariant = "future" | "ongoing" | "past" | "weekend" | "today";

export type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  className?: string;
};

const statusBadgeVariants = cva(
  "inline-flex h-5 shrink-0 items-center gap-1 rounded-s px-2 text-caption font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        future: "bg-accent-subtle text-accent",
        ongoing: "bg-accent text-on-accent",
        past: "bg-grey-10 text-grey-50",
        weekend: "bg-grey-10 text-grey-50",
        today: "bg-accent-subtle text-accent",
      },
    },
  },
);

export function StatusBadge({ variant, className }: StatusBadgeProps) {
  const rootCn = cn(statusBadgeVariants({ variant }), className);
  const isOngoing = variant === "ongoing";

  return (
    <span className={rootCn}>
      <Gate when={isOngoing}>
        <Clock aria-hidden className="size-3" />
      </Gate>
      {TEXTS.common.badge[variant]}
    </span>
  );
}
