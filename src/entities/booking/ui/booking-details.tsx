import { Gate } from "@/shared/ui/gate";
import { Notice } from "@/shared/ui/notice";
import { StatusBadge } from "@/shared/ui/status-badge";

import type { BookingStatus } from "../lib/booking-status";

export type BookingDetailsProps = {
  /** «Ср, 7 октября». */
  dateText: string;
  /** «10:00–11:00». */
  timeText: string;
  /** «1 ч 30 мин». */
  durationText: string;
  status: BookingStatus;
  /** «Прошедшую бронь изменить нельзя» / «Встреча идёт — изменить её нельзя». */
  note?: string;
  /** «Бронь создана» / «Изменения сохранены». */
  success?: string;
};

/**
 * Тело панели в режиме «Бронь». Заголовок (название брони) и кнопки футера — у PanelContainer:
 * их передаёт родитель, сущность не знает о действиях.
 */
export function BookingDetails({ dateText, timeText, durationText, status, note, success }: BookingDetailsProps) {
  const hasNote = note !== undefined;
  const hasSuccess = success !== undefined;
  const summary = [dateText, timeText, durationText].join(" · ");

  return (
    <div className="flex flex-col gap-4">
      <Gate when={hasSuccess}>
        <Notice variant="success">{success}</Notice>
      </Gate>
      <p className="text-body text-grey-100 tabular-nums">{summary}</p>
      <StatusBadge variant={status} className="self-start" />
      <Gate when={hasNote}>
        <Notice variant="neutral">{note}</Notice>
      </Gate>
    </div>
  );
}
