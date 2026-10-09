import { Trash2 } from "lucide-react";

import { TEXTS } from "@/shared/consts/texts";
import { ActionBar } from "@/shared/ui/action-bar";
import { Button } from "@/shared/ui/button";

export type DeleteConfirmProps = {
  /** «Удалить бронь «Созвон» 7 октября, 10:00–11:00?». */
  text: string;
  onKeep: () => void;
  onDelete: () => void;
  deleting?: boolean;
};

/** Подтверждение удаления в боковой панели, не модальным окном (D11, D12). */
export function DeleteConfirm({ text, onKeep, onDelete, deleting = false }: DeleteConfirmProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-grey-100">{text}</p>
      <ActionBar className="border-t border-grey-20 pt-4">
        <Button variant="secondary" onClick={onKeep} disabled={deleting}>
          {TEXTS.panel.keep}
        </Button>
        <Button
          tone="danger"
          iconLeft={Trash2}
          loading={deleting}
          loadingText={TEXTS.panel.deleting}
          onClick={onDelete}
        >
          {TEXTS.panel.delete}
        </Button>
      </ActionBar>
    </div>
  );
}
