import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge the custom type and space scales in globals.css,
// so conflicts like `p-m p-l` or `text-step-0 text-muted` resolve correctly.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["step--3", "step--2", "step--1", "step-0", "step-1", "step-2", "step-3", "step-4", "step-5", "brand"],
      spacing: [
        "3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl",
        "3xs-2xs", "2xs-xs", "xs-s", "s-m", "m-l", "l-xl", "xl-2xl", "2xl-3xl", "s-l",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
