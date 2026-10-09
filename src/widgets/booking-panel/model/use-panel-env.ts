import { useSettings } from "@/entities/settings/api/use-settings";
import { useNow } from "@/entities/settings/model/use-now";

import type { PanelEnv } from "./panel-env";

/** Настройки и «сейчас» берёт сама панель, а не получает через календарь; до загрузки — `null`. */
export function usePanelEnv(): PanelEnv | null {
  const settings = useSettings().data;
  const now = useNow();
  if (!settings || !now) return null;
  return { config: settings, now, titleSuggestions: settings.titleSuggestions };
}
