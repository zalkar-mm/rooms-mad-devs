import { http, HttpResponse } from "msw";

import { readDb } from "../db/storage";
import { apiUrl } from "../lib/api-url";
import { takeFailNext } from "../lib/fail-next";

export const roomsHandlers = [
  http.get(apiUrl("/rooms"), () => {
    const failure = takeFailNext();
    if (failure) return failure;

    return HttpResponse.json(readDb().rooms);
  }),
];
