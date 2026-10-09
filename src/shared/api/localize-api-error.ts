import { type RuleErrorCode, TEXTS, type TextSettings } from "../consts/texts";

import type { ApiError, ApiErrorCode } from "./api-error";

const isRuleCode = (code: ApiErrorCode): code is RuleErrorCode => Object.hasOwn(TEXTS.ruleErrors, code);

/** Текст SPEC §9 по коду; числа в текстах правил — из настроек (D35). */
export function errorText(code: ApiErrorCode, settings: TextSettings): string {
  if (isRuleCode(code)) return TEXTS.ruleErrors[code](settings);
  return TEXTS.errors[code];
}

/** `message` из ответа, при пустом — текст по коду (D10). */
export function localizeApiError(error: ApiError, settings: TextSettings): string {
  return error.message || errorText(error.code, settings);
}
