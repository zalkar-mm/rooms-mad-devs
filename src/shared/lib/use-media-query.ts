import { useSyncExternalStore } from "react";

/** Совпадение медиазапроса с подпиской на изменения: раскладка панели, плотность сетки. */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", onChange);
    return () => {
      list.removeEventListener("change", onChange);
    };
  };
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
