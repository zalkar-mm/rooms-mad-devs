import { useQuery } from "@tanstack/react-query";

import { parseResponse } from "@/shared/api/parse-response";

import { roomsSchema } from "../model/room.schema";

import { roomKeys } from "./room-keys";
import { roomRepository } from "./room-repository";

/** Комнаты в порядке показа (SPEC §6.1). */
export function useRooms() {
  return useQuery({
    queryKey: roomKeys.list(),
    queryFn: async () => parseResponse(roomsSchema, await roomRepository.list()),
    staleTime: 60_000,
    // Возврат на вкладку перезапрашивает комнаты даже до истечения staleTime (D19).
    refetchOnWindowFocus: "always",
  });
}
