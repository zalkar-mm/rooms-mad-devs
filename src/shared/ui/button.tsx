import type { ComponentProps, MouseEvent } from "react";

import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router";

import { cn } from "../lib/cn";

import { Spinner } from "./spinner";

const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-m border border-transparent bg-clip-padding px-4",
    "text-small font-semibold whitespace-nowrap transition-colors focus-ring",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-hover",
        secondary: "border-grey-20 bg-white text-grey-100 hover:bg-grey-10 active:bg-grey-10",
        danger: "border-grey-20 bg-white text-danger hover:bg-grey-10 active:bg-grey-10",
        text: "bg-transparent text-accent hover:underline active:underline",
      },
      tone: { default: "", danger: "" },
      size: { auto: "h-11 md:h-10", md: "h-10", lg: "h-11" },
      inactive: { true: "cursor-not-allowed", false: "cursor-pointer" },
      fullWidth: { true: "w-full", false: "" },
    },
    compoundVariants: [
      { variant: "primary", tone: "danger", class: "bg-danger hover:bg-danger hover:underline active:bg-danger" },
      {
        variant: ["primary", "secondary", "danger"],
        inactive: true,
        class: "border-transparent bg-grey-20 text-grey-50 hover:bg-grey-20 hover:no-underline active:bg-grey-20",
      },
      { variant: "text", inactive: true, class: "text-grey-50 hover:no-underline active:no-underline" },
    ],
    // Без размера: `lg` (44) на ширине < 768, `md` (40) от 768.
    defaultVariants: { variant: "primary", tone: "default", size: "auto", inactive: false, fullWidth: false },
  },
);

function ButtonIcon({ icon: Icon }: { icon: LucideIcon | undefined }) {
  if (!Icon) return null;
  return <Icon aria-hidden className="size-4" />;
}

export type ButtonVariant = "primary" | "secondary" | "danger" | "text";

export type ButtonProps = Omit<ComponentProps<"button">, "disabled"> & {
  variant?: ButtonVariant;
  /** Только для `primary`: «Удалить» в подтверждении. */
  tone?: "danger";
  /** Без размера: `lg` (44) на ширине < 768, `md` (40) от 768. */
  size?: "md" | "lg";
  loading?: boolean;
  loadingText?: string;
  /** Через `aria-disabled`: кнопка остаётся в Tab-порядке, нажатие блокируется. */
  disabled?: boolean;
  iconLeft?: LucideIcon;
  fullWidth?: boolean;
  /** Кнопка-ссылка (react-router). Путь собирает родитель из `routes.ts`. */
  href?: string;
  /** Нажатие на кнопку-ссылку: можно отменить переход (`preventDefault`). */
  onLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function Button({
  variant,
  tone,
  size,
  loading = false,
  loadingText,
  disabled = false,
  iconLeft,
  fullWidth,
  href,
  onLinkClick,
  className,
  children,
  onClick,
  type = "button",
  ...props
}: ButtonProps) {
  const rootCn = cn(buttonVariants({ variant, tone, size, inactive: disabled, fullWidth }), className);
  const contentCn = cn("col-start-1 row-start-1 inline-flex items-center gap-2", loading && "invisible");
  const loadingCn = cn(
    "col-start-1 row-start-1 inline-flex items-center justify-center gap-2",
    !loading && "invisible",
  );

  const ariaDisabled = disabled || undefined;
  const ariaBusy = loading || undefined;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  if (href !== undefined) {
    return (
      <Link to={href} data-slot="button" onClick={onLinkClick} className={rootCn}>
        <ButtonIcon icon={iconLeft} />
        {children}
      </Link>
    );
  }

  return (
    <button
      {...props}
      type={type}
      data-slot="button"
      className={rootCn}
      aria-disabled={ariaDisabled}
      aria-busy={ariaBusy}
      onClick={handleClick}
    >
      <span className="grid">
        <span className={contentCn}>
          <ButtonIcon icon={iconLeft} />
          {children}
        </span>
        <span className={loadingCn}>
          <Spinner />
          {loadingText}
        </span>
      </span>
    </button>
  );
}
