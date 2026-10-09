import { Notice } from "./notice";
import { RetryButton } from "./retry-button";

export type RetryNoticeProps = {
  /** «Брони не загрузились…», «Сервер не отвечает…». */
  text: string;
  onRetry: () => void;
  className?: string;
};

/** Сбой с «Повторить» (SPEC §8, §9): над сеткой, в форме, в подтверждении удаления, в списке комнат. */
export function RetryNotice({ text, onRetry, className }: RetryNoticeProps) {
  const retry = <RetryButton onRetry={onRetry} />;

  return (
    <Notice variant="error" action={retry} className={className}>
      {text}
    </Notice>
  );
}
