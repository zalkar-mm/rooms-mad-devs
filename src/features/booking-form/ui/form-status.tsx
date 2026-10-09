import { TEXTS } from "@/shared/consts/texts";
import { assertNever } from "@/shared/lib/assert-never";
import { Notice } from "@/shared/ui/notice";
import { RetryNotice } from "@/shared/ui/retry-notice";

import type { FormStatusKind } from "../model/booking-form.types";

export type FormStatusProps = {
  kind: FormStatusKind;
  /** Текст сервера: `validation` (422 без поля) и `conflict` (`message` ответа, при пустом — текст по коду). */
  serverText?: string;
  /** «Повторить» для `failure`. */
  onRetry: () => void;
};

/** Сообщение формы над кнопками: 409, 422 без поля, сбой сети. */
export function FormStatus({ kind, serverText, onRetry }: FormStatusProps) {
  switch (kind) {
    case "none":
      return null;
    case "conflict":
      return <Notice variant="warning">{serverText ?? TEXTS.errors.CONFLICT}</Notice>;
    case "validation":
      return <Notice variant="warning">{serverText}</Notice>;
    case "failure":
      return <RetryNotice text={TEXTS.errors.NETWORK} onRetry={onRetry} />;
    default:
      return assertNever(kind);
  }
}
