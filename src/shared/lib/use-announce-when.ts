import { useEffect } from "react";

import { announce, type AnnouncePriority } from "./announce";

/**
 * Объявляет текст, когда статус запроса становится активным: сбой загрузки, «Не найдена» (docs/ui.md §7).
 * Для событий (ответ на отправку, нажатие) — `announce` прямо в обработчике.
 */
export function useAnnounceWhen(active: boolean, text: string, priority: AnnouncePriority = "polite") {
  useEffect(() => {
    if (active) announce(text, priority);
  }, [active, text, priority]);
}
