import { TEXTS } from "@/shared/consts/texts";

/** Длительность текстом: «30 мин», «1 ч», «1 ч 30 мин», «2 ч». */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${TEXTS.common.hoursShort}`);
  if (rest > 0 || hours === 0) parts.push(`${rest} ${TEXTS.common.minutesShort}`);
  return parts.join(" ");
}
