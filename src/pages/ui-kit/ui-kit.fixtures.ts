import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

import type { MonthDayCellProps } from "@/widgets/room-calendar/ui/month-day-cell";

import { slotStarts } from "@/entities/booking/lib/time-slots";
import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingRulesConfig } from "@/entities/booking/model/booking-rules.types";
import type { RoomCardProps } from "@/entities/room/ui/room-card";

import { ROUTES } from "@/shared/consts/routes";
import { TEXTS } from "@/shared/consts/texts";
import type { TimeOption } from "@/shared/ui/time-select";

/** Моковые данные страницы /ui-kit. Даты и время — фиксированные строки, без часов. */

export const noop = () => undefined;

/** Настройки витрины — значения SPEC §4: тексты с числами строятся из них, как в приложении. */
export const KIT_SETTINGS: BookingRulesConfig = {
  workdayStart: "09:00",
  workdayEnd: "18:00",
  slotMinutes: 30,
  minDurationMinutes: 30,
  maxDurationMinutes: 120,
  bookingHorizonDays: 30,
  historyDays: 30,
  workingWeekdays: [1, 2, 3, 4, 5],
  titleMaxLength: 60,
};

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** 09:00…18:00 с шагом 30 минут. */
const TIME_LABELS = Array.from({ length: 19 }, (_, index) => toTime(9 * 60 + index * 30));

export const START_OPTIONS: TimeOption[] = TIME_LABELS.slice(0, -1).map((value) => ({
  value,
  disabled: value < "14:30",
}));
export const END_OPTIONS: TimeOption[] = TIME_LABELS.slice(1).map((value) => ({ value, disabled: value < "15:00" }));

export const VIEW_OPTIONS = [
  { value: "day", label: TEXTS.calendar.views.day },
  { value: "week", label: TEXTS.calendar.views.week },
  { value: "month", label: TEXTS.calendar.views.month },
] as const;

export type CalendarView = (typeof VIEW_OPTIONS)[number]["value"];

export const DATES = {
  today: "2026-10-07",
  min: "2026-09-07",
  max: "2026-11-06",
  todayText: "Ср, 7 октября",
} as const;

/** Подпись даты «Ср, 7 октября» — в приложении её готовит shared/lib/time, здесь — фикстура. */
export const dateText = (date: string) => {
  const text = format(parseISO(date), "EEEEEE, d MMMM", { locale: ru });
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const isWeekendFixture = (date: string) => {
  const day = new Date(`${date}T00:00:00`).getDay();
  return day === 0 || day === 6;
};

/** Заготовка сетки витрины: слоты рабочего дня из настроек, пять недель месяца. */
export const KIT_SKELETON_SHAPE = { rows: slotStarts(KIT_SETTINGS).length, cells: 35 };

/** Диапазоны DatePicker витрины: просмотр — с историей, бронь — с сегодня. */
export const KIT_VIEW_RANGE = { min: DATES.min, max: DATES.max, today: DATES.today, isWeekend: isWeekendFixture };
export const KIT_BOOK_RANGE = { ...KIT_VIEW_RANGE, min: DATES.today };

export const DATE_BUTTON = { kind: "button" } as const;
export const DATE_FIELD = { kind: "field", label: TEXTS.form.date } as const;
export const DATE_FIELD_WEEKEND = { ...DATE_FIELD, error: TEXTS.errors.WEEKEND } as const;

export const SUGGESTIONS = ["Созвон", "Встреча", "Работа в тишине", "Собеседование", "Планирование"];

export const FREE_ROOM: Omit<RoomCardProps, "error"> = {
  name: "Переговорная 1",
  href: ROUTES.ROOM("r1"),
  now: { tone: "free", text: TEXTS.rooms.freeUntil("14:30") },
  nextHourLabel: TEXTS.rooms.nextHourFree,
  nextHour: [],
};

export const ERROR_ROOM: RoomCardProps = {
  name: "Переговорная 5",
  href: ROUTES.ROOM("r5"),
  now: { tone: "free", text: "" },
  nextHourLabel: "",
  nextHour: [],
  error: { text: TEXTS.rooms.bookingsFailed, onRetry: noop },
};

export const ROOM_CARDS: { label: string; props: Omit<RoomCardProps, "error"> }[] = [
  { label: "Свободна, ближайший час: 0 броней", props: FREE_ROOM },
  {
    label: "Занята, ближайший час: 1 бронь",
    props: {
      name: "Переговорная 2",
      href: ROUTES.ROOM("r2"),
      now: { tone: "busy", text: TEXTS.rooms.busyUntil("14:00", "Созвон") },
      nextHourLabel: TEXTS.rooms.nextHour,
      nextHour: [TEXTS.rooms.nextHourItem("14:30–15:00", "Встреча")],
    },
  },
  {
    label: "Свободна до конца дня, ближайший час: 3 брони",
    props: {
      name: "Переговорная 3",
      href: ROUTES.ROOM("r3"),
      now: { tone: "free", text: TEXTS.rooms.freeUntilEndOfDay },
      nextHourLabel: TEXTS.rooms.nextHour,
      nextHour: [
        TEXTS.rooms.nextHourItem("14:00–14:30", "Созвон"),
        TEXTS.rooms.nextHourItem("14:30–15:00", "Встреча"),
        TEXTS.rooms.nextHourItem("15:00–16:00", "Планирование"),
      ],
    },
  },
  {
    label: "Нерабочее время",
    props: {
      name: "Переговорная 4",
      href: ROUTES.ROOM("r4"),
      now: { tone: "off", text: TEXTS.rooms.offHours },
      nextHourLabel: TEXTS.rooms.nextHourFree,
      nextHour: [],
      opensText: TEXTS.rooms.opensOn("понедельник", "09:00"),
    },
  },
];

/** «Сейчас» витрины: среда 7 октября, 10:20 во времени комнаты. */
export const KIT_NOW = { date: DATES.today, time: "10:20" };

/** Даты демо-сетки: сегодня, завтра, выходной и день вне горизонта. */
export const KIT_GRID_DATES = ["2026-10-07", "2026-10-08", "2026-10-10", "2026-11-09"];

const kitBooking = (booking: Omit<Booking, "roomId">): Booking => ({ ...booking, roomId: "r1" });

/** Брони демо-сетки: прошедшая, идущая, будущая, на 30 минут, выбранная и пересекающая черновик. */
export const KIT_BOOKINGS: Booking[] = [
  kitBooking({ id: "k1", date: "2026-10-07", start: "09:00", end: "10:00", title: "Планирование" }),
  kitBooking({ id: "k2", date: "2026-10-07", start: "10:00", end: "11:00", title: "Созвон" }),
  kitBooking({ id: "k3", date: "2026-10-07", start: "11:00", end: "12:00", title: "Встреча" }),
  kitBooking({ id: "k4", date: "2026-10-07", start: "13:00", end: "13:30", title: "Собеседование" }),
  kitBooking({ id: "k5", date: "2026-10-07", start: "14:00", end: "15:30", title: "Работа в тишине" }),
  kitBooking({ id: "k6", date: "2026-10-08", start: "10:00", end: "11:00", title: "Созвон" }),
  kitBooking({ id: "k7", date: "2026-10-08", start: "15:00", end: "16:00", title: "Встреча" }),
];

/** Черновик, упёршийся в 2 часа и пересекающий бронь после `409`. */
export const KIT_DRAFT = { date: "2026-10-08", start: "10:00", end: "12:00", atLimit: true };

export const MONTH_CELLS: { label: string; state?: "hover" | "focus"; props: Omit<MonthDayCellProps, "onOpenDay"> }[] =
  [
    {
      label: "обычная, 3 брони + ещё",
      props: {
        dayNumber: 8,
        state: "normal",
        lines: [
          { id: "m1", time: "10:00", title: "Созвон", past: false },
          { id: "m2", time: "12:00", title: "Работа в тишине", past: false },
          { id: "m3", time: "15:00", title: "Встреча", past: false },
        ],
        moreText: TEXTS.calendar.moreBookings(2),
        ariaLabel: "Четверг 8 октября, 5 броней",
      },
    },
    {
      label: "сегодня, прошедшие серые",
      props: {
        dayNumber: 7,
        state: "today",
        lines: [
          { id: "m4", time: "09:00", title: "Планирование", past: true },
          { id: "m5", time: "11:00", title: "Встреча", past: false },
        ],
        ariaLabel: "Среда 7 октября, 2 брони",
      },
    },
    {
      label: "выходной",
      props: { dayNumber: 10, state: "weekend", lines: [], ariaLabel: "Суббота 10 октября, броней нет" },
    },
    {
      label: "другой месяц",
      props: { dayNumber: 30, state: "otherMonth", lines: [], ariaLabel: "Среда 30 сентября, броней нет" },
    },
    {
      label: "вне горизонта",
      props: { dayNumber: 9, state: "outOfHorizon", lines: [], ariaLabel: "Понедельник 9 ноября, недоступно" },
    },
    {
      label: "hover",
      state: "hover",
      props: { dayNumber: 12, state: "normal", lines: [], ariaLabel: "Понедельник 12 октября, броней нет" },
    },
    {
      label: "focus",
      state: "focus",
      props: { dayNumber: 13, state: "normal", lines: [], ariaLabel: "Вторник 13 октября, броней нет" },
    },
  ];
