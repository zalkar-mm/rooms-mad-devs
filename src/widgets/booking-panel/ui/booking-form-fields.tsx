import type { ChangeEvent } from "react";

import type { useBookingForm } from "@/features/booking-form/model/use-booking-form";

import { isWorkingDay } from "@/entities/booking/lib/booking-rules";
import { slotEnds, slotStarts } from "@/entities/booking/lib/time-slots";

import { TEXTS } from "@/shared/consts/texts";
import { formatShortDate } from "@/shared/lib/time/format";
import { addIsoDays } from "@/shared/lib/time/iso-date";
import { toMinutes } from "@/shared/lib/time/minutes";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";
import { ChipGroup } from "@/shared/ui/chip-group";
import { DatePicker } from "@/shared/ui/date-picker";
import { TextField } from "@/shared/ui/text-field";
import { TimeSelect } from "@/shared/ui/time-select";

import type { PanelEnv } from "../model/panel-env";

/** Поля формы брони: значения и ошибки — из `useBookingForm`, подписи времени — в поясе режима (T15 §3.5). */
export type BookingFormFieldProps = {
  form: ReturnType<typeof useBookingForm>;
  env: PanelEnv;
  display: TimeDisplay;
};

export function TitleField({ form, env }: BookingFormFieldProps) {
  const registration = form.register("title", {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      form.onTitleChange(event.target.value);
    },
  });
  const counter = TEXTS.form.counter(form.values.title.length, env.config.titleMaxLength);

  return (
    <TextField
      {...registration}
      data-autofocus
      label={TEXTS.form.title}
      placeholder={TEXTS.form.titlePlaceholder}
      value={form.values.title}
      maxLength={env.config.titleMaxLength}
      counter={counter}
      error={form.errors.title}
      readOnly={form.submitting}
    />
  );
}

export function TitleChips({ form, env }: BookingFormFieldProps) {
  return <ChipGroup items={env.titleSuggestions} onPick={form.pickTitle} disabled={form.submitting} />;
}

export function DateField({ form, env }: BookingFormFieldProps) {
  const { config, now } = env;
  const valueText = formatShortDate(form.values.date);
  const maxDate = addIsoDays(now.date, config.bookingHorizonDays);
  const isWeekend = (date: IsoDate) => !isWorkingDay(date, config);
  const range = { min: now.date, max: maxDate, today: now.date, isWeekend };
  const trigger = { kind: "field", label: TEXTS.form.date, error: form.errors.date } as const;
  const handleChange = (value: IsoDate) => {
    form.setField("date", value);
  };

  return (
    <DatePicker
      trigger={trigger}
      mode="book"
      value={form.values.date}
      valueText={valueText}
      onChange={handleChange}
      range={range}
      disabled={form.submitting}
    />
  );
}

export function StartField({ form, env, display }: BookingFormFieldProps) {
  const earliest = form.earliestStart;
  const isBeforeEarliest = (value: HhMm) => earliest === null || toMinutes(value) < toMinutes(earliest);
  const options = slotStarts(env.config).map((value) => ({
    value,
    label: display.time(form.values.date, value),
    disabled: isBeforeEarliest(value),
  }));
  const handleChange = (value: HhMm) => {
    form.changeStart(value);
  };

  return (
    <TimeSelect
      label={TEXTS.form.start}
      value={form.values.start}
      options={options}
      onChange={handleChange}
      error={form.errors.start}
      disabled={form.submitting}
    />
  );
}

export function EndField({ form, env, display }: BookingFormFieldProps) {
  const options = slotEnds(env.config).map((value) => ({ value, label: display.time(form.values.date, value) }));
  const handleChange = (value: HhMm) => {
    form.setField("end", value);
  };

  return (
    <TimeSelect
      label={TEXTS.form.end}
      value={form.values.end}
      options={options}
      onChange={handleChange}
      error={form.errors.end}
      disabled={form.submitting}
    />
  );
}
