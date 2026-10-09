import type { RefObject } from "react";

import type { SavedKind } from "@/features/booking-form/model/booking-form.types";
import { useBookingForm } from "@/features/booking-form/model/use-booking-form";
import { BookingForm } from "@/features/booking-form/ui/booking-form";
import { FormStatus } from "@/features/booking-form/ui/form-status";

import { formatDuration } from "@/entities/booking/lib/format-duration";
import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingDraft } from "@/entities/booking/model/booking-draft.store";

import { TEXTS } from "@/shared/consts/texts";
import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";

import type { PanelEnv } from "../model/panel-env";

import { DateField, EndField, StartField, TitleChips, TitleField } from "./booking-form-fields";
import { PanelContainer, type PanelLayout } from "./panel-container";

/** Колбэки формы: результат отправки и выход из неё. */
export type BookingFormActions = {
  onSaved: (booking: Booking, kind: SavedKind) => void;
  /** Правка перенесла дату — календарь показывает её (T10 §4.3а). */
  onDateChange: (date: IsoDate) => void;
  /** Правка получила `404`. */
  onNotFound: () => void;
  /** «Отмена» и Esc: черновик удаляется. */
  onCancel: () => void;
  /** «Назад к календарю» поверх сетки: черновик остаётся (D33). */
  onBack: () => void;
};

export type BookingFormPanelProps = {
  draft: BookingDraft;
  env: PanelEnv;
  /** «Моё время»: подписи значений в поясе устройства, значения — время комнаты (D23, T15 §3.5). */
  display: TimeDisplay;
  layout: PanelLayout;
  returnFocusRef: RefObject<HTMLElement | null>;
  actions: BookingFormActions;
};

/** Панели «Новая бронь» и «Правка» (SPEC §6.3, T06, T10): поля кита, сценарий — `useBookingForm`. */
export function BookingFormPanel({ draft, env, display, layout, returnFocusRef, actions }: BookingFormPanelProps) {
  const form = useBookingForm({
    draft,
    config: env.config,
    now: env.now,
    display,
    onSaved: actions.onSaved,
    onDateChange: actions.onDateChange,
    onNotFound: actions.onNotFound,
  });
  const mode = draft.editing ? "edit" : "create";
  const formTitle = TEXTS.panel.formTitle[mode];
  const fieldProps = { form, env, display };
  const fields = {
    title: <TitleField {...fieldProps} />,
    chips: <TitleChips {...fieldProps} />,
    date: <DateField {...fieldProps} />,
    start: <StartField {...fieldProps} />,
    end: <EndField {...fieldProps} />,
  };
  const duration = formatDuration(form.durationMinutes);
  const status = <FormStatus kind={form.status.kind} serverText={form.status.text} onRetry={form.onRetry} />;

  return (
    <PanelContainer
      title={formTitle}
      onClose={actions.onCancel}
      onBack={actions.onBack}
      layout={layout}
      returnFocusRef={returnFocusRef}
    >
      <BookingForm
        mode={mode}
        fields={fields}
        duration={duration}
        status={status}
        onSubmit={form.onSubmit}
        onCancel={actions.onCancel}
        submitDisabled={form.submitDisabled}
        submitting={form.submitting}
      />
    </PanelContainer>
  );
}
