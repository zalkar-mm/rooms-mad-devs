import { useState } from "react";

import { useQueryState } from "nuqs";

import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingSelection } from "@/entities/booking/model/booking-selection.types";

import type { IsoDate } from "@/shared/lib/time/types";

import { calendarSearchParams } from "./calendar-search-params";

type Params = {
  /** Брони текущего периода; `undefined` — список ещё не пришёл или это данные другого периода. */
  bookings: readonly Booking[] | undefined;
  dates: readonly IsoDate[];
};

/**
 * Открытая бронь: `id` в адресе, данные — из загруженного списка (T05 §3.13). Пропала из свежего списка
 * своего дня — «Не найдена» (D14). Ушли на период без этого дня — панель показывает последнюю
 * известную версию брони (T05, открытый вопрос 2).
 */
export function useBookingSelection({ bookings, dates }: Params) {
  const [selectedId, setSelectedId] = useQueryState("booking", calendarSearchParams.booking);
  const [snapshot, setSnapshot] = useState<Booking | null>(null);
  /** Сервер ответил `404` на эту бронь: «Не найдена», где бы ни был её день (D14). */
  const [missingId, setMissingId] = useState<string | null>(null);

  const fresh = bookings?.find((booking) => booking.id === selectedId);
  const known = fresh ?? (snapshot?.id === selectedId ? snapshot : undefined);

  const selection = resolveSelection({
    selectedId,
    missingId,
    fresh,
    known,
    knownDayVisible: known !== undefined && dates.includes(known.date),
    listLoaded: bookings !== undefined,
  });

  const open = (booking: Booking) => {
    setMissingId(null);
    setSnapshot(booking);
    void setSelectedId(booking.id);
  };

  const close = () => {
    setMissingId(null);
    setSnapshot(null);
    void setSelectedId(null);
  };

  return {
    selectedId: fresh?.id ?? null,
    selection,
    open,
    close,
    markMissing: () => {
      setMissingId(selectedId);
    },
  };
}

type SelectionFacts = {
  selectedId: string | null;
  /** Сервер ответил `404` на бронь с этим `id`. */
  missingId: string | null;
  /** Бронь из свежего списка периода. */
  fresh: Booking | undefined;
  /** Свежая или последняя известная версия брони. */
  known: Booking | undefined;
  knownDayVisible: boolean;
  listLoaded: boolean;
};

function resolveSelection({
  selectedId,
  missingId,
  fresh,
  known,
  knownDayVisible,
  listLoaded,
}: SelectionFacts): BookingSelection {
  if (selectedId === null) return { kind: "none" };
  if (selectedId === missingId) return { kind: "notFound", title: known?.title };
  if (fresh) return { kind: "booking", booking: fresh };
  if (known && !knownDayVisible) return { kind: "booking", booking: known };
  // Список своего дня пришёл, а брони в нём нет; без снимка (адрес с чужим id) — тоже «Не найдена».
  if (listLoaded) return { kind: "notFound", title: known?.title };
  if (known) return { kind: "booking", booking: known };
  return { kind: "none" };
}
