import { useState } from "react";

import { earliestStart } from "@/entities/booking/lib/booking-rules";
import type { Booking } from "@/entities/booking/model/booking.types";
import { type BookingDraft, useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import { toMinutes } from "@/shared/lib/time/minutes";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";

import { changedFields } from "../lib/form-values";

import type { SavedKind, ServerFieldError } from "./booking-form.types";
import { useFormErrors } from "./use-form-errors";
import { useFormFields, useTitleField } from "./use-form-fields";
import { useFormSubmit } from "./use-form-submit";

type Params = {
  draft: BookingDraft;
  config: BookingRulesConfig;
  now: RulesNow;
  /** Подписи времени в поясе режима: ближайшее начало в ошибке — в том же поясе, что поля (T15). */
  display: TimeDisplay;
  /** Успех: панель переходит в режим «Бронь» с этой бронью. */
  onSaved: (booking: Booking, kind: SavedKind) => void;
  /** Правка: дата перенесена — сетка показывает новую дату (T10 §4.3а). */
  onDateChange: (date: IsoDate) => void;
  /** Правка: сервер ответил `404` — бронь уже удалили (D14). */
  onNotFound: () => void;
};

/**
 * Сценарий «Новая бронь» (T06) и «Правка» (T10): значения в форме и в черновике сразу, проверки правил на
 * клиенте, отправка и реакция на ответы сервера.
 */
export function useBookingForm({ draft, config, now, display, onSaved, onDateChange, onNotFound }: Params) {
  const conflictText = useBookingDraftStore((state) => state.conflictText);
  const [serverField, setServerField] = useState<ServerFieldError | null>(null);
  const fields = useFormFields({ draft, config, onDateChange });
  const { form, values } = fields;
  const { slotError, errors } = useFormErrors({
    control: form.control,
    values,
    draft,
    config,
    now,
    display,
    conflictText,
    serverField,
  });
  const unchanged = draft.editing !== undefined && Object.keys(changedFields(draft.editing, values)).length === 0;
  const blocked = slotError !== null || unchanged;
  const sending = useFormSubmit({ form, draft, config, blocked, setServerField, onSaved, onNotFound });
  const title = useTitleField(form);

  return {
    ...fields,
    ...title,
    register: form.register,
    errors,
    /** Сегодня начала раньше ближайшего слота недоступны (P3). */
    earliestStart: earliestStart(values.date, config, now),
    durationMinutes: Math.max(0, toMinutes(values.end) - toMinutes(values.start)),
    status: sending.status,
    submitting: sending.submitting,
    submitDisabled: blocked,
    onSubmit: sending.submit,
    onRetry: sending.submit,
  };
}
