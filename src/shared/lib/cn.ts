import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge не знает токены кита: без этого `text-small` считается цветом и выпадает рядом с
 * `text-grey-50`, а `rounded-s` (наш радиус) принимается за логический угол и не перекрывает `rounded-full`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["caption", "small", "body", "title"],
      radius: ["s", "m"],
      shadow: ["1", "2"],
      animate: ["shimmer"],
    },
    conflictingClassGroups: {
      "rounded-s": ["rounded"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
