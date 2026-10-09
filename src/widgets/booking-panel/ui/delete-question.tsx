import type { RefObject } from "react";

import { type DeleteStatus, type useDeleteBooking } from "@/features/delete-booking/model/use-delete-booking";
import { DeleteConfirm } from "@/features/delete-booking/ui/delete-confirm";

import type { Booking } from "@/entities/booking/model/booking.types";

import { TEXTS } from "@/shared/consts/texts";
import { formatDayMonth } from "@/shared/lib/time/format";
import { Gate } from "@/shared/ui/gate";
import { Notice } from "@/shared/ui/notice";
import { RetryNotice } from "@/shared/ui/retry-notice";

export type DeleteQuestionProps = {
  booking: Booking;
  /** «10:00–11:00» в поясе режима. */
  intervalText: string;
  remove: ReturnType<typeof useDeleteBooking>;
  onKeep: () => void;
  questionRef: RefObject<HTMLDivElement | null>;
};

/** Режим «Удаление» (SPEC §6.3, T11): вопрос в панели, не модальным окном (D11, D12). */
export function DeleteQuestion({ booking, intervalText, remove, onKeep, questionRef }: DeleteQuestionProps) {
  const question = TEXTS.panel.deleteQuestion(booking.title, formatDayMonth(booking.date), intervalText);
  const failed = remove.status.kind === "failure";

  return (
    <div ref={questionRef} tabIndex={-1} className="flex flex-col gap-4 focus:outline-none">
      <Gate when={failed}>
        <RetryNotice text={TEXTS.errors.NETWORK} onRetry={remove.onDelete} />
      </Gate>
      <OptionalMessage status={remove.status} />
      <DeleteConfirm text={question} onKeep={onKeep} onDelete={remove.onDelete} deleting={remove.deleting} />
    </div>
  );
}

function OptionalMessage({ status }: { status: DeleteStatus }) {
  if (status.kind !== "message") return null;
  return <Notice variant="warning">{status.text}</Notice>;
}
