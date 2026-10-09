import { useRooms } from "@/entities/room/api/use-rooms";
import { useSettings } from "@/entities/settings/api/use-settings";
import { useNow } from "@/entities/settings/model/use-now";

import { TEXTS } from "@/shared/consts/texts";
import { zoneOffsetOn } from "@/shared/lib/time/time-display";
import { useAnnounceWhen } from "@/shared/lib/use-announce-when";

/** Состояние экрана «Комнаты» (SPEC §6.1): загрузка, пусто, ошибка, данные. */
export type RoomListState = "loading" | "data" | "empty" | "error";

type ListFacts = { failed: boolean; roomCount: number | undefined; hasNow: boolean };

function listState({ failed, roomCount, hasNow }: ListFacts): RoomListState {
  if (failed) return "error";
  if (roomCount === undefined || !hasNow) return "loading";
  return roomCount === 0 ? "empty" : "data";
}

/** Комнаты, настройки и «сейчас» экрана «Комнаты»; сбой загрузки объявляется читалке. */
export function useRoomsOverview() {
  const settings = useSettings();
  const rooms = useRooms();
  const now = useNow();
  const state = listState({
    failed: settings.isError || rooms.isError,
    roomCount: rooms.data?.length,
    hasNow: now !== undefined,
  });
  useAnnounceWhen(state === "error", TEXTS.rooms.loadFailed, "assertive");
  // Карточки во времени комнаты: «Моё время» здесь не действует, поэтому пояс подписан (решение владельца).
  const roomZone = settings.data?.timezone;
  const zoneLabel =
    roomZone && now ? TEXTS.calendar.roomTime(zoneOffsetOn({ zone: roomZone, date: now.date, roomZone })) : "";

  return {
    state,
    rooms: rooms.data ?? [],
    config: settings.data,
    now,
    zoneLabel,
    retry: () => {
      void settings.refetch();
      void rooms.refetch();
    },
  };
}
