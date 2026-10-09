import type { MouseEvent } from "react";

import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/cn";

const iconButtonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center rounded-m border bg-clip-padding text-grey-100 whitespace-nowrap",
    "transition-colors focus-ring [&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        outline: "border-grey-20 bg-white hover:bg-grey-10 active:bg-grey-10",
        ghost: "border-transparent bg-transparent hover:bg-grey-10 active:bg-grey-10",
      },
      size: { auto: "size-11 md:size-10", md: "size-10", lg: "size-11" },
      inactive: {
        true: "cursor-not-allowed text-grey-40 hover:bg-transparent active:bg-transparent",
        false: "cursor-pointer",
      },
    },
  },
);

export type IconButtonProps = {
  /** Становится `aria-label`: иконка без текста иначе не озвучивается. */
  label: string;
  icon: LucideIcon;
  variant?: "outline" | "ghost";
  /** Без размера: 44 на ширине < 768 (тач-цель), 40 от 768. */
  size?: "md" | "lg";
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

export function IconButton({
  label,
  icon: Icon,
  variant = "outline",
  size,
  disabled = false,
  onClick,
  className,
}: IconButtonProps) {
  const rootCn = cn(iconButtonVariants({ variant, size: size ?? "auto", inactive: disabled }), className);

  const ariaDisabled = disabled || undefined;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type="button"
      data-slot="button"
      aria-label={label}
      aria-disabled={ariaDisabled}
      className={rootCn}
      onClick={handleClick}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}
