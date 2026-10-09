import type { BookingField } from "@/entities/booking/model/booking-rules.types";

import type { TEXTS } from "@/shared/consts/texts";

import type { BookingFormValues } from "./booking-form.schema";

/** «Новая бронь» или «Правка» (SPEC §6.3). Заголовки — `TEXTS.panel.formTitle`. */
export type BookingFormMode = keyof typeof TEXTS.panel.formTitle;

/** Чем закончилось сохранение. Тексты — `TEXTS.panel.savedText`. */
export type SavedKind = keyof typeof TEXTS.panel.savedText;

/** Сообщение над кнопками формы: 409, 422 без поля, сбой сети. */
export type FormStatusKind = "none" | "conflict" | "validation" | "failure";

export type FormStatus = { kind: FormStatusKind; text?: string };

/** Тексты ошибок у полей; `undefined` — поле в порядке. */
export type FormErrors = Record<BookingField, string | undefined>;

/** Поля даты и времени: их меняют контролы, а не ввод текста. */
export type SlotField = Exclude<BookingField, "title">;

/** Отказ сервера у поля и значения, с которыми его получили: пока они те же, ошибка видна. */
export type ServerFieldError = { field: BookingField; message: string; values: BookingFormValues };
