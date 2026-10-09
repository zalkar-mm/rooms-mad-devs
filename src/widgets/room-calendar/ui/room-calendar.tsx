import type { ReactNode } from "react";

import { useRooms } from "@/entities/room/api/use-rooms";
import { useSettings } from "@/entities/settings/api/use-settings";
import { useNow } from "@/entities/settings/model/use-now";

import { TEXTS } from "@/shared/consts/texts";
import { RetryButton } from "@/shared/ui/retry-button";
import { ScreenMessage } from "@/shared/ui/screen-message";
import { Skeleton } from "@/shared/ui/skeleton";

import type { CalendarPanelProps } from "../model/calendar-panel-props";

import { GridSkeleton } from "./grid-skeleton";
import { RoomCalendarView } from "./room-calendar-view";
import { RoomNotFound } from "./room-not-found";

export type RoomCalendarProps = {
  roomId: string;
  /** Боковая панель (виджет `booking-panel`): календарь отдаёт ей выбор брони, «сейчас» и раскладку. */
  renderPanel: (props: CalendarPanelProps) => ReactNode;
};

/** Экран «Календарь комнаты» (SPEC §6.2): сначала настройки и комната, затем сетка. */
export function RoomCalendar({ roomId, renderPanel }: RoomCalendarProps) {
  const settings = useSettings();
  const rooms = useRooms();
  const now = useNow();

  if (settings.isError) {
    return <RetryScreen text={TEXTS.calendar.settingsFailed} onRetry={settings.refetch} />;
  }
  if (rooms.isError) {
    return <RetryScreen text={TEXTS.rooms.loadFailed} onRetry={rooms.refetch} />;
  }
  if (!settings.data || !rooms.data || !now) return <CalendarScreenSkeleton />;

  const room = rooms.data.find((item) => item.id === roomId);
  if (!room) return <RoomNotFound />;

  return <RoomCalendarView room={room} settings={settings.data} now={now} renderPanel={renderPanel} />;
}

function RetryScreen({ text, onRetry }: { text: string; onRetry: () => unknown }) {
  const handleRetry = () => {
    void onRetry();
  };
  const action = <RetryButton onRetry={handleRetry} />;
  return <ScreenMessage text={text} action={action} />;
}

/** До прихода настроек длина дня неизвестна: заготовка рабочего дня по умолчанию (SPEC §4, 09:00–18:00). */
const DEFAULT_SHAPE = { rows: 18, cells: 35 };

/** Первая загрузка настроек и комнат: шапка и сетка-заготовка (D16). */
function CalendarScreenSkeleton() {
  return (
    <div aria-busy="true" className="flex min-h-dvh flex-col bg-grey-10">
      <div className="flex h-14 items-center gap-4 border-b border-grey-20 bg-white px-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-40" />
      </div>
      <GridSkeleton variant="day" shape={DEFAULT_SHAPE} density="default" />
    </div>
  );
}
