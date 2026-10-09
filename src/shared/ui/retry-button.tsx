import { RotateCw } from "lucide-react";

import { TEXTS } from "../consts/texts";

import { Button } from "./button";

export type RetryButtonProps = {
  onRetry: () => void;
};

/** «Повторить» — одна кнопка для всех сбоев: в сообщении, на весь экран, в карточке комнаты. */
export function RetryButton({ onRetry }: RetryButtonProps) {
  return (
    <Button variant="secondary" iconLeft={RotateCw} onClick={onRetry}>
      {TEXTS.common.retry}
    </Button>
  );
}
