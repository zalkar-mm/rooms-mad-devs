import { http, HttpResponse } from "msw";

import type { Settings } from "@/entities/settings/model/settings.types";

import { MOCK_SETTINGS } from "../db/settings";
import { apiUrl } from "../lib/api-url";
import { takeFailNext } from "../lib/fail-next";
import { serverNow } from "../lib/server-now";

export const settingsHandlers = [
  http.get(apiUrl("/settings"), () => {
    const failure = takeFailNext();
    if (failure) return failure;

    const settings: Settings = { ...MOCK_SETTINGS, serverNow: serverNow().toISOString() };
    return HttpResponse.json(settings);
  }),
];
