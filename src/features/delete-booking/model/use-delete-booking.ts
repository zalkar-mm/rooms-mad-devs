import { useState } from "react";

import { useDeleteBookingMutation } from "@/entities/booking/api/use-delete-booking";
import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingRulesConfig } from "@/entities/booking/model/booking-rules.types";

import { type ApiError, ApiErrorCode } from "@/shared/api/api-error";
import { localizeApiError } from "@/shared/api/localize-api-error";
import { normalizeApiError } from "@/shared/api/normalize-api-error";
import { TEXTS } from "@/shared/consts/texts";
import { announce } from "@/shared/lib/announce";

type Params = {
  booking: Booking;
  /** Тексты отказов с числами из настроек. */
  config: BookingRulesConfig;
  /** `204`: бронь удалена, панель пустая (SPEC §7, сценарий 7). */
  onDeleted: () => void;
  /** `404`: бронь уже удалили (D14). */
  onNotFound: () => void;
  /** `422 BOOKING_LOCKED`: бронь началась — назад к деталям, без «Удалить» (T11 §4.3б). */
  onLocked: () => void;
};

export type DeleteStatus = { kind: "none" } | { kind: "failure" } | { kind: "message"; text: string };

/** Сценарий удаления после подтверждения в панели (T11, D11). Повторное нажатие во время отправки не шлёт запрос. */
export function useDeleteBooking({ booking, config, onDeleted, onNotFound, onLocked }: Params) {
  const remove = useDeleteBookingMutation();
  const [status, setStatus] = useState<DeleteStatus>({ kind: "none" });

  const reactions: Partial<Record<ApiErrorCode, (apiError: ApiError) => void>> = {
    [ApiErrorCode.Network]: () => {
      setStatus({ kind: "failure" });
      announce(TEXTS.errors.NETWORK, "assertive");
    },
    [ApiErrorCode.NotFound]: () => {
      onNotFound();
    },
    [ApiErrorCode.BookingLocked]: (apiError) => {
      announce(localizeApiError(apiError, config), "assertive");
      onLocked();
    },
  };
  // `409` и прочее при удалении не ожидаются: текст по коду (T11, открытый вопрос 2).
  const showMessage = (apiError: ApiError) => {
    const text = localizeApiError(apiError, config);
    setStatus({ kind: "message", text });
    announce(text);
  };

  const handleDelete = () => {
    if (remove.isPending) return;
    setStatus({ kind: "none" });
    remove.mutate(booking.id, {
      onSuccess: () => {
        announce(TEXTS.panel.deleted);
        onDeleted();
      },
      onError: (error) => {
        const apiError = normalizeApiError(error);
        const react = reactions[apiError.code] ?? showMessage;
        react(apiError);
      },
    });
  };

  return { deleting: remove.isPending, status, onDelete: handleDelete };
}
