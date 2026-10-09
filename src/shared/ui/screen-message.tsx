import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type ScreenMessageProps = {
  text: string;
  action: ReactNode;
  className?: string;
};

/** Сообщение на весь экран вместо содержимого: «переговорная не найдена», «настройки не загрузились». */
export function ScreenMessage({ text, action, className }: ScreenMessageProps) {
  const rootCn = cn("flex min-h-dvh flex-col items-center justify-center gap-4 px-4 py-16 text-center", className);

  return (
    <div className={rootCn}>
      <p className="max-w-80 text-body text-grey-100">{text}</p>
      {action}
    </div>
  );
}
