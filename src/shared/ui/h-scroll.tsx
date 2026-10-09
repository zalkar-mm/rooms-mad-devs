import { type ReactNode, type RefObject, useEffect, useRef } from "react";

import { cn } from "../lib/cn";

import { Gate } from "./gate";

export type HScrollProps = {
  /** `aria-label` области: «Сетка недели». */
  label: string;
  children: ReactNode;
  /** Колонка времени, закреплена слева. */
  stickyLeft?: ReactNode;
  /** Элемент, к которому прокрутить при монтировании и при смене `scrollKey` (сегодняшняя колонка). */
  scrollToRef?: RefObject<HTMLElement | null>;
  /** Меняется вместе с периодом — тогда прокрутка повторяется. */
  scrollKey?: string;
  className?: string;
};

/**
 * Горизонтальная прокрутка «Недели» и «Месяца» уже 840 px (SPEC §11): прокручивается только содержимое.
 * Ширина 840 — фиксированная, из спеки; инлайн-размеры в ките разрешены только броням.
 */
export function HScroll({ label, children, stickyLeft, scrollToRef, scrollKey, className }: HScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasStickyLeft = stickyLeft !== undefined;
  const rootCn = cn("max-w-full overflow-x-auto focus-ring-inset", className);

  useEffect(() => {
    const container = containerRef.current;
    const target = scrollToRef?.current;
    if (!container || !target) return;
    // Центрируем по горизонтали сами: scrollIntoView прокрутил бы и страницу по вертикали.
    const containerBox = container.getBoundingClientRect();
    const targetBox = target.getBoundingClientRect();
    container.scrollLeft += targetBox.left - containerBox.left - (containerBox.width - targetBox.width) / 2;
  }, [scrollToRef, scrollKey]);

  return (
    // Прокручиваемая область должна получать фокус, чтобы листать её с клавиатуры (WCAG 2.1.1).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div ref={containerRef} role="region" aria-label={label} tabIndex={0} className={rootCn}>
      <div className="flex min-w-210">
        <Gate when={hasStickyLeft}>
          <div className="sticky left-0 z-20 shrink-0 border-r border-grey-20 bg-white">{stickyLeft}</div>
        </Gate>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
