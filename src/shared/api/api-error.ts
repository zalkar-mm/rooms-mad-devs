/** Коды отказа сервера (SPEC §9) и клиентский `NETWORK`. */
export const ApiErrorCode = {
  OutsideWorkingHours: "OUTSIDE_WORKING_HOURS",
  InvalidRange: "INVALID_RANGE",
  TooShort: "TOO_SHORT",
  TooLong: "TOO_LONG",
  OffGrid: "OFF_GRID",
  PastTime: "PAST_TIME",
  OutOfHorizon: "OUT_OF_HORIZON",
  Weekend: "WEEKEND",
  TitleRequired: "TITLE_REQUIRED",
  TitleTooLong: "TITLE_TOO_LONG",
  BookingLocked: "BOOKING_LOCKED",
  RoomNotFound: "ROOM_NOT_FOUND",
  NotFound: "NOT_FOUND",
  Conflict: "CONFLICT",
  /** Клиентский: нет ответа, таймаут, `5xx` или ответ не по контракту. */
  Network: "NETWORK",
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

type ApiErrorInit = { code: ApiErrorCode; status: number; message: string; field?: string };

/** Отказ API в форме контракта `{ code, message, field? }` (SPEC §13, D10). */
export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly code: ApiErrorCode;
  /** HTTP-статус; `0` — ответа не было. */
  readonly status: number;
  readonly field?: string;

  constructor({ code, status, message, field }: ApiErrorInit) {
    super(message);
    this.code = code;
    this.status = status;
    this.field = field;
  }
}
