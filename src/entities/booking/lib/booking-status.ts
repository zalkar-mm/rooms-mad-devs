import { toMinutes } from "@/shared/lib/time/minutes";

import type { Booking } from "../model/booking.types";
import type { RulesNow } from "../model/booking-rules.types";

export type BookingStatus = "past" | "ongoing" | "future";

/** Прошедшая — `end ≤ сейчас` (D6), идущая — `start ≤ сейчас < end`, будущая — `сейчас < start` (D25). */
export function bookingStatus(booking: Pick<Booking, "date" | "start" | "end">, now: RulesNow): BookingStatus {
  if (booking.date < now.date) return "past";
  if (booking.date > now.date) return "future";
  const nowMin = toMinutes(now.time);
  if (toMinutes(booking.end) <= nowMin) return "past";
  if (toMinutes(booking.start) <= nowMin) return "ongoing";
  return "future";
}

/** Прошедшие и идущие брони только просматриваются (P7). */
export function isLocked(booking: Pick<Booking, "date" | "start" | "end">, now: RulesNow): boolean {
  return bookingStatus(booking, now) !== "future";
}
