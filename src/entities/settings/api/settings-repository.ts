import { axiosClient } from "@/shared/api/axios-client";

/** Только HTTP; ответ проверяет схема в хуке (docs/data.md §3, §4). */
export const settingsRepository = {
  get: () => axiosClient.get<unknown>("/settings").then((response) => response.data),
};
