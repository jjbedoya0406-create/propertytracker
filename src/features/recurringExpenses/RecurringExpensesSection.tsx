import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CollapsibleSectionCard } from "@/components/CollapsibleSectionCard";
import { formatCurrency } from "@/lib/currency";
import { formatShortDate } from "@/lib/recurringExpenseDates";
import { useTranslation } from "../../i18n/useTranslation";
import { useSettings } from "../../portfolio/context";
import type { RecurringExpense } from "../../types";

interface RecurringExpensesSectionProps {
  buildingId: string;
  items: RecurringExpense[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

// Always visible on a building screen (issue #24, FR2) — unlike every
// other section here, this never disappears even with zero items, since
// the empty state itself is the entry point for setting the first one up.
export function RecurringExpensesSection({
  buildingId,
  items,
  isExpanded,
  onToggleExpanded,
}: RecurringExpensesSectionProps) {
  const { t } = useTranslation();
  const { currency, language } = useSettings();

  // Ended items never appear (FR2/AC11) — the section only ever shows
  // active/paused ones, which is also what the header count reflects.
  const visibleItems = items.filter((item) => item.status !== "ended");

  return (
    <CollapsibleSectionCard
      title={
        visibleItems.length > 0
          ? `${t("recurringExpense.sectionTitle")} (${visibleItems.length})`
          : t("recurringExpense.sectionTitle")
      }
      isExpanded={isExpanded}
      onToggle={onToggleExpanded}
    >
      <div className="flex flex-col gap-4">
        {visibleItems.length === 0 ? (
          <p className="text-muted-foreground">
            {t("recurringExpense.emptyStateBody")}
          </p>
        ) : (
          <div className="divide-y divide-border rounded-lg border">
            {visibleItems.map((item) => (
              <Link
                key={item.recurringExpenseId}
                to={`/buildings/${buildingId}/recurring/${item.recurringExpenseId}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(item.amount, currency)} ·{" "}
                    {t(`recurringExpense.${item.frequency}`)}
                    {item.status === "active" &&
                      ` · ${t("recurringExpense.nextDateLabel", { date: formatShortDate(item.nextDueDate, language) })}`}
                  </span>
                </div>
                {item.status === "paused" && (
                  <Badge variant="secondary">
                    {t("recurringExpense.pausedTag")}
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        )}
        <Link
          to={`/buildings/${buildingId}/recurring/new`}
          className="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary"
        >
          <Plus className="size-4" />
          {t("recurringExpense.addButton")}
        </Link>
      </div>
    </CollapsibleSectionCard>
  );
}
