import { useBookings } from "@/entities/booking/api/use-bookings";
import type { BookingListParams } from "@/entities/booking/model/booking.types";

import { ApiErrorCode } from "@/shared/api/api-error";
import { normalizeApiError } from "@/shared/api/normalize-api-error";
import { TEXTS } from "@/shared/consts/texts";
import { useAnnounceWhen } from "@/shared/lib/use-announce-when";

/** Сервер не знает комнату: экран «Комната не найдена» вместо календаря. */
const isRoomMissing = (error: unknown) => error !== null && normalizeApiError(error).code === ApiErrorCode.RoomNotFound;

/** Брони видимого периода (SPEC §8): сбой загрузки объявляется читалке, прежний период не показывается. */
export function usePeriodBookings(params: BookingListParams) {
  const query = useBookings(params);
  const roomMissing = isRoomMissing(query.error);
  useAnnounceWhen(query.isError && !roomMissing, TEXTS.calendar.loadFailed, "assertive");

  return {
    // Брони другого периода, оставленные на время запроса, не показываем: новый период — заготовка (SPEC §8).
    bookings: query.isPlaceholderData ? undefined : query.data,
    failed: query.isError,
    roomMissing,
    retry: () => {
      void query.refetch();
    },
  };
}
