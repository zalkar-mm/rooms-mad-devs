import type { z } from "zod";

import { ApiError, ApiErrorCode } from "./api-error";

/** Ответ не по контракту — для экрана то же, что сбой сервера: `NETWORK` и «Повторить». */
export function parseResponse<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) throw new ApiError({ code: ApiErrorCode.Network, status: 0, message: "" });
  return result.data;
}
