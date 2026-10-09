import { ROUTES } from "@/shared/consts/routes";
import { TEXTS } from "@/shared/consts/texts";
import { Button } from "@/shared/ui/button";
import { ScreenMessage } from "@/shared/ui/screen-message";

/** `404 ROOM_NOT_FOUND` и неизвестный `id` в адресе (SPEC §9). */
export function RoomNotFound() {
  const action = (
    <Button variant="secondary" href={ROUTES.ROOMS}>
      {TEXTS.common.allRooms}
    </Button>
  );
  return <ScreenMessage text={TEXTS.errors.ROOM_NOT_FOUND} action={action} />;
}
