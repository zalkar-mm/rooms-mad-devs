import type { ReactNode } from "react";

export type SkipLinkProps = {
  /** Id цели из `shared/consts/dom-ids.ts`; у цели `tabIndex={-1}`. */
  targetId: string;
  children: ReactNode;
};

/** Первый элемент в Tab-порядке. Скрыт, пока не получит фокус. */
export function SkipLink({ targetId, children }: SkipLinkProps) {
  const href = `#${targetId}`;

  return (
    <a
      href={href}
      className="sr-only text-small font-semibold text-accent focus-ring focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50 focus-visible:flex focus-visible:min-h-11 focus-visible:items-center focus-visible:rounded-m focus-visible:bg-white focus-visible:p-3 focus-visible:shadow-1"
    >
      {children}
    </a>
  );
}
