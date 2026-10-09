import { useMutation, useQueryClient } from "@tanstack/react-query";

import { bookingKeys } from "./booking-keys";
import { bookingRepository } from "./booking-repository";

/** `DELETE /api/bookings/:id`. После любого ответа период перезапрашивается (SPEC §8). */
export function useDeleteBookingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingRepository.remove,
    onSettled: () => queryClient.invalidateQueries({ queryKey: bookingKeys.lists() }),
  });
}
