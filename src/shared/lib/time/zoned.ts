import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

import type { HhMm, IsoDate } from "./types";

/** Момент времени в поясе: календарная дата и время на часах этого пояса. */
export type ZonedMoment = {
  date: IsoDate;
  time: HhMm;
};

/** Момент (мс или ISO) → дата и время в поясе `timeZone`, независимо от пояса устройства. */
export function toZoned(instant: number | string, timeZone: string): ZonedMoment {
  const zoned = new TZDate(typeof instant === "string" ? Date.parse(instant) : instant, timeZone);
  return { date: format(zoned, "yyyy-MM-dd"), time: format(zoned, "HH:mm") };
}
