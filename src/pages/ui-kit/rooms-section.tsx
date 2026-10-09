import type { RoomListState } from "@/widgets/rooms-list/model/use-rooms-overview";
import { RoomCardList } from "@/widgets/rooms-list/ui/room-card-list";

import { RoomCard } from "@/entities/room/ui/room-card";
import { RoomCardSkeleton } from "@/entities/room/ui/room-card-skeleton";

import { KitCase } from "./kit-case";
import { KitSection } from "./kit-section";
import { ERROR_ROOM, FREE_ROOM, noop, ROOM_CARDS } from "./ui-kit.fixtures";

const LIST_STATES: RoomListState[] = ["loading", "empty", "error", "data"];

export function RoomsSection() {
  return (
    <>
      <KitSection title="RoomCard">
        {ROOM_CARDS.map(({ label, props }) => (
          <KitCase key={props.name} label={label} className="w-72">
            <RoomCard {...props} />
          </KitCase>
        ))}
        <KitCase label="брони не загрузились" className="w-72">
          <RoomCard {...ERROR_ROOM} />
        </KitCase>
        <KitCase label="hover" state="hover" className="w-72">
          <RoomCard {...FREE_ROOM} />
        </KitCase>
        <KitCase label="focus" state="focus" className="w-72">
          <RoomCard {...FREE_ROOM} />
        </KitCase>
        <KitCase label="skeleton" className="w-72">
          <RoomCardSkeleton />
        </KitCase>
      </KitSection>

      <KitSection title="RoomCardList">
        {LIST_STATES.map((state) => (
          <KitCase key={state} label={state} className="w-full">
            <RoomCardList state={state} onRetry={noop}>
              {ROOM_CARDS.map(({ props }) => (
                <RoomCard key={props.name} {...props} />
              ))}
            </RoomCardList>
          </KitCase>
        ))}
      </KitSection>
    </>
  );
}
