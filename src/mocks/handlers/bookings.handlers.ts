import { http, HttpResponse } from "msw";
import { z } from "zod";

import { type BookingCandidate, validateBooking } from "@/entities/booking/lib/booking-rules";
import { isLocked } from "@/entities/booking/lib/booking-status";
import type { Booking } from "@/entities/booking/model/booking.types";

import { ApiErrorCode } from "@/shared/api/api-error";
import { TEXTS } from "@/shared/consts/texts";

import { useMockControls } from "../controls";
import { MOCK_SETTINGS } from "../db/settings";
import { type MockDb, readDb, writeDb } from "../db/storage";
import { apiUrl } from "../lib/api-url";
import { takeFailNext } from "../lib/fail-next";
import { respondError } from "../lib/respond-error";
import { serverNowInRoom } from "../lib/server-now";

/** Поля тела берутся как есть; пропущенное поле — пустая строка и отказ своей проверки (T02 Q1). */
const bodySchema = z
  .object({ roomId: z.string(), date: z.string(), start: z.string(), end: z.string(), title: z.string() })
  .partial();

type BookingParams = { id: string };

const byDateThenStart = (a: Booking, b: Booking) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start);

function readBody(json: unknown) {
  const parsed = bodySchema.safeParse(json);
  return parsed.success ? parsed.data : {};
}

/** Отказ правил или `null`: шаги 3–11 T02 §4.5 — общие с формой (`validateBooking`). */
function rejectByRules(candidate: BookingCandidate, db: MockDb, editingId?: string) {
  const error = validateBooking(candidate, {
    config: MOCK_SETTINGS,
    now: serverNowInRoom(),
    bookings: db.bookings,
    editingId,
  });
  if (!error) return null;
  if (error.code === ApiErrorCode.Conflict) return respondError(409, error.code);
  const message = error.earliestStart === undefined ? undefined : TEXTS.pastTime(error.earliestStart);
  return respondError(422, error.code, { field: error.field, message });
}

/** «Конфликт на следующий запрос» (docs/mocks.md §5). */
function takeConflictNext() {
  const controls = useMockControls.getState();
  if (!controls.conflictNext) return null;
  controls.setConflictNext(false);
  return respondError(409, ApiErrorCode.Conflict);
}

export const bookingsHandlers = [
  http.get(apiUrl("/bookings"), ({ request }) => {
    const failure = takeFailNext();
    if (failure) return failure;

    const params = new URL(request.url).searchParams;
    const db = readDb();
    const roomId = params.get("roomId");
    if (!db.rooms.some((room) => room.id === roomId)) return respondError(404, ApiErrorCode.RoomNotFound);

    const from = params.get("date") ?? params.get("from") ?? "";
    const to = params.get("date") ?? params.get("to") ?? "";
    const bookings = db.bookings
      .filter((booking) => booking.roomId === roomId && booking.date >= from && booking.date <= to)
      .sort(byDateThenStart);
    return HttpResponse.json(bookings);
  }),

  http.post(apiUrl("/bookings"), async ({ request }) => {
    const failure = takeFailNext();
    if (failure) return failure;

    const body = readBody(await request.json().catch(() => null));
    const db = readDb();
    if (!db.rooms.some((room) => room.id === body.roomId)) return respondError(404, ApiErrorCode.RoomNotFound);

    const conflict = takeConflictNext();
    if (conflict) return conflict;

    const candidate: BookingCandidate = {
      roomId: body.roomId ?? "",
      date: body.date ?? "",
      start: body.start ?? "",
      end: body.end ?? "",
      title: body.title ?? "",
    };
    const rejection = rejectByRules(candidate, db);
    if (rejection) return rejection;

    const booking: Booking = { ...candidate, id: crypto.randomUUID(), title: candidate.title.trim() };
    writeDb({ ...db, bookings: [...db.bookings, booking] });
    return HttpResponse.json(booking, { status: 201 });
  }),

  http.patch<BookingParams>(apiUrl("/bookings/:id"), async ({ request, params }) => {
    const failure = takeFailNext();
    if (failure) return failure;

    const db = readDb();
    const current = db.bookings.find((booking) => booking.id === params.id);
    if (!current) return respondError(404, ApiErrorCode.NotFound);
    if (isLocked(current, serverNowInRoom())) return respondError(422, ApiErrorCode.BookingLocked);

    const conflict = takeConflictNext();
    if (conflict) return conflict;

    // roomId в PATCH не меняется (T02 §9).
    const { roomId: _roomId, ...patch } = readBody(await request.json().catch(() => null));
    const next: Booking = { ...current, ...patch };
    const rejection = rejectByRules(next, db, current.id);
    if (rejection) return rejection;

    const saved: Booking = { ...next, title: next.title.trim() };
    writeDb({ ...db, bookings: db.bookings.map((booking) => (booking.id === saved.id ? saved : booking)) });
    return HttpResponse.json(saved);
  }),

  http.delete<BookingParams>(apiUrl("/bookings/:id"), ({ params }) => {
    const failure = takeFailNext();
    if (failure) return failure;

    const db = readDb();
    const current = db.bookings.find((booking) => booking.id === params.id);
    if (!current) return respondError(404, ApiErrorCode.NotFound);
    if (isLocked(current, serverNowInRoom())) return respondError(422, ApiErrorCode.BookingLocked);

    writeDb({ ...db, bookings: db.bookings.filter((booking) => booking.id !== current.id) });
    return new HttpResponse(null, { status: 204 });
  }),
];
