import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { parseResponse } from "@/shared/api/parse-response";

import { bookingListSchema } from "../model/booking.schema";
import type { BookingListParams } from "../model/booking.types";

import { bookingKeys } from "./booking-keys";
import { bookingRepository } from "./booking-repository";

/** Брони видимого периода. Прежние брони остаются на экране до прихода новых (SPEC §8). */
export function useBookings(params: BookingListParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: bookingKeys.list(params),
    queryFn: async () => parseResponse(bookingListSchema, await bookingRepository.list(params)),
    placeholderData: keepPreviousData,
    // R8: брони меняются из других вкладок — свежесть важнее кэша.
    staleTime: 0,
    enabled: options?.enabled,
  });
}
