import { create } from "zustand";

type MockControlsState = {
  /** Следующий `POST`/`PATCH` ответит `409 CONFLICT`, затем флаг сбрасывается. */
  conflictNext: boolean;
  /** Следующий запрос ответит `503`, затем флаг сбрасывается. */
  failNext: boolean;
  setConflictNext: (value: boolean) => void;
  setFailNext: (value: boolean) => void;
};

/** Служебные переключатели mock API (docs/mocks.md §5). Обработчики читают через `getState()`. */
export const useMockControls = create<MockControlsState>()((set) => ({
  conflictNext: false,
  failNext: false,
  setConflictNext: (conflictNext) => {
    set({ conflictNext });
  },
  setFailNext: (failNext) => {
    set({ failNext });
  },
}));
