import type { UseFormReturn } from "react-hook-form";

import { useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import type { BookingRulesConfig } from "@/entities/booking/model/booking-rules.types";

import { type ApiError, ApiErrorCode } from "@/shared/api/api-error";
import { localizeApiError } from "@/shared/api/localize-api-error";
import { normalizeApiError } from "@/shared/api/normalize-api-error";
import { TEXTS } from "@/shared/consts/texts";
import { announce } from "@/shared/lib/announce";

import { toSlotField } from "../lib/form-values";

import type { BookingFormValues } from "./booking-form.schema";
import type { FormStatus, ServerFieldError } from "./booking-form.types";

type ErrorReaction = (apiError: ApiError, submitted: BookingFormValues) => void;

type ReactionsParams = {
  form: UseFormReturn<BookingFormValues>;
  config: BookingRulesConfig;
  setStatus: (status: FormStatus) => void;
  setServerField: (error: ServerFieldError) => void;
  /** Правка: сервер ответил `404` — бронь уже удалили (D14). */
  onNotFound: () => void;
};

/**
 * Реакция на отказ сервера по коду (SPEC §9, T10 §7). Ввод не теряется, кроме `404` и `BOOKING_LOCKED` в
 * правке: бронь на сервере уже другая, панель показывает её как на сервере.
 */
export function useSubmitReactions({ form, config, setStatus, setServerField, onNotFound }: ReactionsParams) {
  const clearDraft = useBookingDraftStore((state) => state.clear);
  const setConflict = useBookingDraftStore((state) => state.setConflict);
  const discardEdit = (apiError: ApiError) => {
    announce(localizeApiError(apiError, config), "assertive");
    clearDraft();
  };
  const reactions: Partial<Record<ApiErrorCode, ErrorReaction>> = {
    [ApiErrorCode.Network]: () => {
      setStatus({ kind: "failure" });
      announce(TEXTS.errors.NETWORK, "assertive");
    },
    // Дата и время на сервере заняты: сообщение и выделение живут в черновике до их изменения (D13).
    [ApiErrorCode.Conflict]: (apiError) => {
      const text = localizeApiError(apiError, config);
      setConflict(text);
      announce(text);
    },
    [ApiErrorCode.BookingLocked]: discardEdit,
    [ApiErrorCode.NotFound]: (apiError) => {
      discardEdit(apiError);
      onNotFound();
    },
  };
  const showRejection = useRejection({ form, config, setStatus, setServerField });

  return (error: unknown, submitted: BookingFormValues) => {
    const apiError = normalizeApiError(error);
    const react = reactions[apiError.code] ?? showRejection;
    react(apiError, submitted);
  };
}

/** Остальные отказы — у поля, на которое указал сервер, иначе сообщением панели. */
function useRejection({ form, config, setStatus, setServerField }: Omit<ReactionsParams, "onNotFound">): ErrorReaction {
  return (apiError, submitted) => {
    const message = localizeApiError(apiError, config);
    const slotField = toSlotField(apiError.field);
    if (apiError.field === "title") {
      form.setError("title", { type: "server", message });
      return;
    }
    if (slotField) {
      setServerField({ field: slotField, message, values: submitted });
      return;
    }
    setStatus({ kind: "validation", text: message });
    announce(message);
  };
}
