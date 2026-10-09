import { z } from "zod";

import { bookingListSchema } from "@/entities/booking/model/booking.schema";
import type { Booking } from "@/entities/booking/model/booking.types";
import { roomsSchema } from "@/entities/room/model/room.schema";
import type { Room } from "@/entities/room/model/room.types";

import { serverNow } from "../lib/server-now";

import { seed } from "./seed";

export type MockDb = {
  rooms: Room[];
  bookings: Booking[];
  seededAt: string;
};

/** Ключ данных mock-сервера в `localStorage` (docs/mocks.md §3). */
const STORAGE_KEY = "rooms-mad-dev:db:v1";

/** Брони и комнаты проверяются схемами сущностей: запись без поля — битое хранилище, а не падение обработчика. */
const dbSchema = z.object({ rooms: roomsSchema, bookings: bookingListSchema, seededAt: z.string() });

/** Хранилище недоступно (запрет сайта, квота) — данные живут в памяти до перезагрузки. */
let memoryDb: MockDb | null = null;

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeJsonParse(raw: string | null): unknown {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Каждый обработчик читает хранилище заново: так данные общие для вкладок и переживают перезагрузку
 * (D18). Пустое или битое хранилище заполняется заново.
 */
export function readDb(): MockDb {
  const parsed = dbSchema.safeParse(safeJsonParse(readRaw()));
  if (parsed.success) return parsed.data;
  if (memoryDb) return memoryDb;
  const initial = seed(serverNow());
  writeDb(initial);
  return initial;
}

export function writeDb(db: MockDb) {
  memoryDb = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Хранилище недоступно: данные останутся в памяти вкладки.
  }
}
