import { type RefObject, useEffect, useRef, useState } from "react";

import { Pencil, Trash2 } from "lucide-react";

import { useDeleteBooking } from "@/features/delete-booking/model/use-delete-booking";

import { type BookingStatus, bookingStatus } from "@/entities/booking/lib/booking-status";
import { formatDuration } from "@/entities/booking/lib/format-duration";
import type { Booking } from "@/entities/booking/model/booking.types";
import { useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import { BookingDetails } from "@/entities/booking/ui/booking-details";

import { TEXTS } from "@/shared/consts/texts";
import { formatShortDate } from "@/shared/lib/time/format";
import { toMinutes } from "@/shared/lib/time/minutes";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import { Button } from "@/shared/ui/button";
import { Gate } from "@/shared/ui/gate";

import type { PanelEnv } from "../model/panel-env";

import { DeleteQuestion } from "./delete-question";
import { PanelContainer, type PanelLayout } from "./panel-container";

export type BookingDetailsActions = {
  onClose: () => void;
  /** Бронь удалена: панель пустая (SPEC §12). */
  onDeleted: () => void;
  /** Сервер ответил `404`: «Не найдена» (D14). */
  onNotFound: () => void;
};

export type BookingDetailsPanelProps = {
  booking: Booking;
  env: PanelEnv;
  /** Подписи времени в поясе режима (D23). */
  display: TimeDisplay;
  layout: PanelLayout;
  returnFocusRef: RefObject<HTMLElement | null>;
  successText: string | undefined;
  actions: BookingDetailsActions;
};

/** Пометка для броней только на просмотр (P7, D25). */
const LOCK_NOTE: Record<BookingStatus, string | undefined> = {
  future: undefined,
  ongoing: TEXTS.panel.ongoingLocked,
  past: TEXTS.panel.pastLocked,
};

/**
 * Режимы «Бронь» и «Удаление» (SPEC §6.3, T05, T11) в одной панели. Статус пересчитывается вместе с
 * «сейчас» раз в минуту: у начавшейся брони кнопки пропадают (T05 §3.9).
 */
export function BookingDetailsPanel(props: BookingDetailsPanelProps) {
  const { booking, env, display, actions } = props;
  const [confirming, setConfirming] = useState(false);
  const [asked, setAsked] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const intervalText = display.interval(booking.date, booking.start, booking.end);
  const handleKeep = () => {
    setConfirming(false);
  };
  const remove = useDeleteBooking({
    booking,
    config: env.config,
    onDeleted: actions.onDeleted,
    onNotFound: actions.onNotFound,
    onLocked: handleKeep,
  });

  // Фокус при смене режима: в вопрос, после «Оставить» — обратно на «Удалить» (T11 §4.2а). Эффект родителя
  // выполняется после эффекта PanelContainer, поэтому его фокус не перебивается фокусом на заголовок.
  useEffect(() => {
    if (confirming) {
      questionRef.current?.focus();
      return;
    }
    if (asked) deleteButtonRef.current?.focus();
  }, [confirming, asked]);

  const handleAskDelete = () => {
    setAsked(true);
    setConfirming(true);
  };

  const status = bookingStatus(booking, env.now);
  const footer = (
    <DetailsFooter
      booking={booking}
      status={status}
      deleteButtonRef={deleteButtonRef}
      onAskDelete={handleAskDelete}
      onClose={actions.onClose}
    />
  );
  const details = (
    <DetailsBody booking={booking} status={status} intervalText={intervalText} successText={props.successText} />
  );
  const panelFooter = confirming ? undefined : footer;
  // Esc в подтверждении — «Оставить» (T11 §3.5). После создания фокус ставит календарь (SPEC §12).
  const handleClose = confirming ? handleKeep : actions.onClose;
  const focusOnOpen = !confirming && props.successText === undefined;

  // Один PanelContainer на оба режима: при смене режима он не монтируется заново и не уводит фокус.
  return (
    <PanelContainer
      title={booking.title}
      onClose={handleClose}
      footer={panelFooter}
      layout={props.layout}
      returnFocusRef={props.returnFocusRef}
      focusOnOpen={focusOnOpen}
    >
      <Gate when={confirming} fallback={details}>
        <DeleteQuestion
          booking={booking}
          intervalText={intervalText}
          remove={remove}
          onKeep={handleKeep}
          questionRef={questionRef}
        />
      </Gate>
    </PanelContainer>
  );
}

type DetailsFooterProps = {
  booking: Booking;
  status: BookingStatus;
  deleteButtonRef: RefObject<HTMLButtonElement | null>;
  onAskDelete: () => void;
  onClose: () => void;
};

/** Порядок Tab в футере: «Изменить» → «Удалить» → «Закрыть» (T05 §10). Изменить и удалить — только будущую. */
function DetailsFooter({ booking, status, deleteButtonRef, onAskDelete, onClose }: DetailsFooterProps) {
  const startEdit = useBookingDraftStore((state) => state.startEdit);
  const isFuture = status === "future";
  const handleEdit = () => {
    startEdit(booking);
  };

  return (
    <>
      <Gate when={isFuture}>
        <Button variant="secondary" iconLeft={Pencil} onClick={handleEdit}>
          {TEXTS.panel.edit}
        </Button>
        <Button ref={deleteButtonRef} variant="danger" iconLeft={Trash2} onClick={onAskDelete}>
          {TEXTS.panel.delete}
        </Button>
      </Gate>
      <Button variant="text" onClick={onClose}>
        {TEXTS.common.close}
      </Button>
    </>
  );
}

type DetailsBodyProps = {
  booking: Booking;
  status: BookingStatus;
  intervalText: string;
  successText: string | undefined;
};

function DetailsBody({ booking, status, intervalText, successText }: DetailsBodyProps) {
  const dateText = formatShortDate(booking.date);
  const durationText = formatDuration(toMinutes(booking.end) - toMinutes(booking.start));
  return (
    <BookingDetails
      dateText={dateText}
      timeText={intervalText}
      durationText={durationText}
      status={status}
      note={LOCK_NOTE[status]}
      success={successText}
    />
  );
}
