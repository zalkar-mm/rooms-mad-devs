import { Skeleton } from "@/shared/ui/skeleton";

/** Заготовка карточки той же высоты, что карточка с двумя строками статуса. */
export function RoomCardSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2 rounded-m border border-grey-20 bg-white p-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4.5 w-40" />
      <Skeleton className="h-4.5 w-48" />
    </div>
  );
}
