import { useMinuteClock } from "@/shared/lib/time/use-minute-clock";
import { toZoned, type ZonedMoment } from "@/shared/lib/time/zoned";

import { useSettings } from "../api/use-settings";

/** «Сейчас» во времени комнаты: дата и время на её часах. */
export type Now = ZonedMoment;

/**
 * «Сейчас» во времени комнаты (docs/data.md §7, D22): `serverNow + (clockNow() − dataUpdatedAt)`,
 * пересчёт в начале каждой минуты. До загрузки настроек — `undefined`.
 */
export function useNow(): Now | undefined {
  const { data: settings, dataUpdatedAt } = useSettings();
  const offsetMs = settings ? Date.parse(settings.serverNow) - dataUpdatedAt : 0;
  const deviceMs = useMinuteClock(offsetMs);

  if (!settings) return undefined;
  return toZoned(deviceMs + offsetMs, settings.timezone);
}
