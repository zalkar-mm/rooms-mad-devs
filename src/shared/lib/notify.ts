import { toast } from "sonner";

import { localizeApiError } from "../api/localize-api-error";
import { normalizeApiError } from "../api/normalize-api-error";
import type { TextSettings } from "../consts/texts";

/** Единственная точка вызова тостов (docs/ui.md §7). */
export const notify = {
  success: (text: string) => {
    toast.success(text);
  },
  error: (text: string) => {
    toast.error(text);
  },
  apiError: (error: unknown, settings: TextSettings) => {
    toast.error(localizeApiError(normalizeApiError(error), settings));
  },
};
