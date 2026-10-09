import type { ReactNode } from "react";

import { RoomCardSkeleton } from "@/entities/room/ui/room-card-skeleton";

import { TEXTS } from "@/shared/consts/texts";
import { assertNever } from "@/shared/lib/assert-never";
import { EmptyState } from "@/shared/ui/empty-state";
import { RetryNotice } from "@/shared/ui/retry-notice";

import type { RoomListState } from "../model/use-rooms-overview";

export type RoomCardListProps = {
  state: RoomListState;
  /** Карточки `RoomCard` в порядке из `GET /api/rooms`. */
  children?: ReactNode;
  onRetry: () => void;
};

const GRID_CN = "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3";
const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];

/** Список комнат с состояниями экрана: загрузка, пусто, ошибка, данные (SPEC §6.1). */
export function RoomCardList({ state, children, onRetry }: RoomCardListProps) {
  switch (state) {
    case "empty":
      return <EmptyState text={TEXTS.rooms.empty} />;
    case "error":
      return <RetryNotice text={TEXTS.rooms.loadFailed} onRetry={onRetry} />;
    case "loading":
      return (
        <div aria-busy="true" className={GRID_CN}>
          {SKELETON_KEYS.map((key) => (
            <RoomCardSkeleton key={key} />
          ))}
        </div>
      );
    case "data":
      return <div className={GRID_CN}>{children}</div>;
    default:
      return assertNever(state);
  }
}
