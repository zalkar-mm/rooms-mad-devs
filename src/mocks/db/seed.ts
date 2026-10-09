import { isWorkingDay } from "@/entities/booking/lib/booking-rules";
import type { Booking } from "@/entities/booking/model/booking.types";
import type { Room } from "@/entities/room/model/room.types";

import { addIsoDays } from "@/shared/lib/time/iso-date";
import type { IsoDate } from "@/shared/lib/time/types";
import { toZoned } from "@/shared/lib/time/zoned";

import { MOCK_SETTINGS } from "./settings";
import type { MockDb } from "./storage";

/** Начальные комнаты (T01 §3.6). Порядок — порядок показа. */
const SEED_ROOMS: Room[] = [
  { id: "r1", name: "Переговорная 1" },
  { id: "r2", name: "Переговорная 2" },
  { id: "r3", name: "Переговорная 3" },
];

type SeedBooking = Omit<Booking, "id" | "date">;

/**
 * Брони относительно рабочих дней вокруг первого запуска (T02 §9, D17): ключ — номер рабочего дня от
 * сегодня (−1 — предыдущий, 1 — следующий). На следующем рабочем дне в «Переговорная 1» — пара
 * «Созвон» и «Встреча» с касанием. В каждой комнате есть прошлые и будущие брони.
 */
const SEED_BOOKINGS: Record<number, SeedBooking[]> = {
  [-5]: [{ roomId: "r1", start: "10:00", end: "11:00", title: "Планирование" }],
  [-3]: [
    { roomId: "r2", start: "14:00", end: "15:30", title: "Собеседование" },
    { roomId: "r3", start: "09:30", end: "10:00", title: "Созвон" },
  ],
  [-1]: [
    { roomId: "r1", start: "15:00", end: "16:00", title: "Встреча" },
    { roomId: "r2", start: "11:00", end: "12:00", title: "Работа в тишине" },
    { roomId: "r3", start: "16:00", end: "17:00", title: "Планирование" },
  ],
  1: [
    { roomId: "r1", start: "10:00", end: "11:00", title: "Созвон" },
    { roomId: "r1", start: "11:00", end: "12:00", title: "Встреча" },
    { roomId: "r2", start: "13:00", end: "14:00", title: "Собеседование" },
    { roomId: "r3", start: "09:00", end: "09:30", title: "Созвон" },
  ],
  2: [{ roomId: "r1", start: "14:30", end: "16:30", title: "Работа в тишине" }],
  3: [
    { roomId: "r2", start: "09:30", end: "11:00", title: "Планирование" },
    { roomId: "r3", start: "12:00", end: "13:00", title: "Встреча" },
  ],
  5: [{ roomId: "r1", start: "16:00", end: "17:30", title: "Собеседование" }],
};

/** Дата рабочего дня номер `offset` от `today` (сам `today` не считается). */
function workdayAt(today: IsoDate, offset: number): IsoDate {
  const step = Math.sign(offset);
  let date = today;
  for (let left = Math.abs(offset); left > 0;) {
    date = addIsoDays(date, step);
    if (isWorkingDay(date, MOCK_SETTINGS)) left -= 1;
  }
  return date;
}

/** Состояние первого запуска: даты броней считаются от «сегодня» во времени комнаты. */
export function seed(now: Date): MockDb {
  const today = toZoned(now.getTime(), MOCK_SETTINGS.timezone).date;
  const bookings = Object.entries(SEED_BOOKINGS).flatMap(([offset, items]) => {
    const date = workdayAt(today, Number(offset));
    return items.map((item) => ({ ...item, id: crypto.randomUUID(), date }));
  });
  return { rooms: SEED_ROOMS, bookings, seededAt: now.toISOString() };
}
