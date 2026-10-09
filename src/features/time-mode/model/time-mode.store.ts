import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import type { TimeDisplayMode } from "@/shared/lib/time/time-display";

/** Ключ режима в `localStorage` — единственные данные приложения в хранилище браузера (docs/data.md §8). */
const STORAGE_KEY = "rooms-mad-dev:time-mode:v1";

/** Хранилище недоступно (запрет сайта, квота) — режим комнаты, выбор живёт до перезагрузки. */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Режим не запомнится между перезагрузками; показ от этого не меняется.
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // См. setItem.
    }
  },
};

type TimeModeState = {
  mode: TimeDisplayMode;
  setMode: (mode: TimeDisplayMode) => void;
};

/** Режим «Моё время» (T15 §3.9): общий для всех комнат, переживает уход со страницы и перезагрузку. */
export const useTimeModeStore = create<TimeModeState>()(
  persist(
    (set) => ({
      mode: "room",
      setMode: (mode) => {
        set({ mode });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ mode: state.mode }),
    },
  ),
);
