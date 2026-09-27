import * as React from "react";
import { cn } from "@/lib/utils";

// Section 6 "Hero card": the one primary figure on a screen. Built for
// Ticket 2's preview page — not wired into any screen yet, since no screen
// currently has this layout (that's a later, Phase 2 ticket).
function HeroCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-card"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-line border-l-4 border-l-mint bg-page p-4",
        className,
      )}
      {...props}
    />
  );
}

function HeroCardLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-card-label"
      className={cn("text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

function HeroCardStats({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="hero-card-stats"
      className={cn("grid grid-cols-2 gap-2", className)}
      {...props}
    />
  );
}

export { HeroCard, HeroCardLabel, HeroCardStats };
