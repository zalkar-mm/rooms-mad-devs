import type { HhMm } from "./types";

/** `HH:mm` → минуты от полуночи. Сравнение и арифметика времени — только через минуты. */
export function toMinutes(time: HhMm): number {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** Минуты от полуночи → `HH:mm`. */
export function fromMinutes(total: number): HhMm {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/** Ближайшая граница шага не раньше `total`: 14:10 → 14:30 при шаге 30. */
export function ceilToStep(total: number, step: number): number {
  return Math.ceil(total / step) * step;
}
