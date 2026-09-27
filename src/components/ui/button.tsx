import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-body font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text disabled:opacity-100 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // Section 8 "Primary": ink fill, on-ink text, ink-pressed while held.
        default: "bg-primary text-primary-foreground active:bg-ink-pressed",
        // Section 8 "Secondary": page bg, ink text, 1px line-strong border.
        // This is the app's pre-existing "outline" variant (already used
        // ~25 places for Cancel/secondary choices) retoned to match —
        // kept the name to avoid an unnecessary rename across every call
        // site.
        outline:
          "border-input bg-background text-foreground hover:bg-muted aria-expanded:bg-muted",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        // Section 8 "Destructive": solid red fill, on-ink text — final
        // confirmation of a destructive action (e.g. "Close year").
        destructive:
          "bg-red text-on-ink hover:bg-red/90 focus-visible:border-red/40 focus-visible:ring-red/20",
        // Section 8 "Destructive secondary": entry point to a destructive
        // action (e.g. "End" on an edit form) — page bg, red-text, 1px
        // red border.
        "destructive-secondary":
          "border-red bg-background text-red-text hover:bg-red-bg",
        // Section 8 "Text": no fill or border, ink text — low-emphasis
        // actions like Skip, "+ Add unit".
        text: "bg-transparent text-foreground hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      // Heights floor at 11 (44px) — Design_System_v0.1.md's accessibility
      // floor requires 44×44px minimum tap targets on mobile for every
      // interactive element, not just primary actions, so every size here
      // (including icon-only) meets it rather than only the ones we
      // currently happen to use.
      size: {
        default:
          "h-11 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        xs: "h-11 gap-1 rounded-[min(var(--radius-md),10px)] px-3 text-secondary in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        sm: "h-11 gap-1 rounded-[min(var(--radius-md),12px)] px-3.5 text-secondary in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        lg: "h-12 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        // Section 8 "Full-width bottom action": 52px tall. Not wired into
        // any screen yet (that's a later ticket's screen migration) — the
        // 52px is the doc's own literal spec value, no named token covers
        // a height beyond the 44px control floor.
        full: "h-[52px] w-full gap-1.5 px-4",
        icon: "size-11",
        "icon-xs":
          "size-11 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-11 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
