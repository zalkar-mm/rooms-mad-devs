import { setupWorker } from "msw/browser";

import { bookingsHandlers } from "./handlers/bookings.handlers";
import { roomsHandlers } from "./handlers/rooms.handlers";
import { settingsHandlers } from "./handlers/settings.handlers";

/** Воркер mock API (docs/mocks.md §2). */
export const worker = setupWorker(...settingsHandlers, ...roomsHandlers, ...bookingsHandlers);
