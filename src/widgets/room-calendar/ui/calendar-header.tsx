import type { MouseEvent, ReactNode } from "react";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

import { TEXTS } from "@/shared/consts/texts";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { IconButton } from "@/shared/ui/icon-button";

export type CalendarHeaderProps = {
  roomName: string;
  /** «Все комнаты»: с черновиком переход заменяется вопросом в панели (D33). */
  back: { href: string; onClick?: (event: MouseEvent<HTMLAnchorElement>) => void };
  /** Период: «Среда, 7 октября 2026», «5–11 октября 2026», «Октябрь 2026»; листание и «Сегодня». */
  nav: {
    title: string;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
    prevDisabled?: boolean;
    nextDisabled?: boolean;
  };
  /** DatePicker с кнопкой-триггером. */
  dateSlot: ReactNode;
  /** SegmentedControl «День / Неделя / Месяц». */
  viewSlot: ReactNode;
  /** «Время комнаты · UTC+6» и переключатель «Моё время» — он сам решает, показываться ли (D23). */
  zone: { label: string; switch?: ReactNode };
  /** «Забронировать»; уже 768 px липкая кнопка прячется, пока панель открыта поверх сетки. */
  book: { onBook: () => void; disabled?: boolean; barHidden?: boolean };
};

/**
 * Шапка календаря. Каждый элемент рендерится один раз, раскладка по ширине — порядком в flex-wrap:
 * < 768 — «Все комнаты» + название / «Назад» · период · «Вперёд» / «Сегодня» · дата · вид / пояс,
 * «Забронировать» прилипает к низу экрана; от 768 — две строки (SPEC §6.2, промпт UI kit 4.19).
 */
export function CalendarHeader({ roomName, back, nav, dateSlot, viewSlot, zone, book }: CalendarHeaderProps) {
  const bookBarCn = cn(
    "fixed inset-x-0 bottom-0 z-40 border-t border-grey-20 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:order-4 md:border-0 md:bg-transparent md:p-0",
    book.barHidden === true && "max-md:hidden",
  );

  return (
    <header className="sticky top-0 z-40 border-b border-grey-20 bg-white">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        <Button
          variant="text"
          href={back.href}
          onLinkClick={back.onClick}
          iconLeft={ArrowLeft}
          className="order-1 px-0"
        >
          {TEXTS.common.allRooms}
        </Button>
        <h1 className="order-2 min-w-0 flex-1 truncate text-title text-grey-100 md:mr-auto md:flex-none">{roomName}</h1>
        <RowBreak className="order-3 md:hidden" />

        <IconButton
          label={TEXTS.calendar.prev}
          icon={ChevronLeft}
          onClick={nav.onPrev}
          disabled={nav.prevDisabled}
          className="order-4 md:order-7"
        />
        <p
          aria-live="polite"
          className="order-5 min-w-0 flex-1 text-center text-body font-semibold text-balance text-grey-100 md:order-9 md:flex-none md:text-left md:text-title"
        >
          {nav.title}
        </p>
        <IconButton
          label={TEXTS.calendar.next}
          icon={ChevronRight}
          onClick={nav.onNext}
          disabled={nav.nextDisabled}
          className="order-6 md:order-8"
        />
        <RowBreak className="order-7 md:hidden" />

        <Button variant="secondary" onClick={nav.onToday} className="order-8 md:order-6">
          {TEXTS.calendar.today}
        </Button>
        <div className="order-9 md:order-10">{dateSlot}</div>
        <div className="order-10 ml-auto min-w-0 flex-1 md:order-11 md:flex-none">{viewSlot}</div>
        <RowBreak className="order-11 md:hidden" />

        <div className="order-12 flex flex-wrap items-center gap-3 md:order-3">
          <span className="text-small text-grey-50">{zone.label}</span>
          {zone.switch}
        </div>
        {/* Отступ снизу учитывает вырез экрана: единственное место с env(safe-area-inset-bottom). */}
        <div className={bookBarCn}>
          <Button fullWidth onClick={book.onBook} disabled={book.disabled} className="md:w-auto">
            {TEXTS.calendar.book}
          </Button>
        </div>
        <RowBreak className="hidden md:order-5 md:block" />
      </div>
    </header>
  );
}

/** Принудительный перенос строки внутри flex-wrap. */
function RowBreak({ className }: { className: string }) {
  const rootCn = cn("h-0 basis-full", className);
  return <div aria-hidden className={rootCn} />;
}
