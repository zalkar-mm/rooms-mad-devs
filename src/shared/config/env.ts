import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default("/api"),
  VITE_API_MOCK: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) {
  throw new Error(`Invalid environment variables:\n${z.prettifyError(parsed.error)}`);
}

/** Переменные окружения, проверенные при старте приложения. */
export const env = parsed.data;
