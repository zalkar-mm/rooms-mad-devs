import { axiosClient } from "@/shared/api/axios-client";

import type { BookingListParams, CreateBookingInput, UpdateBookingInput } from "../model/booking.types";

/** Только HTTP (docs/data.md §3). Ответы проверяют схемы в хуках. */
export const bookingRepository = {
  list: (params: BookingListParams) =>
    axiosClient.get<unknown>("/bookings", { params }).then((response) => response.data),
  create: (input: CreateBookingInput) =>
    axiosClient.post<unknown>("/bookings", input).then((response) => response.data),
  update: ({ id, ...patch }: UpdateBookingInput) =>
    axiosClient.patch<unknown>(`/bookings/${encodeURIComponent(id)}`, patch).then((response) => response.data),
  remove: (id: string) => axiosClient.delete(`/bookings/${encodeURIComponent(id)}`).then(() => undefined),
};
