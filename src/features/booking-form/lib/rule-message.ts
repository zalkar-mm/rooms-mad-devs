import type { BookingRuleError, BookingRulesConfig } from "@/entities/booking/model/booking-rules.types";

import { ApiErrorCode } from "@/shared/api/api-error";
import { errorText } from "@/shared/api/localize-api-error";
import { TEXTS } from "@/shared/consts/texts";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";

type RuleMessageParams = { error: BookingRuleError; date: IsoDate; display: TimeDisplay; config: BookingRulesConfig };

/**
 * Текст правила у поля: `PAST_TIME` с ближайшим началом в поясе полей (T15), пересечение до отправки —
 * черновик T06, остальное — текст SPEC §9 по коду.
 */
export function ruleMessage({ error, date, display, config }: RuleMessageParams): string {
  if (error.code === ApiErrorCode.PastTime && error.earliestStart !== undefined) {
    return TEXTS.pastTime(display.time(date, error.earliestStart));
  }
  if (error.code === ApiErrorCode.Conflict) return TEXTS.form.overlap;
  return errorText(error.code, config);
}
