import type { RefObject } from "react";

import type { SavedKind } from "@/features/booking-form/model/booking-form.types";

import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingSelection } from "@/entities/booking/model/booking-selection.types";

import type { TimeDisplay } from "@/shared/lib/time/time-display";
import type { IsoDate } from "@/shared/lib/time/types";

import type { useCalendarPanel } from "./use-calendar-panel";

/** Что календарь отдаёт боковой панели. Раскладка: справа от сетки от 1200 px, уже — поверх (SPEC §11). */
export type CalendarPanelProps = {
  roomId: string;
  selection: {
    current: BookingSelection;
    successText: string | undefined;
    focusEmpty: boolean;
    draftHidden: boolean;
    noTime: boolean;
  };
  actions: {
    onClose: () => void;
    onBookingSaved: (booking: Booking, kind: SavedKind) => void;
    onDraftDateChange: (date: IsoDate) => void;
    onBookingMissing: () => void;
    onBookingDeleted: () => void;
    onHideDraft: () => void;
  };
  /** Подписи времени в поясе режима «Моё время» или комнаты (D23). */
  display: TimeDisplay;
  layout: "side" | "overlay";
  returnFocusRef: RefObject<HTMLElement | null>;
  leaveConfirm: { onStay: () => void; onLeave: () => void } | undefined;
};

type PanelPropsSource = Pick<CalendarPanelProps, "roomId" | "display" | "layout" | "leaveConfirm"> & {
  panel: ReturnType<typeof useCalendarPanel>;
  /** Правка перенесла дату — календарь показывает её (T10 §4.3а). */
  onDraftDateChange: (date: IsoDate) => void;
};

/** Пропсы панели из состояния календаря: что открыто и что панель может сделать. */
export function buildPanelProps({ panel, onDraftDateChange, ...rest }: PanelPropsSource): CalendarPanelProps {
  return {
    ...rest,
    selection: {
      current: panel.selection,
      successText: panel.successText,
      focusEmpty: panel.focusEmpty,
      draftHidden: panel.draftHidden,
      noTime: panel.noTime,
    },
    actions: {
      onClose: panel.onClose,
      onBookingSaved: panel.onSaved,
      onDraftDateChange,
      onBookingMissing: panel.onMissing,
      onBookingDeleted: panel.onDeleted,
      onHideDraft: panel.onHideDraft,
    },
    returnFocusRef: panel.openerRef,
  };
}
