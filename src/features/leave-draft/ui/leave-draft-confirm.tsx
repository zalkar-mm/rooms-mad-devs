import { TEXTS } from "@/shared/consts/texts";
import { ActionBar } from "@/shared/ui/action-bar";
import { Button } from "@/shared/ui/button";

export type LeaveDraftConfirmProps = {
  onStay: () => void;
  onLeave: () => void;
};

/** Уход к списку комнат с несохранённым черновиком (D33) — подтверждение в панели, не модалкой. */
export function LeaveDraftConfirm({ onStay, onLeave }: LeaveDraftConfirmProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-grey-100">{TEXTS.panel.leaveDraft}</p>
      <ActionBar className="border-t border-grey-20 pt-4">
        <Button variant="secondary" onClick={onStay}>
          {TEXTS.panel.stay}
        </Button>
        <Button tone="danger" onClick={onLeave}>
          {TEXTS.panel.leave}
        </Button>
      </ActionBar>
    </div>
  );
}
