import { type ChangeEvent, type ReactNode, useState } from "react";

import type { BookingFormMode } from "@/features/booking-form/model/booking-form.types";
import { BookingForm } from "@/features/booking-form/ui/booking-form";

import { TEXTS } from "@/shared/consts/texts";
import { ChipGroup } from "@/shared/ui/chip-group";
import { DatePicker } from "@/shared/ui/date-picker";
import { TextField } from "@/shared/ui/text-field";
import { TimeSelect } from "@/shared/ui/time-select";

import {
  DATE_FIELD,
  DATES,
  dateText,
  END_OPTIONS,
  KIT_BOOK_RANGE,
  noop,
  START_OPTIONS,
  SUGGESTIONS,
} from "./ui-kit.fixtures";

export type BookingFormDemoProps = {
  mode: BookingFormMode;
  initialTitle?: string;
  titleError?: string;
  status?: ReactNode;
  submitting?: boolean;
  submitDisabled?: boolean;
};

/** Форма брони с живыми полями кита — только для /ui-kit, без react-hook-form и запросов. */
export function BookingFormDemo({
  mode,
  initialTitle = "",
  titleError,
  status,
  submitting = false,
  submitDisabled = false,
}: BookingFormDemoProps) {
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState<string>(DATES.today);
  const [start, setStart] = useState<string | undefined>("14:30");
  const [end, setEnd] = useState<string | undefined>("16:00");
  const counter = TEXTS.form.counter(title.length, 60);
  const dateLabel = dateText(date);

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const titleField = (
    <TextField
      label={TEXTS.form.title}
      placeholder={TEXTS.form.titlePlaceholder}
      value={title}
      onChange={handleTitleChange}
      maxLength={60}
      counter={counter}
      error={titleError}
      disabled={submitting}
    />
  );
  const chips = <ChipGroup items={SUGGESTIONS} onPick={setTitle} disabled={submitting} />;
  const dateField = (
    <DatePicker
      trigger={DATE_FIELD}
      mode="book"
      value={date}
      valueText={dateLabel}
      onChange={setDate}
      range={KIT_BOOK_RANGE}
      disabled={submitting}
    />
  );
  const startField = (
    <TimeSelect
      label={TEXTS.form.start}
      value={start}
      options={START_OPTIONS}
      onChange={setStart}
      disabled={submitting}
    />
  );
  const endField = (
    <TimeSelect label={TEXTS.form.end} value={end} options={END_OPTIONS} onChange={setEnd} disabled={submitting} />
  );

  const fields = { title: titleField, chips, date: dateField, start: startField, end: endField };

  return (
    <BookingForm
      mode={mode}
      fields={fields}
      duration="1 ч 30 мин"
      status={status}
      onSubmit={noop}
      onCancel={noop}
      submitting={submitting}
      submitDisabled={submitDisabled}
    />
  );
}
