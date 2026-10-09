import { MEDIA } from "@/shared/consts/breakpoints";
import { useMediaQuery } from "@/shared/lib/use-media-query";

import type { SlotDensity } from "../lib/grid-view";

/** Раскладка календаря по экрану: высота слота и место панели (SPEC §11, D36). */
export function useCalendarLayout(panelOpen: boolean) {
  // На сенсорных экранах слот выше: тач-цель и двойное касание вместо протягивания (D36).
  const isTouch = useMediaQuery(MEDIA.coarsePointer);
  const isWide = useMediaQuery(MEDIA.xl);
  const layout = isWide ? "side" : "overlay";

  return {
    density: (isTouch ? "touch" : "default") satisfies SlotDensity,
    layout,
    /** Уже 1200 px открытая панель занимает место сетки целиком (SPEC §11). */
    overlayOpen: layout === "overlay" && panelOpen,
  } as const;
}
