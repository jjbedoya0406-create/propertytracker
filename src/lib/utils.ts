import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge doesn't know about the Ink type-scale names added in
// src/index.css's @theme block (text-hero, text-body-strong, ...) — by
// default it lexically groups any "text-<word>" utility with text COLOR
// utilities (text-red-text, text-ink, ...) and silently drops whichever
// comes second, since both look like the same conflict family otherwise.
// Registering the scale names here tells it these are font-size, not
// color, so a size + a color class can coexist (which every one of these
// components' className needs to do).
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "hero",
        "title",
        "value",
        "section",
        "body-strong",
        "body",
        "secondary",
        "label",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
