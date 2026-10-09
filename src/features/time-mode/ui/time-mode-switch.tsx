import { TEXTS } from "@/shared/consts/texts";
import { Switch } from "@/shared/ui/switch";

export type TimeModeSwitchProps = {
  /** «Моё время» можно показать на видимых датах (canShowDeviceTime). */
  available: boolean;
  checked: boolean;
  /** «Моё время, UTC+5» — читалка объявляет смещение и состояние (T15 §10). */
  ariaLabel: string;
  onCheckedChange: (checked: boolean) => void;
};

/** Переключатель «Моё время» (D23). Пояса совпадают или время не показать без перехода через полночь — его нет. */
export function TimeModeSwitch({ available, checked, ariaLabel, onCheckedChange }: TimeModeSwitchProps) {
  if (!available) return null;
  return (
    <Switch label={TEXTS.calendar.myTime} ariaLabel={ariaLabel} checked={checked} onCheckedChange={onCheckedChange} />
  );
}
