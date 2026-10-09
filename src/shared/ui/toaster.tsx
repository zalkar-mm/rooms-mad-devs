import type { CSSProperties } from "react";

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const ICONS: ToasterProps["icons"] = {
  success: <CircleCheckIcon aria-hidden className="size-4" />,
  info: <InfoIcon aria-hidden className="size-4" />,
  warning: <TriangleAlertIcon aria-hidden className="size-4" />,
  error: <OctagonXIcon aria-hidden className="size-4" />,
  loading: <Loader2Icon aria-hidden className="size-4 animate-spin" />,
};

/**
 * Цвета тоста — токены. Тема sonner задаёт эти переменные селектором по атрибутам, и перекрыть их можно
 * только инлайн-стилем на хосте: это единственный статический `style` в ките.
 */
const THEME_STYLE: CSSProperties & Record<`--${string}`, string> = {
  "--normal-bg": "var(--color-white)",
  "--normal-text": "var(--color-grey-100)",
  "--normal-border": "var(--color-grey-20)",
  "--border-radius": "var(--radius-m)",
};

/** Хост тостов, монтируется один раз в `app/app.tsx`. Тёмной темы нет. Тосты вызываются только через `notify`. */
export function Toaster() {
  return <Sonner theme="light" icons={ICONS} style={THEME_STYLE} />;
}
