import { create } from "zustand";

import type { Booking, CreateBookingInput } from "./booking.types";

/**
 * Несохранённые значения формы создания или правки (SPEC §3 «Черновик»). Пишут сетка и форма, читают обе.
 * `editing` — исходная бронь правки (T10): с ней сравниваются значения, её место в сетке занимает черновик.
 */
export type BookingDraft = CreateBookingInput & { editing?: Booking };

type BookingDraftState = {
  draft: BookingDraft | null;
  /**
   * Растёт, когда черновик задаёт сетка (двойное нажатие, «Забронировать»): форма пересоздаётся с новыми
   * значениями. Правка из самой формы `revision` не меняет.
   */
  revision: number;
  /**
   * Сервер ответил `409` на эти дату и время: текст сообщения панели и признак выделения конфликтующих
   * броней в сетке (D13). Сбрасывается сменой даты, начала или окончания, но не названия (T09 §3.8).
   */
  conflictText: string | null;
  /** Новый интервал из сетки; введённое название сохраняется. */
  startDraft: (slot: Omit<BookingDraft, "title" | "editing">) => void;
  /** «Изменить»: черновик со значениями брони (T10). */
  startEdit: (booking: Booking) => void;
  updateDraft: (patch: Partial<Omit<BookingDraft, "roomId" | "editing">>) => void;
  setConflict: (text: string) => void;
  clear: () => void;
};

/** Черновик переживает смену даты и вида и закрытие панели поверх сетки (D33, docs/data.md §8). */
export const useBookingDraftStore = create<BookingDraftState>()((set) => ({
  draft: null,
  revision: 0,
  conflictText: null,
  startDraft: (slot) => {
    set((state) => ({
      // Новый интервал сохраняет введённое название новой брони, но не название правки.
      draft: { ...slot, title: state.draft?.editing ? "" : (state.draft?.title ?? "") },
      revision: state.revision + 1,
      conflictText: null,
    }));
  },
  updateDraft: (patch) => {
    set((state) => {
      if (!state.draft) return state;
      const draft = { ...state.draft, ...patch };
      const slotChanged =
        draft.date !== state.draft.date || draft.start !== state.draft.start || draft.end !== state.draft.end;
      return { draft, conflictText: slotChanged ? null : state.conflictText };
    });
  },
  startEdit: (booking) => {
    const { id: _id, ...values } = booking;
    set((state) => ({ draft: { ...values, editing: booking }, revision: state.revision + 1, conflictText: null }));
  },
  setConflict: (conflictText) => {
    set({ conflictText });
  },
  clear: () => {
    set({ draft: null, conflictText: null });
  },
}));
