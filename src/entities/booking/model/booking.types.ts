import type { HhMm, IsoDate } from "@/shared/lib/time/types";

/** Бронь (R18, D21). Интервал `[start, end)` во времени комнаты. */
export type Booking = {
  id: string;
  roomId: string;
  date: IsoDate;
  start: HhMm;
  end: HhMm;
  title: string;
};

/** Тело `POST /api/bookings`. */
export type CreateBookingInput = Omit<Booking, "id">;

/** `PATCH /api/bookings/:id` — любое подмножество полей; `roomId` не меняется (T02 §9). */
export type BookingPatch = Partial<Pick<Booking, "date" | "start" | "end" | "title">>;

export type UpdateBookingInput = BookingPatch & { id: string };

/** `GET /api/bookings`: на дату или на период `from…to` включительно. */
export type BookingListParams = { roomId: string } & ({ date: IsoDate } | { from: IsoDate; to: IsoDate });
