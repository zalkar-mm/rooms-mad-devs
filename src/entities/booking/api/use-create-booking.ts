import { useMutation, useQueryClient } from "@tanstack/react-query";

import { parseResponse } from "@/shared/api/parse-response";

import { bookingSchema } from "../model/booking.schema";
import type { CreateBookingInput } from "../model/booking.types";

import { bookingKeys } from "./booking-keys";
import { bookingRepository } from "./booking-repository";

/** `POST /api/bookings`. После любого ответа период перезапрашивается: успех, `409`, `404` (SPEC §8). */
export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) =>
      parseResponse(bookingSchema, await bookingRepository.create(input)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
  });
}
