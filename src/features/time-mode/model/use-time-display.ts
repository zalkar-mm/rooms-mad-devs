import type { Settings } from "@/entities/settings/model/settings.types";

import { TEXTS } from "@/shared/consts/texts";
import { canShowDeviceTime, createTimeDisplay, zoneOffsetOn } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";

import { useTimeModeStore } from "./time-mode.store";

/** Пояс устройства (IANA) — читается один раз при загрузке модуля. */
const DEVICE_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

type Params = {
  settings: Settings;
  /** Выбранная дата: по ней подписи пояса. */
  date: IsoDate;
  /** Видимые даты периода. */
  dates: readonly IsoDate[];
  /** У «Дня» и «Недели» одна колонка времени на все даты. */
  sharedAxis: boolean;
};

/**
 * «Моё время» (D23, T15): только показ. Данные, правила и запросы — во времени комнаты (docs/data.md §7);
 * все подписи — через `display`. Объект пересоздаётся при смене режима, не на каждый рендер (React Compiler).
 * Переключатель — только когда местное время показывается без перехода через полночь и со слотами на :00/:30;
 * иначе сохранённый режим не применяется.
 */
export function useTimeDisplay({ settings, date, dates, sharedAxis }: Params) {
  const mode = useTimeModeStore((state) => state.mode);
  const setMode = useTimeModeStore((state) => state.setMode);
  const roomZone = settings.timezone;
  const canSwitch = canShowDeviceTime({
    roomZone,
    deviceZone: DEVICE_ZONE,
    dates,
    workdayStart: settings.workdayStart,
    workdayEnd: settings.workdayEnd,
    slotMinutes: settings.slotMinutes,
    sharedAxis,
  });
  const activeMode = canSwitch && mode === "device" ? "device" : "room";
  const display = createTimeDisplay({ mode: activeMode, roomZone, deviceZone: DEVICE_ZONE });

  return {
    display,
    canSwitch,
    /** Доступное имя переключателя со смещением устройства: «Моё время, UTC+5» (T15 §10). */
    switchLabel: TEXTS.calendar.myTimeSpoken(zoneOffsetOn({ zone: DEVICE_ZONE, date, roomZone })),
    setDevice: (device: boolean) => {
      setMode(device ? "device" : "room");
    },
  };
}
