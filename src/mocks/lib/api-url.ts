import { env } from "@/shared/config/env";

/** Путь обработчика от того же базового URL, что у клиента (docs/mocks.md §4). */
export function apiUrl(path: `/${string}`): string {
  return `${env.VITE_API_BASE_URL}${path}`;
}
