import { isAxiosError } from "axios";
import { z } from "zod";

import { ApiError, ApiErrorCode } from "./api-error";

const errorBodySchema = z.object({
  code: z.enum(ApiErrorCode),
  message: z.string().optional(),
  field: z.string().optional(),
});

/** Единственное место, где разбирается ошибка axios (docs/data.md §2). */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!isAxiosError<unknown>(error) || !error.response)
    return new ApiError({ code: ApiErrorCode.Network, status: 0, message: "" });

  const { status, data } = error.response;
  if (status >= 500) return new ApiError({ code: ApiErrorCode.Network, status, message: "" });

  const body = errorBodySchema.safeParse(data);
  if (!body.success) return new ApiError({ code: ApiErrorCode.Network, status, message: "" });

  return new ApiError({ code: body.data.code, status, message: body.data.message ?? "", field: body.data.field });
}
