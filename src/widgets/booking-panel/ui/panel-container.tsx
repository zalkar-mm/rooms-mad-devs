import { type ReactNode, type RefObject, useEffect, useId, useRef } from "react";

import { ArrowLeft, X } from "lucide-react";

import { TEXTS } from "@/shared/consts/texts";
import { cn } from "@/shared/lib/cn";
import { ActionBar } from "@/shared/ui/action-bar";
import { Button } from "@/shared/ui/button";
import { Gate } from "@/shared/ui/gate";
import { IconButton } from "@/shared/ui/icon-button";

/** `side` — справа от сетки (≥ 1200), `overlay` — поверх сетки на всю ширину (< 1200). */
export type PanelLayout = "side" | "overlay";

export type PanelContainerProps = {
  title: string;
  /** «Закрыть», Esc. */
  onClose: () => void;
  /** «Назад к календарю» поверх сетки; не задан — то же, что `onClose`. Черновик так не удаляется (D33). */
  onBack?: () => void;
  children: ReactNode;
  /** Кнопки футера по порядку, основная — последней. */
  footer?: ReactNode;
  layout: PanelLayout;
  /** Куда вернуть фокус при закрытии (бронь или слот, из которых открыли панель). */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Перевести фокус при открытии: на поле с `data-autofocus` в теле или на заголовок. `false` — когда фокус
   * ставит родитель (созданная бронь в сетке) и на странице /ui-kit с десятком панелей.
   */
  focusOnOpen?: boolean;
};

const LAYOUT_CN: Record<PanelLayout, { root: string; header: string; body: string; footer: string }> = {
  side: {
    root: "w-90 max-w-full shrink-0 self-stretch border-l border-grey-20",
    header: "h-14 flex-row items-center justify-between px-6",
    body: "p-6",
    footer: "px-6 py-4",
  },
  overlay: {
    root: "absolute inset-0 z-30 shadow-2",
    header: "flex-col items-start gap-1 px-4 py-2",
    body: "p-4",
    footer: "p-4",
  },
};

/** Боковая панель (D12): не модальная, фокус не запирается. Esc закрывает, фокус уходит на заголовок. */
export function PanelContainer({
  title,
  onClose,
  onBack,
  children,
  footer,
  layout,
  returnFocusRef,
  focusOnOpen = true,
}: PanelContainerProps) {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const view = LAYOUT_CN[layout];
  const isSide = layout === "side";
  const hasFooter = footer !== undefined;
  const handleBack = onBack ?? onClose;

  useEffect(() => {
    if (focusOnOpen) {
      const autofocus = bodyRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      (autofocus ?? titleRef.current)?.focus();
    }
    return () => {
      // Цель возврата читаем при закрытии, а не при открытии: после создания брони родитель меняет её
      // с кнопки «Сохранить» на новую бронь в сетке (SPEC §12). Ref — пропс, а не узел этого компонента.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      returnFocusRef?.current?.focus();
    };
  }, [focusOnOpen, returnFocusRef]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      // Esc в открытом списке времени или календаре закрывает только их.
      if (event.target instanceof Element && event.target.closest('[role="listbox"], [role="dialog"]')) return;
      onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const rootCn = cn("flex flex-col bg-white", view.root);
  const headerCn = cn("flex shrink-0 border-b border-grey-20", view.header);
  const bodyCn = cn("min-h-0 flex-1 overflow-y-auto", view.body);
  const footerCn = cn("shrink-0 border-t border-grey-20 bg-white", view.footer);

  return (
    <aside aria-labelledby={titleId} className={rootCn}>
      <div className={headerCn}>
        <Gate when={!isSide}>
          <Button variant="text" iconLeft={ArrowLeft} onClick={handleBack} className="px-0">
            {TEXTS.common.backToCalendar}
          </Button>
        </Gate>
        <h2 ref={titleRef} id={titleId} tabIndex={-1} className="min-w-0 truncate text-title text-grey-100 focus-ring">
          {title}
        </h2>
        <Gate when={isSide}>
          <IconButton label={TEXTS.common.close} icon={X} variant="ghost" onClick={onClose} />
        </Gate>
      </div>
      <div ref={bodyRef} className={bodyCn}>
        {children}
      </div>
      <Gate when={hasFooter}>
        <div className={footerCn}>
          <ActionBar>{footer}</ActionBar>
        </div>
      </Gate>
    </aside>
  );
}
