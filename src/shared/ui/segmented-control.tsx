import { ToggleGroup } from "radix-ui";

import { cn } from "../lib/cn";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** `aria-label` группы. */
  label: string;
  disabled?: boolean;
  className?: string;
};

const ITEM_CN = cn(
  "inline-flex h-10 min-w-9 flex-1 items-center justify-center gap-1 rounded-s bg-transparent px-2 md:h-8 md:flex-none md:px-3",
  "text-small text-grey-50 whitespace-nowrap transition-[color,box-shadow] hover:text-grey-100 focus:z-10 focus-visible:z-10 focus-ring",
  "data-[state=on]:bg-white data-[state=on]:font-semibold data-[state=on]:text-grey-100 data-[state=on]:shadow-1",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
);

/** Переключатель «День / Неделя / Месяц». Стрелки двигают фокус, Enter и пробел выбирают. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  const rootCn = cn("flex w-fit items-center gap-1 rounded-m bg-grey-10 p-1", className);

  const handleValueChange = (next: string) => {
    // Повторное нажатие на выбранный сегмент приходит пустой строкой: выбор не снимаем.
    const option = options.find((item) => item.value === next);
    if (option) onChange(option.value);
  };

  return (
    <ToggleGroup.Root
      type="single"
      data-slot="toggle-group"
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
      aria-label={label}
      className={rootCn}
    >
      {options.map((option) => (
        <ToggleGroup.Item key={option.value} data-slot="toggle-group-item" value={option.value} className={ITEM_CN}>
          {option.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
