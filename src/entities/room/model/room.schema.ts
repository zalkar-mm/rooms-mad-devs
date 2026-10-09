import { z } from "zod";

import type { Room } from "./room.types";

export const roomsSchema = z.array(z.object({ id: z.string().min(1), name: z.string() })) satisfies z.ZodType<Room[]>;
