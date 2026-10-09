import { useEffect, useRef, useState } from "react";

import type { SavedKind } from "@/features/booking-form/model/booking-form.types";

import { useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";

import { TEXTS } from "@/shared/consts/texts";

const focusedElement = () => (document.activeElement instanceof HTMLElement ? document.activeElement : null);

/**
 * Куда вернуть фокус: бронь или слот, из которых открыли панель (SPEC §12). Созданная бронь получает фокус,
 * как только встанет в сетку и панель покажет её.
 */
export function usePanelFocus(selectedId: string | null) {
  const openerRef = useRef<HTMLElement | null>(null);
  const pendingFocusRef = useRef<string | null>(null);

  useEffect(() => {
    const id = pendingFocusRef.current;
    // Ждём, пока панель покажет эту бронь: адрес (`booking`) обновляется не в том же рендере, и панель
    // при открытии забирает фокус на свой заголовок.
    if (id === null || selectedId !== id) return;
    const block = document.querySelector<HTMLElement>(`[data-booking-id="${CSS.escape(id)}"]`);
    block?.focus();
    // Поверх сетки бронь скрыта панелью: фокус дойдёт до неё, когда панель закроют.
    const isFocused = block !== null && document.activeElement === block;
    if (isFocused) {
      openerRef.current = block;
      pendingFocusRef.current = null;
    }
  });

  return {
    openerRef,
    rememberOpener: () => {
      openerRef.current = focusedElement();
    },
    focusWhenShown: (bookingId: string) => {
      pendingFocusRef.current = bookingId;
    },
    returnTo: (element: HTMLElement | null) => {
      openerRef.current = element;
    },
  };
}

/** Флаги панели: «Нет времени», черновик спрятан, фокус в пустую панель, надпись об успехе. */
export function usePanelFlags(selectedId: string | null) {
  const revision = useBookingDraftStore((state) => state.revision);
  const [noTime, setNoTime] = useState(false);
  const [draftHidden, setDraftHidden] = useState(false);
  const [focusEmpty, setFocusEmpty] = useState(false);
  /** Сохранённая бронь и ревизия черновика на тот момент: новая правка гасит надпись успеха. */
  const [saved, setSaved] = useState<{ id: string; kind: SavedKind; revision: number } | null>(null);
  const isSavedShown = saved !== null && saved.id === selectedId && saved.revision === revision;

  return {
    noTime,
    draftHidden,
    focusEmpty,
    successText: isSavedShown ? TEXTS.panel.savedText[saved.kind] : undefined,
    setNoTime,
    setDraftHidden,
    setFocusEmpty,
    markSaved: (id: string, kind: SavedKind) => {
      setSaved({ id, kind, revision });
    },
    reset: () => {
      setNoTime(false);
      setDraftHidden(false);
      setSaved(null);
      setFocusEmpty(false);
    },
  };
}
