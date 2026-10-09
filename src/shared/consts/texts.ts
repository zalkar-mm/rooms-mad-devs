import type { ApiErrorCode } from "../api/api-error";
import type { HhMm } from "../lib/time/types";

/**
 * Тексты интерфейса — дословно из SPEC.md (§6, §9, §10), tasks/ и текстов дизайн-спеки / UI kit
 * (docs/routing.md §2). Тексты UI kit помечены «промпт UI kit».
 */

/** Формы слова при числе: [1 бронь, 2 брони, 5 броней]. */
type WordForms = readonly [one: string, few: string, many: string];

function pluralForm(count: number, [one, few, many]: WordForms): string {
  const tens = count % 100;
  const ones = count % 10;
  if (ones === 1 && tens !== 11) return one;
  if (ones >= 2 && ones <= 4 && (tens < 12 || tens > 14)) return few;
  return many;
}

const withWord = (count: number, forms: WordForms) => `${count} ${pluralForm(count, forms)}`;

/** «1 бронь», «3 брони», «5 броней». */
const bookingsCount = (count: number) => withWord(count, ["бронь", "брони", "броней"]);

const MINUTES_PER_HOUR = 60;

/** Длительность в родительном падеже: «не больше 2 часов», «не меньше 30 минут». */
function durationGenitive(minutes: number): string {
  if (minutes % MINUTES_PER_HOUR === 0) return withWord(minutes / MINUTES_PER_HOUR, ["часа", "часов", "часов"]);
  return withWord(minutes, ["минуты", "минут", "минут"]);
}

/** Части чтения брони: «Созвон, среда 7 октября, с 10:00 до 11:00, будущая». */
type BookingSpokenParts = { title: string; date: string; start: string; end: string; status: string };

/** Настройки, числа из которых входят в тексты правил (D35): тексты не зашивают значения. */
export type TextSettings = {
  workdayStart: HhMm;
  workdayEnd: HhMm;
  slotMinutes: number;
  minDurationMinutes: number;
  maxDurationMinutes: number;
  bookingHorizonDays: number;
  titleMaxLength: number;
};

/** Коды, текст которых зависит от настроек. */
export type RuleErrorCode = Extract<
  ApiErrorCode,
  "OUTSIDE_WORKING_HOURS" | "TOO_SHORT" | "TOO_LONG" | "OFF_GRID" | "OUT_OF_HORIZON" | "TITLE_TOO_LONG"
>;

export const TEXTS = {
  common: {
    allRooms: "Все комнаты",
    retry: "Повторить",
    close: "Закрыть",
    backToCalendar: "Назад к календарю",
    /** Бейджи статуса — промпт UI kit. */
    badge: {
      future: "Будущая",
      ongoing: "Идёт",
      past: "Прошла",
      weekend: "Выходной",
      today: "Сегодня",
    },
    hoursShort: "ч",
    minutesShort: "мин",
  },
  rooms: {
    freeUntil: (time: string) => `Свободна до ${time}`,
    freeUntilEndOfDay: "Свободна до конца дня",
    busyUntil: (time: string, title: string) => `Занята до ${time} · ${title}`,
    offHours: "Нерабочее время",
    nextHour: "В ближайший час:",
    nextHourFree: "В ближайший час: свободна",
    nextHourItem: (interval: string, title: string) => `${interval} · ${title}`,
    opensTomorrow: (time: string) => `Откроется завтра в ${time}`,
    /** `weekday` — в винительном падеже: «понедельник», «среду». */
    opensOn: (weekday: string, time: string) => `Откроется в ${weekday} в ${time}`,
    empty: "Переговорных пока нет",
    loadFailed: "Комнаты не загрузились. Проверьте подключение и нажмите «Повторить»",
    /** Сбой броней одной карточки — черновик T13 §5. */
    bookingsFailed: "Брони не загрузились. Нажмите «Повторить»",
    /** День недели в винительном падеже для «Откроется в …» (в SPEC встречается «понедельник»). */
    weekdayAccusative: {
      1: "понедельник",
      2: "вторник",
      3: "среду",
      4: "четверг",
      5: "пятницу",
      6: "субботу",
      7: "воскресенье",
    },
    /** Заголовок экрана для читалки — имя экрана из SPEC §6. */
    screenTitle: "Комнаты",
  },
  calendar: {
    today: "Сегодня",
    prev: "Назад",
    next: "Вперёд",
    book: "Забронировать",
    views: { day: "День", week: "Неделя", month: "Месяц" },
    /** Имя переключателя вида для читалки — своя формулировка, в SPEC нет. */
    viewLabel: "Вид календаря",
    roomTime: (offset: string) => `Время комнаты · ${offset}`,
    myTime: "Моё время",
    /** Подпись пояса в режиме «Моё время» — черновик T15 §3.3. */
    myTimeLabel: (offset: string) => `Моё время · ${offset}`,
    /** Имя переключателя для читалки — черновик T15 §10: «Моё время, UTC+5, включено». */
    myTimeSpoken: (offset: string) => `Моё время, ${offset}`,
    emptyDay: "На эту дату броней нет. Дважды нажмите на свободное время или нажмите «Забронировать»",
    emptyPastDay: "На эту дату броней не было",
    weekend: "Выходной — бронирование недоступно",
    todayClosed: "На сегодня бронирование закрыто. Выберите другой день",
    loadFailed: "Брони не загрузились. Проверьте подключение и нажмите «Повторить»",
    moreBookings: (count: number) => `ещё ${count}`,
    /** Пустой месяц — черновик T14 §5. */
    emptyMonth: "В этом месяце броней нет",
    /** Чтение дня месяца — черновик T14 §12: «среда 7 октября, 3 брони». */
    monthDaySpoken: (date: string, count: number) => (count === 0 ? date : `${date}, ${bookingsCount(count)}`),
    /** «Не больше 2 часов» — максимум длительности из настроек (T07). */
    dragLimit: (maxMinutes: number) => `Не больше ${durationGenitive(maxMinutes)}`,
    /** Промпт UI kit. */
    pickDate: "Выбрать дату",
    skipToCalendar: "Перейти к календарю",
    settingsFailed: "Настройки не загрузились. Проверьте подключение и нажмите «Повторить»",
    /** Чтение брони читалкой (SPEC §12): «Созвон, среда 7 октября, с 10:00 до 11:00, будущая». */
    bookingSpoken: ({ title, date, start, end, status }: BookingSpokenParts) =>
      `${title}, ${date}, с ${start} до ${end}, ${status}`,
    bookingStatusSpoken: { future: "будущая", ongoing: "идущая", past: "прошедшая" },
    /** Чтение ячейки: «среда 7 октября, 14:00, прошедшее время». Слова состояний — черновик T03 §10. */
    slotSpoken: (date: string, time: string, state: string) => `${date}, ${time}, ${state}`,
    slotStateSpoken: {
      available: "свободно",
      past: "прошедшее время",
      weekend: "выходной",
      outOfHorizon: "вне горизонта",
      busy: "занято",
    },
  },
  panel: {
    empty: "Выберите бронь или дважды нажмите на свободное время",
    /** Заголовок формы по режиму; «Изменить бронь» — UI kit (в SPEC режим называется «Правка»). */
    formTitle: { create: "Новая бронь", edit: "Изменить бронь" },
    edit: "Изменить",
    delete: "Удалить",
    keep: "Оставить",
    save: "Сохранить",
    cancel: "Отмена",
    saving: "Сохраняем…",
    deleting: "Удаляем…",
    /** Над деталями сохранённой брони и для читалки. */
    savedText: { created: "Бронь создана", updated: "Изменения сохранены" },
    deleted: "Бронь удалена",
    pastLocked: "Прошедшую бронь изменить нельзя",
    ongoingLocked: "Встреча идёт — изменить её нельзя",
    deleteQuestion: (title: string, date: string, interval: string) => `Удалить бронь «${title}» ${date}, ${interval}?`,
    notFound: "Эта бронь не найдена — возможно, её уже удалили",
    /** Черновик T13 §4.4а. */
    leaveDraft: "Уйти к списку комнат? Несохранённая бронь пропадёт",
    stay: "Остаться",
    leave: "Уйти",
  },
  form: {
    title: "Название встречи",
    titlePlaceholder: "Например, Созвон с командой",
    counter: (count: number, max: number) => `${count} из ${max}`,
    date: "Дата",
    start: "Начало",
    end: "Окончание",
    /** Формат «Длительность: …» — промпт UI kit. */
    duration: (text: string) => `Длительность: ${text}`,
    noFreeTime: "На эту дату свободного времени нет",
    /** Пересечение до отправки — черновик T06 §6 (в SPEC нет). */
    overlap: "Это время уже занято. Выберите другое время",
    /** Промпт UI kit. */
    suggestions: "Подсказки названия",
  },
  /** Текст по коду ответа, если сервер не прислал `message` (SPEC §9, D10). С числами из настроек — `ruleErrors`. */
  errors: {
    INVALID_RANGE: "Окончание должно быть позже начала",
    /** Без времени: полная фраза — `pastTime(hhmm)`, её присылает сервер. */
    PAST_TIME: "Это время уже прошло",
    WEEKEND: "По выходным переговорные не бронируются. Выберите будний день",
    TITLE_REQUIRED: "Добавьте название встречи",
    BOOKING_LOCKED: "Прошедшую или идущую бронь изменить нельзя",
    ROOM_NOT_FOUND: "Эта переговорная не найдена. Вернитесь к списку комнат",
    NOT_FOUND: "Эта бронь не найдена — возможно, её уже удалили",
    CONFLICT: "Это время уже занято. Список обновлён — выберите другое время",
    NETWORK: "Сервер не отвечает. Попробуйте ещё раз через минуту",
  } satisfies Record<Exclude<ApiErrorCode, RuleErrorCode>, string>,
  /** Тексты SPEC §9 с числами из настроек: при настройках по умолчанию — дословно как в SPEC. */
  ruleErrors: {
    OUTSIDE_WORKING_HOURS: (s: TextSettings) => `Выберите время с ${s.workdayStart} до ${s.workdayEnd}`,
    TOO_SHORT: (s: TextSettings) => `Выберите не меньше ${durationGenitive(s.minDurationMinutes)}`,
    TOO_LONG: (s: TextSettings) => `Выберите не больше ${durationGenitive(s.maxDurationMinutes)}`,
    OFF_GRID: (s: TextSettings) => `Выберите время с шагом ${withWord(s.slotMinutes, ["минута", "минуты", "минут"])}`,
    OUT_OF_HORIZON: (s: TextSettings) =>
      `Бронировать можно не дальше чем на ${withWord(s.bookingHorizonDays, ["день", "дня", "дней"])} вперёд`,
    TITLE_TOO_LONG: (s: TextSettings) =>
      `Сократите название до ${withWord(s.titleMaxLength, ["символа", "символов", "символов"])}`,
  } satisfies Record<RuleErrorCode, (settings: TextSettings) => string>,
  pastTime: (time: string) => `Это время уже прошло. Выберите начало не раньше ${time}`,
} as const;
