import type { SavedKind } from "@/features/booking-form/model/booking-form.types";

import { firstFreeSlot } from "@/entities/booking/lib/booking-rules";
import type { Booking } from "@/entities/booking/model/booking.types";
import { type BookingDraft, useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import { DOM_IDS } from "@/shared/consts/dom-ids";
import { TEXTS } from "@/shared/consts/texts";
import { announce } from "@/shared/lib/announce";
import { fromMinutes, toMinutes } from "@/shared/lib/time/minutes";
import type { HhMm, IsoDate } from "@/shared/lib/time/types";
import { useAnnounceWhen } from "@/shared/lib/use-announce-when";

import { useBookingSelection } from "./use-booking-selection";
import { usePanelFlags, usePanelFocus } from "./use-panel-state";

type Params = {
  roomId: string;
  config: BookingRulesConfig;
  now: RulesNow;
  /** Выбранная дата: «Забронировать» ищет слот на неё (D34). */
  date: IsoDate;
  dates: readonly IsoDate[];
  bookings: readonly Booking[] | undefined;
};

type SlotRange = { date: IsoDate; start: HhMm; end: HhMm };

/**
 * Что открыто в панели и как туда попадают из сетки: бронь (T05), черновик двойным нажатием, Enter или
 * «Забронировать» (T06), «Нет времени». Одновременно открыто что-то одно.
 */
export function useCalendarPanel(params: Params) {
  const selection = useBookingSelection({ bookings: params.bookings, dates: params.dates });
  const draft = useBookingDraftStore((state) => state.draft);
  const flags = usePanelFlags(selection.selectedId);
  const focus = usePanelFocus(selection.selectedId);
  const roomDraft = draft?.roomId === params.roomId ? draft : null;
  // «Не найдена» — и после `404`, и когда бронь пропала из свежего списка дня (D14, T12).
  useAnnounceWhen(selection.selection.kind === "notFound", TEXTS.panel.notFound);
  const draftShown = roomDraft !== null && !flags.draftHidden;
  const draftActions = useDraftActions({ ...params, roomDraft, selection, flags, focus });
  const selectionActions = useSelectionActions({ selection, flags, focus });

  return {
    selectedId: selection.selectedId,
    selection: selection.selection,
    openerRef: focus.openerRef,
    draft: roomDraft,
    draftHidden: flags.draftHidden,
    noTime: flags.noTime,
    focusEmpty: flags.focusEmpty,
    /** «Бронь создана» / «Изменения сохранены» над деталями только что сохранённой брони. */
    successText: flags.successText,
    /** Открыто что-то, кроме пустой панели: уже 1200 px панель закрывает сетку. */
    isOpen: selection.selection.kind !== "none" || flags.noTime || draftShown,
    ...draftActions,
    ...selectionActions,
  };
}

type ActionDeps = {
  selection: ReturnType<typeof useBookingSelection>;
  flags: ReturnType<typeof usePanelFlags>;
  focus: ReturnType<typeof usePanelFocus>;
};

type DraftDeps = Params & ActionDeps & { roomDraft: BookingDraft | null };

/** Черновик из сетки: двойное нажатие, Enter, протягивание, «Забронировать» (T06, T07, D34). */
function useDraftActions({ roomDraft, selection, flags, focus, ...params }: DraftDeps) {
  const startDraft = useBookingDraftStore((state) => state.startDraft);
  const openFresh = () => {
    focus.rememberOpener();
    selection.close();
    flags.reset();
  };
  const beginDraft = (slot: SlotRange) => {
    openFresh();
    startDraft({ roomId: params.roomId, ...slot });
  };

  return {
    onActivateSlot: (date: IsoDate, start: HhMm) => {
      beginDraft({ date, start, end: fromMinutes(toMinutes(start) + params.config.slotMinutes) });
    },
    onSelectRange: beginDraft,
    onBook: () => {
      if (roomDraft) {
        flags.setDraftHidden(false);
        return;
      }
      const slot = firstFreeSlot({ ...params, date: params.date, bookings: params.bookings ?? [] });
      if (slot) {
        beginDraft({ date: params.date, ...slot });
        return;
      }
      openFresh();
      flags.setNoTime(true);
      announce(TEXTS.form.noFreeTime);
    },
    onHideDraft: () => {
      flags.setDraftHidden(true);
    },
  };
}

/** Бронь в панели: открыть, сохранена, удалена, пропала, закрыть (T05, T10, T11, D14). */
function useSelectionActions({ selection, flags, focus }: ActionDeps) {
  const clearDraft = useBookingDraftStore((state) => state.clear);
  return {
    onOpenBooking: (booking: Booking) => {
      focus.rememberOpener();
      clearDraft();
      flags.reset();
      selection.open(booking);
    },
    onSaved: (booking: Booking, kind: SavedKind) => {
      flags.reset();
      flags.markSaved(booking.id, kind);
      focus.focusWhenShown(booking.id);
      selection.open(booking);
    },
    /** Бронь удалена: панель пустая; поверх сетки панели нет — фокус на сетке. */
    onDeleted: () => {
      selection.close();
      flags.reset();
      flags.setFocusEmpty(true);
      focus.returnTo(document.getElementById(DOM_IDS.calendarGrid));
    },
    /** Сервер ответил `404` на открытую бронь (правка, удаление). */
    onMissing: selection.markMissing,
    onClose: () => {
      selection.close();
      flags.reset();
    },
  };
}
