import * as React from "react";

import { cn } from "@/lib/utils";

// Section 6/11: 44×44px, card background, radius-control, no border, 20px
// icon in ink. Distinct from Button's icon sizes, which are transparent —
// this is a permanent card-colored surface (e.g. a trailing action on a
// screen header), not a ghost/ink-fill button that happens to be square.
// Pass the icon as a child with strokeWidth={1.75} (section 11).
function IconButton({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      data-slot="icon-button"
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-card text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:bg-disabled-bg disabled:text-disabled-text [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      {...props}
    />
  );
}

export { IconButton };
