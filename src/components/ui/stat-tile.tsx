import * as React from "react";
import { cn } from "@/lib/utils";

// Section 6 "Stat tile": inside a hero card, label above value. Built for
// Ticket 2's preview page — not wired into any screen yet (see HeroCard).
function StatTile({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-tile"
      className={cn(
        "flex flex-col gap-1 rounded-lg bg-card p-3",
        className,
      )}
      {...props}
    />
  );
}

function StatTileLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-tile-label"
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

export { StatTile, StatTileLabel };
