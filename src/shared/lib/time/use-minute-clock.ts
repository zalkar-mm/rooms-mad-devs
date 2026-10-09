import { useEffect, useState } from "react";

import { clockNow } from "./clock";

/**
 * Время устройства (мс), обновляемое в начале каждой минуты по часам «сейчас» (SPEC §6.1, §6.2).
 * `offsetMs` — сдвиг часов сервера относительно устройства: граница минуты — по времени сервера.
 * Время хранится в состоянии, а не читается в рендере: так пересчёт идёт ровно по тику.
 */
export function useMinuteClock(offsetMs: number): number {
  const [deviceMs, setDeviceMs] = useState(clockNow);

  useEffect(() => {
    const msToNextMinute = 60_000 - ((clockNow() + offsetMs) % 60_000);
    const timer = setTimeout(() => {
      setDeviceMs(clockNow());
    }, msToNextMinute);
    return () => {
      clearTimeout(timer);
    };
  }, [offsetMs, deviceMs]);

  useEffect(() => {
    // Во фоновой вкладке таймеры замедляются: при возврате «сейчас» пересчитывается сразу (D19, T12 §3.3).
    const handleVisibility = () => {
      if (document.visibilityState === "visible") setDeviceMs(clockNow());
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return deviceMs;
}
