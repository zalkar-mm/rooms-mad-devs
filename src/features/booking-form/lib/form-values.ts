import type { Booking, BookingPatch } from "@/entities/booking/model/booking.types";

import type { BookingFormValues } from "../model/booking-form.schema";
import type { ServerFieldError, SlotField } from "../model/booking-form.types";

/** Поля даты и времени, к которым сервер может привязать отказ. */
const SLOT_FIELDS = ["date", "start", "end"] as const satisfies readonly SlotField[];

/** Поле отказа сервера, если это дата или время. */
export const toSlotField = (field: string | undefined): SlotField | undefined =>
  SLOT_FIELDS.find((name) => name === field);

/** В `PATCH` уходят только изменённые поля (T10 §3.11); название сравнивается после обрезки (P6). */
export function changedFields(original: Booking, values: BookingFormValues): BookingPatch {
  const patch: BookingPatch = {};
  const title = values.title.trim();
  if (title !== original.title) patch.title = title;
  if (values.date !== original.date) patch.date = values.date;
  if (values.start !== original.start) patch.start = values.start;
  if (values.end !== original.end) patch.end = values.end;
  return patch;
}

const sameValues = (a: BookingFormValues, b: BookingFormValues) =>
  a.title === b.title && a.date === b.date && a.start === b.start && a.end === b.end;

/** useWatch типизирует значения как частичные; все поля заданы в defaultValues. */
export const toFormValues = (watched: Partial<BookingFormValues>): BookingFormValues => ({
  title: watched.title ?? "",
  date: watched.date ?? "",
  start: watched.start ?? "",
  end: watched.end ?? "",
});

/** Ошибка сервера у поля видна, пока значения те же, что ушли на сервер. */
export const activeServerField = (serverField: ServerFieldError | null, values: BookingFormValues) =>
  serverField !== null && sameValues(serverField.values, values) ? serverField : null;
