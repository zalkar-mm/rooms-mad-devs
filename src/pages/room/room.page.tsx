import { useParams } from "react-router";

import { BookingPanel } from "@/widgets/booking-panel/ui/booking-panel";
import type { CalendarPanelProps } from "@/widgets/room-calendar/model/calendar-panel-props";
import { RoomCalendar } from "@/widgets/room-calendar/ui/room-calendar";

/** `/rooms/:roomId` — календарь комнаты и боковая панель (SPEC §6.2, §6.3). */
export default function RoomPage() {
  const { roomId = "" } = useParams();
  return <RoomCalendar roomId={roomId} renderPanel={renderPanel} />;
}

function renderPanel(props: CalendarPanelProps) {
  return <BookingPanel {...props} />;
}
