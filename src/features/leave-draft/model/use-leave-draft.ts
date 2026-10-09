import { type MouseEvent, useState } from "react";

import { useNavigate } from "react-router";

import { useBookingDraftStore } from "@/entities/booking/model/booking-draft.store";

import { ROUTES } from "@/shared/consts/routes";

/**
 * Уход к списку комнат с несохранённым черновиком этой комнаты требует подтверждения в панели (D33, D12).
 * Без черновика ссылка «Все комнаты» работает как обычно.
 */
export function useLeaveDraft(roomId: string) {
  const hasDraft = useBookingDraftStore((state) => state.draft?.roomId === roomId);
  const clearDraft = useBookingDraftStore((state) => state.clear);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  return {
    confirming: confirming && hasDraft,
    /** Нажатие на «Все комнаты»: с черновиком — вопрос вместо перехода. */
    requestLeave: (event: MouseEvent<HTMLAnchorElement>) => {
      if (!hasDraft) return;
      event.preventDefault();
      setConfirming(true);
    },
    stay: () => {
      setConfirming(false);
    },
    leave: () => {
      clearDraft();
      setConfirming(false);
      void navigate(ROUTES.ROOMS);
    },
  };
}
