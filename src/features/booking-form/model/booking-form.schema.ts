import { z } from "zod";

import { validateTitle } from "@/entities/booking/lib/booking-rules";
import type { BookingRulesConfig } from "@/entities/booking/model/booking-rules.types";

import { errorText } from "@/shared/api/localize-api-error";

/**
 * Схема формы брони: название проверяет то же правило, что сервер (P6). Время и дату форма проверяет в
 * рендере через `validateSlot`: ответ зависит от «сейчас», которое сдвигается раз в минуту, и от броней дня.
 */
export function createBookingFormSchema(config: BookingRulesConfig) {
  return z.object({
    title: z.string().superRefine((title, context) => {
      const error = validateTitle(title, config);
      if (error) context.addIssue({ code: "custom", message: errorText(error.code, config) });
    }),
    date: z.string(),
    start: z.string(),
    end: z.string(),
  });
}

export type BookingFormValues = z.infer<ReturnType<typeof createBookingFormSchema>>;
