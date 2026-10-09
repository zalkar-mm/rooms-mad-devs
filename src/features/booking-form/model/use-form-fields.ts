import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { type BookingDraft, useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import type { BookingRulesConfig } from "@/entities/booking/model/booking-rules.types";

import { fromMinutes, toMinutes } from "@/shared/lib/time/minutes";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";

import { toFormValues } from "../lib/form-values";

import { type BookingFormValues, createBookingFormSchema } from "./booking-form.schema";
import type { SlotField } from "./booking-form.types";

type FieldsParams = {
  draft: BookingDraft;
  config: BookingRulesConfig;
  /** Правка перенесла дату — сетка показывает её (T10 §4.3а). */
  onDateChange: (date: IsoDate) => void;
};

const SET_OPTIONS = { shouldDirty: true, shouldValidate: true } as const;

/** Значения формы и их запись: сразу в форму и в черновик (SPEC §3). */
export function useFormFields({ draft, config, onDateChange }: FieldsParams) {
  const updateDraft = useBookingDraftStore((state) => state.updateDraft);
  const form = useForm<BookingFormValues>({
    defaultValues: { title: draft.title, date: draft.date, start: draft.start, end: draft.end },
    resolver: zodResolver(createBookingFormSchema(config)),
    mode: "all",
  });
  const values = toFormValues(useWatch({ control: form.control }));
  const isEdit = draft.editing !== undefined;

  const setField = (field: SlotField, value: string) => {
    form.setValue(field, value, SET_OPTIONS);
    updateDraft({ [field]: value });
    if (field === "date" && isEdit) onDateChange(value);
  };

  /** Новое начало сдвигает окончание с той же длительностью, если оно укладывается в день (T06 Q2). */
  const changeStart = (start: HhMm) => {
    const duration = toMinutes(values.end) - toMinutes(values.start);
    const shiftedEnd = toMinutes(start) + duration;
    const keepsDuration = duration > 0 && shiftedEnd <= toMinutes(config.workdayEnd);
    setField("start", start);
    if (keepsDuration) setField("end", fromMinutes(shiftedEnd));
  };

  return { form, values, setField, changeStart };
}

/** Название: ввод и подсказки. Подсказка заменяет текст, курсор — в конце (T08 §3.7). */
export function useTitleField(form: ReturnType<typeof useFormFields>["form"]) {
  const updateDraft = useBookingDraftStore((state) => state.updateDraft);
  return {
    onTitleChange: (title: string) => {
      updateDraft({ title });
    },
    pickTitle: (title: string) => {
      form.setValue("title", title, SET_OPTIONS);
      updateDraft({ title });
      form.setFocus("title");
      const input = document.activeElement;
      if (input instanceof HTMLInputElement) input.setSelectionRange(title.length, title.length);
    },
  };
}
