import { TEXTS } from "../consts/texts";

import { Chip } from "./chip";

export type ChipGroupProps = {
  items: readonly string[];
  onPick: (text: string) => void;
  disabled?: boolean;
};

/** Подсказки названия. Пустой список не рендерится. */
export function ChipGroup({ items, onPick, disabled = false }: ChipGroupProps) {
  if (items.length === 0) return null;

  return (
    <div role="group" aria-label={TEXTS.form.suggestions} className="flex flex-wrap gap-2">
      {items.map((item) => (
        <ChipGroupItem key={item} text={item} onPick={onPick} disabled={disabled} />
      ))}
    </div>
  );
}

type ChipGroupItemProps = {
  text: string;
  onPick: (text: string) => void;
  disabled: boolean;
};

function ChipGroupItem({ text, onPick, disabled }: ChipGroupItemProps) {
  const handleClick = () => {
    onPick(text);
  };

  return (
    <Chip onClick={handleClick} disabled={disabled}>
      {text}
    </Chip>
  );
}
