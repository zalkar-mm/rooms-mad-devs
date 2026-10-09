import type { RulesNow } from "@/entities/booking/model/booking-rules.types";

import { toZoned } from "@/shared/lib/time/zoned";

import { MOCK_SETTINGS } from "../db/settings";

/** «Сейчас» сервера. Mock — сервер, поэтому читает системное время сам (docs/data.md §7). */
export function serverNow(): Date {
  return new Date();
}

/** «Сейчас» во времени комнаты — для правил (D22). */
export function serverNowInRoom(): RulesNow {
  return toZoned(serverNow().getTime(), MOCK_SETTINGS.timezone);
}
