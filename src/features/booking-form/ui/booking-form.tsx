import type { ReactNode, SubmitEvent } from "react";

import { TEXTS } from "@/shared/consts/texts";
import { ActionBar } from "@/shared/ui/action-bar";
import { Button } from "@/shared/ui/button";
import { Gate } from "@/shared/ui/gate";

import type { BookingFormMode } from "../model/booking-form.types";

/** Поля приходят готовыми (TextField, ChipGroup, DatePicker, TimeSelect): форма не знает о react-hook-form. */
export type BookingFormFields = {
  title: ReactNode;
  chips?: ReactNode;
  date: ReactNode;
  start: ReactNode;
  end: ReactNode;
};

export type BookingFormProps = {
  mode: BookingFormMode;
  fields: BookingFormFields;
  /** Готовая длительность «1 ч 30 мин». */
  duration: string;
  /** FormStatus — прямо над кнопками. */
  status?: ReactNode;
  onSubmit: () => void;
  onCancel: () => void;
  submitDisabled?: boolean;
  submitting?: boolean;
};

/** «Новая бронь» и «Правка». Enter в поле названия отправляет форму. */
export function BookingForm({
  mode,
  fields,
  duration,
  status,
  onSubmit,
  onCancel,
  submitDisabled = false,
  submitting = false,
}: BookingFormProps) {
  const hasChips = fields.chips !== undefined;
  // Название формы для читалки; заголовок панели с тем же текстом ставит родитель.
  const formTitle = TEXTS.panel.formTitle[mode];
  const hasStatus = status !== undefined;
  const durationText = TEXTS.form.duration(duration);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitDisabled || submitting) return;
    onSubmit();
  };

  return (
    <form noValidate aria-label={formTitle} onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.title}
      <Gate when={hasChips}>{fields.chips}</Gate>
      {fields.date}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="min-w-0 flex-1">{fields.start}</div>
        <div className="min-w-0 flex-1">{fields.end}</div>
      </div>
      <p className="text-small text-grey-50 tabular-nums">{durationText}</p>
      <Gate when={hasStatus}>{status}</Gate>
      <ActionBar className="border-t border-grey-20 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          {TEXTS.panel.cancel}
        </Button>
        <Button type="submit" loading={submitting} loadingText={TEXTS.panel.saving} disabled={submitDisabled}>
          {TEXTS.panel.save}
        </Button>
      </ActionBar>
    </form>
  );
}
