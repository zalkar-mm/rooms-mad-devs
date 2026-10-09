import { HttpResponse } from "msw";

import type { ApiErrorCode } from "@/shared/api/api-error";
import { errorText } from "@/shared/api/localize-api-error";

import { MOCK_SETTINGS } from "../db/settings";

type ErrorStatus = 404 | 409 | 422;

/** Отказ в форме контракта `{ code, message, field? }`; `message` — текст SPEC §9 (D10). */
export function respondError(status: ErrorStatus, code: ApiErrorCode, options?: { field?: string; message?: string }) {
  const body = { code, message: options?.message ?? errorText(code, MOCK_SETTINGS), field: options?.field };
  return HttpResponse.json(body, { status });
}
