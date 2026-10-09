import { useBookings } from "@/entities/booking/api/use-bookings";
import { type RoomNow, type RoomOpens, roomStatus } from "@/entities/booking/lib/room-status";
import type { BookingRulesConfig, RulesNow } from "@/entities/booking/model/booking-rules.types";
import type { Room } from "@/entities/room/model/room.types";
import { RoomCard, type RoomNowTone } from "@/entities/room/ui/room-card";
import { RoomCardSkeleton } from "@/entities/room/ui/room-card-skeleton";

import { ROUTES } from "@/shared/consts/routes";
import { TEXTS } from "@/shared/consts/texts";
import { assertNever } from "@/shared/lib/assert-never";
import { formatInterval } from "@/shared/lib/time/format";
import type { HhMm } from "@/shared/lib/time/types";

export type RoomCardItemProps = {
  room: Room;
  config: BookingRulesConfig;
  now: RulesNow;
};

const NOW_TONE: Record<RoomNow["kind"], RoomNowTone> = {
  busy: "busy",
  freeUntil: "free",
  freeAllDay: "free",
  offHours: "off",
};

function nowText(now: RoomNow): string {
  switch (now.kind) {
    case "busy":
      return TEXTS.rooms.busyUntil(now.until, now.title);
    case "freeUntil":
      return TEXTS.rooms.freeUntil(now.until);
    case "freeAllDay":
      return TEXTS.rooms.freeUntilEndOfDay;
    case "offHours":
      return TEXTS.rooms.offHours;
    default:
      return assertNever(now);
  }
}

function opensText(opens: RoomOpens | undefined, workdayStart: HhMm): string | undefined {
  if (!opens) return undefined;
  if (opens.day === "tomorrow") return TEXTS.rooms.opensTomorrow(workdayStart);
  return TEXTS.rooms.opensOn(TEXTS.rooms.weekdayAccusative[opens.weekday], workdayStart);
}

/** Карточка комнаты со своими бронями на сегодня: сбой одной карточки не трогает остальные (T13 §5). */
export function RoomCardItem({ room, config, now }: RoomCardItemProps) {
  const bookings = useBookings({ roomId: room.id, date: now.date });
  const href = ROUTES.ROOM(room.id);

  if (!bookings.data && bookings.isPending) return <RoomCardSkeleton />;

  const status = roomStatus(bookings.data ?? [], config, now);
  const nextHour = status.nextHour.map((booking) =>
    TEXTS.rooms.nextHourItem(formatInterval(booking.start, booking.end), booking.title),
  );
  const nextHourLabel = nextHour.length > 0 ? TEXTS.rooms.nextHour : TEXTS.rooms.nextHourFree;
  const nowLine = { tone: NOW_TONE[status.now.kind], text: nowText(status.now) };
  const opens = opensText(status.opens, config.workdayStart);
  const handleRetry = () => {
    void bookings.refetch();
  };
  // Строки статуса — только по пришедшим броням; без них вместо строк — сообщение и «Повторить».
  const error = bookings.data ? undefined : { text: TEXTS.rooms.bookingsFailed, onRetry: handleRetry };

  return (
    <RoomCard
      name={room.name}
      href={href}
      now={nowLine}
      nextHourLabel={nextHourLabel}
      nextHour={nextHour}
      opensText={opens}
      error={error}
    />
  );
}
