import { TEXTS } from "@/shared/consts/texts";
import { EmptyState } from "@/shared/ui/empty-state";

/** Панель по умолчанию и после закрытия. */
export function PanelEmpty() {
  return <EmptyState text={TEXTS.panel.empty} />;
}
