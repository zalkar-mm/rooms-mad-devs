import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";

import { TEXTS } from "@/shared/consts/texts";
import { Gate } from "@/shared/ui/gate";

import { useRoomsOverview } from "../model/use-rooms-overview";

import { RoomCardItem, type RoomCardItemProps } from "./room-card-item";
import { RoomCardList } from "./room-card-list";

/** Экран «Комнаты» (SPEC §6.1): карточки в порядке `GET /api/rooms`, пересчёт раз в минуту по «сейчас». */
export function RoomsOverview() {
  const overview = useRoomsOverview();
  const hasZoneLabel = overview.zoneLabel !== "";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-300 flex-col gap-4 bg-grey-10 p-4 md:p-6">
      <h1 className="sr-only">{TEXTS.rooms.screenTitle}</h1>
      <Gate when={hasZoneLabel}>
        <p className="text-small text-grey-50">{overview.zoneLabel}</p>
      </Gate>
      <RoomCardList state={overview.state} onRetry={overview.retry}>
        {overview.rooms.map((room) => (
          <OptionalCard key={room.id} room={room} config={overview.config} now={overview.now} />
        ))}
      </RoomCardList>
    </main>
  );
}

type OptionalCardProps = Pick<RoomCardItemProps, "room"> & {
  config: BookingRulesConfig | undefined;
  now: RulesNow | undefined;
};

function OptionalCard({ room, config, now }: OptionalCardProps) {
  if (!config || !now) return null;
  return <RoomCardItem room={room} config={config} now={now} />;
}
