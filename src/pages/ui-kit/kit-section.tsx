import { type ReactNode, useId } from "react";

export type KitSectionProps = {
  title: string;
  children: ReactNode;
};

/** Раздел страницы /ui-kit: один компонент или группа. Подписи — служебные. */
export function KitSection({ title, children }: KitSectionProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 border-t border-grey-20 pt-6">
      <h2 id={titleId} className="text-title text-grey-100">
        {title}
      </h2>
      <div className="flex flex-wrap items-start gap-6">{children}</div>
    </section>
  );
}
