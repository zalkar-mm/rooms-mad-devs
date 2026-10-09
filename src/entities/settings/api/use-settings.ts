import { useQuery } from "@tanstack/react-query";

import { parseResponse } from "@/shared/api/parse-response";

import { settingsSchema } from "../model/settings.schema";

import { settingsKeys } from "./settings-keys";
import { settingsRepository } from "./settings-repository";

/** Настройки системы (D35). Ответ без любого поля — состояние ошибки экрана (T01 §6). */
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: async () => parseResponse(settingsSchema, await settingsRepository.get()),
    staleTime: 60_000,
  });
}
