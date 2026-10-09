import type { ReactNode } from "react";

import { CircleAlert, CircleCheck, Info, type LucideIcon, TriangleAlert } from "lucide-react";

import { cn } from "../lib/cn";

import { Gate } from "./gate";

/** `warning` (409, бронь заблокирована) пока выглядит как `error`; перекрашивается одной строкой ниже. */
export type NoticeVariant = "neutral" | "warning" | "error" | "success";

export type NoticeProps = {
  variant: NoticeVariant;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

type NoticeView = { icon: LucideIcon; root: string; iconTone: string; text: string };

const NOTICE_VIEW: Record<NoticeVariant, NoticeView> = {
  neutral: { icon: Info, root: "bg-grey-10", iconTone: "text-grey-50", text: "text-grey-100" },
  warning: { icon: TriangleAlert, root: "bg-danger-subtle", iconTone: "text-danger", text: "text-grey-100" },
  error: { icon: CircleAlert, root: "bg-danger-subtle", iconTone: "text-danger", text: "text-grey-100" },
  success: { icon: CircleCheck, root: "bg-success-subtle", iconTone: "text-success", text: "text-success" },
};

/** Сообщение в панели или над сеткой. Читалке его объявляет model-хук, вызвавший статус (docs/ui.md §7). */
export function Notice({ variant, children, action, className }: NoticeProps) {
  const view = NOTICE_VIEW[variant];
  const Icon = view.icon;
  const hasAction = action !== undefined;

  const rootCn = cn("flex flex-col gap-3 rounded-m p-3 md:flex-row md:items-center", view.root, className);
  const iconCn = cn("mt-px size-4 shrink-0", view.iconTone);
  const textCn = cn("text-small", view.text);

  return (
    <div className={rootCn}>
      <div className="flex flex-1 items-start gap-2">
        <Icon aria-hidden className={iconCn} />
        <div className={textCn}>{children}</div>
      </div>
      <Gate when={hasAction}>
        <div className="shrink-0 md:ml-auto">{action}</div>
      </Gate>
    </div>
  );
}
