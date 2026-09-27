import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Section 6 "List row": min-height 56px, title (body-strong, ink) with an
// optional supporting line (secondary, muted) on the left, and one of a
// FinancialValue/Button/chevron on the right. Not wired into any existing
// screen yet (issue #27) — none of today's list rows (Expenses, Income,
// Units) navigate on tap the way this component's "whole row tappable"
// mode assumes, so there's no existing equivalent to point it at.
interface ListRowProps {
  title: string;
  supportingLine?: string;
  right?: React.ReactNode;
  // When provided, the whole row is a tappable control with a 44px
  // minimum height and the global focus style, and a trailing chevron
  // replaces whatever was passed as `right`.
  onOpen?: () => void;
  className?: string;
}

export function ListRow({
  title,
  supportingLine,
  right,
  onOpen,
  className,
}: ListRowProps) {
  const content = (
    <>
      <span className="flex flex-col gap-0.5">
        <span className="text-body-strong text-ink">{title}</span>
        {supportingLine && (
          <span className="text-caption text-muted-foreground">
            {supportingLine}
          </span>
        )}
      </span>
      {onOpen ? (
        <ChevronRight className="size-5 shrink-0 text-ink" strokeWidth={1.75} />
      ) : (
        right
      )}
    </>
  );

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex min-h-14 w-full items-center justify-between gap-3 py-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-14 items-center justify-between gap-3 py-2",
        className,
      )}
    >
      {content}
    </div>
  );
}
