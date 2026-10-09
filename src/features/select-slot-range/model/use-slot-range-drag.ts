import { type PointerEvent, useEffect, useEffectEvent, useState } from "react";

import { type DragRange, dragRange } from "@/entities/booking/lib/drag-range";
import type { Booking } from "@/entities/booking/model/booking.types";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import type { HhMm, IsoDate } from "@/shared/lib/time/types";

/** Сдвиг указателя, после которого нажатие становится протягиванием: без него нажатие ничего не делает (D12). */
const DRAG_THRESHOLD_PX = 4;

type DragState = {
  date: IsoDate;
  anchor: HhMm;
  pointer: HhMm;
  moved: boolean;
  x: number;
  y: number;
};

type Params = {
  config: BookingRulesConfig;
  now: RulesNow;
  bookings: readonly Booking[];
  /** Отпускание: черновик с выделенным интервалом (T07 §3.9). */
  onSelect: (range: { date: IsoDate; start: HhMm; end: HhMm }) => void;
};

/** Сдвиг указателя с места нажатия: дальше порога — нажатие стало протягиванием. */
const movedFrom = (current: DragState, event: globalThis.PointerEvent) =>
  Math.hypot(event.clientX - current.x, event.clientY - current.y) > DRAG_THRESHOLD_PX;

type ListenersParams = {
  active: boolean;
  setDrag: (update: (current: DragState | null) => DragState | null) => void;
  onFinish: () => void;
  onCancel: () => void;
};

/** Подписки на документ на время протягивания: движение, отпускание, Esc. */
function useDragListeners({ active, setDrag, onFinish, onCancel }: ListenersParams) {
  const finish = useEffectEvent(onFinish);
  const cancel = useEffectEvent(onCancel);

  useEffect(() => {
    if (!active) return;
    const handleUp = () => {
      finish();
    };
    // Обновления функциональные: наведение на слот и pointermove приходят в одном такте.
    const handleMove = (event: globalThis.PointerEvent) => {
      setDrag((current) =>
        current && !current.moved && movedFrom(current, event) ? { ...current, moved: true } : current,
      );
    };
    // Перехват: Esc отменяет протягивание раньше, чем панель успеет закрыться по Esc (T07 §4.3а).
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      cancel();
    };
    document.addEventListener("pointerup", handleUp);
    document.addEventListener("pointercancel", handleUp);
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleUp);
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("keydown", handleKey, true);
    };
  }, [active, setDrag]);
}

/**
 * Протягивание мышью по доступным слотам (T07). Только мышь: на сенсорных экранах протягивания нет, там
 * двойное касание (D36). Esc отменяет протягивание, не закрывая панель.
 */
export function useSlotRangeDrag({ config, now, bookings, onSelect }: Params) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const range: DragRange | null = drag
    ? dragRange({ date: drag.date, anchor: drag.anchor, pointer: drag.pointer, config, now, bookings })
    : null;
  const selected = drag?.moved && range ? { date: drag.date, ...range } : null;

  useDragListeners({
    active: drag !== null,
    setDrag,
    onFinish: () => {
      if (selected) onSelect({ date: selected.date, start: selected.start, end: selected.end });
      setDrag(null);
    },
    onCancel: () => {
      setDrag(null);
    },
  });

  return {
    /** Интервал для черновика в сетке, пока идёт протягивание. */
    preview: selected,
    /** Нажатие на доступный слот. */
    onSlotPointerDown: (date: IsoDate, start: HhMm, event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      // Без выделения текста при протягивании; двойное нажатие от этого не страдает.
      event.preventDefault();
      setDrag({ date, anchor: start, pointer: start, moved: false, x: event.clientX, y: event.clientY });
    },
    /** Указатель над слотом любого дня: берётся только время (T07 §4.2г). */
    onSlotPointerEnter: (start: HhMm) => {
      setDrag((current) => current && { ...current, pointer: start, moved: current.moved || start !== current.anchor });
    },
  };
}
