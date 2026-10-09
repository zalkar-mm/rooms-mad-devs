import { type Control, useFormState } from "react-hook-form";

import { useBookings } from "@/entities/booking/api/use-bookings";
import { validateSlot } from "@/entities/booking/lib/booking-rules";
import type { BookingDraft } from "@/entities/booking/model/booking-draft.store";
import type { BookingField, BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import { ApiErrorCode } from "@/shared/api/api-error";
import type { TimeDisplay } from "@/shared/lib/time/time-display";

import { activeServerField } from "../lib/form-values";
import { ruleMessage } from "../lib/rule-message";

import type { BookingFormValues } from "./booking-form.schema";
import type { FormErrors, ServerFieldError } from "./booking-form.types";

type ErrorsParams = {
  control: Control<BookingFormValues>;
  values: BookingFormValues;
  draft: BookingDraft;
  config: BookingRulesConfig;
  now: RulesNow;
  display: TimeDisplay;
  /** Текст `409` в черновике: о пересечении говорит сообщение панели, у поля его не повторяем (T09 §4). */
  conflictText: string | null;
  serverField: ServerFieldError | null;
};

/** Ошибки полей: правила брони на клиенте (те же, что у сервера), название по схеме, отказы сервера. */
export function useFormErrors({
  control,
  values,
  draft,
  config,
  now,
  display,
  conflictText,
  serverField,
}: ErrorsParams) {
  const dayBookings = useBookings({ roomId: draft.roomId, date: values.date });
  // Правка не сравнивает бронь с самой собой (R7, P9).
  const context = { config, now, bookings: dayBookings.data ?? [], editingId: draft.editing?.id };
  const slotError = validateSlot({ roomId: draft.roomId, ...values }, context);
  // Своя подписка на состояние формы: ошибка и «тронуто» названия обновляют этот хук (react-hook-form).
  const { errors: schemaErrors, touchedFields, isSubmitted } = useFormState({ control });
  const titleTooLong = values.title.trim().length > config.titleMaxLength;
  const showTitleError = touchedFields.title === true || isSubmitted || titleTooLong;
  const coveredByConflict = conflictText !== null && slotError?.code === ApiErrorCode.Conflict;
  const ruleText =
    slotError && !coveredByConflict ? ruleMessage({ error: slotError, date: values.date, display, config }) : undefined;
  const ruleField = slotError?.field ?? "start";
  const server = activeServerField(serverField, values);

  const errorOf = (field: BookingField) => {
    if (server?.field === field) return server.message;
    if (field === "title") return showTitleError ? schemaErrors.title?.message : undefined;
    return ruleField === field ? ruleText : undefined;
  };
  const errors: FormErrors = {
    title: errorOf("title"),
    date: errorOf("date"),
    start: errorOf("start"),
    end: errorOf("end"),
  };

  return { slotError, errors };
}
