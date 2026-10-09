import type { Settings } from "@/entities/settings/model/settings.types";

/** Настройки mock-сервера (SPEC §4). Интерфейс получает их только через `GET /api/settings` (D35). */
export const MOCK_SETTINGS: Omit<Settings, "serverNow"> = {
  timezone: "Asia/Bishkek",
  workdayStart: "09:00",
  workdayEnd: "18:00",
  slotMinutes: 30,
  minDurationMinutes: 30,
  maxDurationMinutes: 120,
  bookingHorizonDays: 30,
  historyDays: 30,
  workingWeekdays: [1, 2, 3, 4, 5],
  titleMaxLength: 60,
  titleSuggestions: ["Созвон", "Встреча", "Работа в тишине", "Собеседование", "Планирование"],
};
