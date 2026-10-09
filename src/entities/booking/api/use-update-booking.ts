import { useMutation, useQueryClient } from "@tanstack/react-query";

import { parseResponse } from "@/shared/api/parse-response";

import { bookingSchema } from "../model/booking.schema";
import type { UpdateBookingInput } from "../model/booking.types";

import { bookingKeys } from "./booking-keys";
import { bookingRepository } from "./booking-repository";

/** `PATCH /api/bookings/:id` с изменёнными полями. После любого ответа период перезапрашивается (SPEC §8). */
export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateBookingInput) =>
      parseResponse(bookingSchema, await bookingRepository.update(input)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
  });
}
