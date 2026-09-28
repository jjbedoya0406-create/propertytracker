import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CollapsibleSectionCardProps {
  title: string;
  // Shown in place of the body while collapsed — omitted entirely once
  // expanded. Each section computes this from data it already fetches
  // (issue #4).
  hint?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

// Shared shell for every card in the property/unit page's stack
// (Summary, Dashboard, Tenancy, Income, Expenses) — a toggle per card,
// not an accordion, so any combination can be open at once. Only
// Summary starts expanded; that's an *initial* state each page sets up,
// not something this component enforces.
export function CollapsibleSectionCard({
  title,
  hint,
  isExpanded,
  onToggle,
  children,
}: CollapsibleSectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="flex flex-col gap-1">
            {/* Section 6 SectionHeader: title in the "section" role, ink.
                The doc draws optional meta beside the title, not below —
                kept below since that's an existing layout choice (the
                collapsed-state hint), not something this ticket changes. */}
            <span className="text-section text-ink">{title}</span>
            {!isExpanded && hint && (
              <span className="text-caption text-muted-foreground">{hint}</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-ink transition-transform",
              isExpanded && "rotate-180",
            )}
            strokeWidth={1.75}
          />
        </button>
      </CardHeader>
      {isExpanded && <CardContent>{children}</CardContent>}
    </Card>
  );
}
