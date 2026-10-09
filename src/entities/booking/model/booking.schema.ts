import { z } from "zod";

import { HH_MM_PATTERN, ISO_DATE_PATTERN } from "@/shared/lib/time/types";

import type { Booking } from "./booking.types";

export const bookingSchema = z.object({
  id: z.string().min(1),
  roomId: z.string().min(1),
  date: z.string().regex(ISO_DATE_PATTERN),
  start: z.string().regex(HH_MM_PATTERN),
  end: z.string().regex(HH_MM_PATTERN),
  title: z.string(),
}) satisfies z.ZodType<Booking>;

export const bookingListSchema = z.array(bookingSchema);
