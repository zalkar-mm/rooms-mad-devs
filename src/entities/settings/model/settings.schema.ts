import { z } from "zod";

import { HH_MM_PATTERN } from "@/shared/lib/time/types";

import type { Settings } from "./settings.types";

const hhMm = z.string().regex(HH_MM_PATTERN);
const positiveInt = z.number().int().positive();

/** Ответ настроек проверяется целиком: без любого поля экран показывает сбой загрузки (T01 §6). */
export const settingsSchema = z.object({
  timezone: z.string().min(1),
  workdayStart: hhMm,
  workdayEnd: hhMm,
  slotMinutes: positiveInt,
  minDurationMinutes: positiveInt,
  maxDurationMinutes: positiveInt,
  bookingHorizonDays: z.number().int().nonnegative(),
  historyDays: z.number().int().nonnegative(),
  workingWeekdays: z.array(z.literal([1, 2, 3, 4, 5, 6, 7])),
  titleMaxLength: positiveInt,
  titleSuggestions: z.array(z.string()),
  serverNow: z.iso.datetime({ offset: true }),
}) satisfies z.ZodType<Settings>;
