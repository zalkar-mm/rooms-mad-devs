import { useState } from "react";

import type { UseFormReturn } from "react-hook-form";

import { useCreateBooking } from "@/entities/booking/api/use-create-booking";
import { useUpdateBooking } from "@/entities/booking/api/use-update-booking";
import type { Booking } from "@/entities/booking/model/booking.types";
import { type BookingDraft, useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import type { BookingRulesConfig } from "@/entities/booking/model/booking-rules.types";

import { TEXTS } from "@/shared/consts/texts";
import { announce } from "@/shared/lib/announce";

import { changedFields } from "../lib/form-values";

import type { BookingFormValues } from "./booking-form.schema";
import type { FormStatus, SavedKind, ServerFieldError } from "./booking-form.types";
import { useSubmitReactions } from "./use-submit-reactions";

type SubmitParams = {
  form: UseFormReturn<BookingFormValues>;
  draft: BookingDraft;
  config: BookingRulesConfig;
  /** Правило нарушено или правка без изменений: отправки нет (SPEC §7, сценарий 6). */
  blocked: boolean;
  setServerField: (error: ServerFieldError) => void;
  onSaved: (booking: Booking, kind: SavedKind) => void;
  onNotFound: () => void;
};

/** Отправка `POST` или `PATCH` с изменёнными полями и статус формы над кнопками. */
export function useFormSubmit({ form, draft, config, blocked, setServerField, onSaved, onNotFound }: SubmitParams) {
  const clearDraft = useBookingDraftStore((state) => state.clear);
  const conflictText = useBookingDraftStore((state) => state.conflictText);
  const create = useCreateBooking();
  const update = useUpdateBooking();
  const submitting = create.isPending || update.isPending;
  const [localStatus, setStatus] = useState<FormStatus>({ kind: "none" });
  const handleError = useSubmitReactions({ form, config, setStatus, setServerField, onNotFound });

  const callbacksFor = (kind: SavedKind, submitted: BookingFormValues) => ({
    onSuccess: (booking: Booking) => {
      announce(TEXTS.panel.savedText[kind]);
      clearDraft();
      onSaved(booking, kind);
    },
    onError: (error: unknown) => {
      handleError(error, submitted);
    },
  });

  const submit = form.handleSubmit((submitted) => {
    if (blocked || submitting) return;
    setStatus({ kind: "none" });
    const original = draft.editing;
    if (original) {
      update.mutate({ id: original.id, ...changedFields(original, submitted) }, callbacksFor("updated", submitted));
      return;
    }
    const input = { roomId: draft.roomId, ...submitted, title: submitted.title.trim() };
    create.mutate(input, callbacksFor("created", submitted));
  });

  const status: FormStatus = conflictText === null ? localStatus : { kind: "conflict", text: conflictText };
  return { submit: () => void submit(), submitting, status };
}
