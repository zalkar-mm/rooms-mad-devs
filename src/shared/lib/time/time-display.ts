import { TZDate, tzOffset } from "@date-fns/tz";

import { TEXTS } from "../../consts/texts";

import { formatInterval, formatUtcOffset } from "./format";
import { toMinutes } from "./minutes";
import type { HhMm, IsoDate } from "./types";
import { toZoned, type ZonedMoment } from "./zoned";

/** Пояс показа времени: комнаты (по умолчанию) или устройства — «Моё время» (D23). */
export type TimeDisplayMode = "room" | "device";

/**
 * Время на экране (D23, T15). Данные, правила и запросы — во времени комнаты; подписи — в поясе режима.
 * Смещение считается для каждой даты: переход устройства на летнее время учтён.
 */
export type TimeDisplay = {
  mode: TimeDisplayMode;
  /** Время для подписи: «10:00» комнаты → «09:00» в Алматы. */
  time: (date: IsoDate, time: HhMm) => HhMm;
  /** «09:00–10:00». */
  interval: (date: IsoDate, start: HhMm, end: HhMm) => string;
  /** Дата и время комнаты → дата и время на экране. */
  fromRoom: (date: IsoDate, time: HhMm) => ZonedMoment;
  /** «Время комнаты · UTC+6» / «Моё время · UTC+5». */
  zoneLabel: (date: IsoDate) => string;
};

type TimeDisplayParams = {
  mode: TimeDisplayMode;
  roomZone: string;
  deviceZone: string;
};

type DeviceTimeCheck = {
  roomZone: string;
  deviceZone: string;
  /** Видимые даты периода. */
  dates: readonly IsoDate[];
  workdayStart: HhMm;
  workdayEnd: HhMm;
  /** Шаг слота: смещение кратно ему — границы слотов остаются на :00/:30. */
  slotMinutes: number;
  /** Одна колонка времени на все даты («День», «Неделя»): смещение на датах должно совпадать. */
  sharedAxis: boolean;
};

/** Подпись пояса читается в середине дня комнаты. */
const LABEL_TIME = "12:00";

const ZONE_LABEL: Record<TimeDisplayMode, (offset: string) => string> = {
  room: TEXTS.calendar.roomTime,
  device: TEXTS.calendar.myTimeLabel,
};

/** Момент «дата и время на часах пояса `timeZone`». */
function zonedInstant(date: IsoDate, time: HhMm, timeZone: string): number {
  const minutes = toMinutes(time);
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new TZDate(year, month - 1, day, Math.floor(minutes / 60), minutes % 60, timeZone).getTime();
}

const identity = (date: IsoDate, time: HhMm): ZonedMoment => ({ date, time });

const convert =
  (fromZone: string, toZone: string) =>
  (date: IsoDate, time: HhMm): ZonedMoment =>
    toZoned(zonedInstant(date, time, fromZone), toZone);

const offsetDiff = (fromZone: string, toZone: string, instant: number) =>
  tzOffset(toZone, new Date(instant)) - tzOffset(fromZone, new Date(instant));

/**
 * Смещение устройства на дате, если рабочий день комнаты целиком приходится на эту же местную дату, смещение
 * не меняется внутри дня и кратно шагу слота; иначе `null`.
 */
function workdayShift(date: IsoDate, check: DeviceTimeCheck): number | null {
  const { roomZone, deviceZone } = check;
  const start = zonedInstant(date, check.workdayStart, roomZone);
  const end = zonedInstant(date, check.workdayEnd, roomZone);
  const shift = offsetDiff(roomZone, deviceZone, start);
  const sameDate = toZoned(start, deviceZone).date === date && toZoned(end, deviceZone).date === date;
  const steady = shift === offsetDiff(roomZone, deviceZone, end);
  return sameDate && steady && shift % check.slotMinutes === 0 ? shift : null;
}

/**
 * Можно ли показать «Моё время» на этих датах (решение владельца к T15, вопросы 2 и 3): пояс устройства
 * отличается, а рабочий день комнаты на каждой дате укладывается в те же местные сутки со смещением, кратным
 * 30 минутам. Так бронь остаётся на своей дате, сетка не пересекает полночь, слоты — на :00/:30.
 */
export function canShowDeviceTime(check: DeviceTimeCheck): boolean {
  const shifts = check.dates.map((date) => workdayShift(date, check));
  const fits = shifts.every((shift) => shift !== null);
  const differs = shifts.some((shift) => shift !== 0);
  const uniform = !check.sharedAxis || new Set(shifts).size <= 1;
  return fits && differs && uniform;
}

type ZoneOffsetParams = {
  /** Пояс, смещение которого подписываем. */
  zone: string;
  /** Дата комнаты: смещение берётся в середине её дня. */
  date: IsoDate;
  roomZone: string;
};

/** «UTC+5» — смещение пояса `zone` в середине дня комнаты `date`. */
export function zoneOffsetOn({ zone, date, roomZone }: ZoneOffsetParams): string {
  return formatUtcOffset(zone, zonedInstant(date, LABEL_TIME, roomZone));
}

/** Объект показа времени для режима: в режиме комнаты — тождественное преобразование. */
export function createTimeDisplay({ mode, roomZone, deviceZone }: TimeDisplayParams): TimeDisplay {
  const isDevice = mode === "device";
  const displayZone = isDevice ? deviceZone : roomZone;
  const fromRoom = isDevice ? convert(roomZone, deviceZone) : identity;
  const time = (date: IsoDate, value: HhMm) => fromRoom(date, value).time;

  return {
    mode,
    time,
    interval: (date, start, end) => formatInterval(time(date, start), time(date, end)),
    fromRoom,
    zoneLabel: (date) => ZONE_LABEL[mode](zoneOffsetOn({ zone: displayZone, date, roomZone })),
  };
}
