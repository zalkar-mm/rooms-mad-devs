import axios from "axios";

import { env } from "../config/env";

import { normalizeApiError } from "./normalize-api-error";

/** Единственный HTTP-клиент приложения (docs/data.md §1). */
export const axiosClient = axios.create({ baseURL: env.VITE_API_BASE_URL });

axiosClient.interceptors.response.use(undefined, (error: unknown) => Promise.reject(normalizeApiError(error)));
