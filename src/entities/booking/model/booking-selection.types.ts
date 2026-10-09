import type { Booking } from "./booking.types";

/**
 * Что открыто в панели из сетки (SPEC §6.3): ничего, бронь из загруженного списка периода или
 * «Не найдена» — бронь пропала из перезапрошенного списка своего дня (D14).
 */
export type BookingSelection =
  { kind: "none" } | { kind: "booking"; booking: Booking } | { kind: "notFound"; title: string | undefined };
