import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { CollapsibleSectionCard } from "@/components/CollapsibleSectionCard";
import { formatCurrency } from "@/lib/currency";
import { formatPeriodLabel, periodToPrefix, type Period } from "@/lib/period";
import { useTranslation } from "../../i18n/useTranslation";
import { useSettings } from "../../portfolio/context";
import { useCategories } from "../categories/hooks";
import { useScopedExpenses, type FinancialScope } from "../properties/financialScope";
import { computeCategoryBreakdown } from "./categoryBreakdown";
import { CATEGORY_CHART_COLORS, DonutChart } from "./DonutChart";

interface DashboardSectionProps {
  scope: FinancialScope;
  period: Period;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function DashboardSection({
  scope,
  period,
  isExpanded,
  onToggleExpanded,
}: DashboardSectionProps) {
  const { t } = useTranslation();
  const { currency, language } = useSettings();
  const { data: expenses } = useScopedExpenses(scope);
  const { data: categories } = useCategories();

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | "other" | null
  >(null);

  const prefix = periodToPrefix(period);
  const periodLabel = formatPeriodLabel(period, language);

  const monthExpenses = useMemo(
    () => (expenses ?? []).filter((e) => e.date.startsWith(prefix)),
    [expenses, prefix],
  );

  const breakdown = useMemo(
    () => computeCategoryBreakdown(expenses ?? [], prefix),
    [expenses, prefix],
  );

  const categoryNameById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.categoryId, c.name])),
    [categories],
  );
  const topCategoryIds = useMemo(
    () =>
      new Set(
        breakdown
          .filter((entry) => entry.categoryId !== null)
          .map((entry) => entry.categoryId as string),
      ),
    [breakdown],
  );

  function categoryName(categoryId: string | null): string {
    if (categoryId === null) return t("dashboard.otherCategory");
    return categoryNameById.get(categoryId) ?? t("expenses.unknownCategory");
  }

  const hint =
    breakdown.length === 0
      ? t("dashboard.emptyHint", { period: periodLabel })
      : t("dashboard.topCategoryHint", {
          period: periodLabel,
          name: categoryName(breakdown[0].categoryId),
          percent: String(breakdown[0].percent),
        });

  const drillDownTransactions =
    selectedCategoryId === null
      ? []
      : selectedCategoryId === "other"
        ? monthExpenses.filter((e) => !topCategoryIds.has(e.categoryId))
        : monthExpenses.filter((e) => e.categoryId === selectedCategoryId);

  return (
    <CollapsibleSectionCard
      title={t("dashboard.title")}
      hint={hint}
      isExpanded={isExpanded}
      onToggle={onToggleExpanded}
    >
      {selectedCategoryId !== null ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {t("dashboard.backToDashboard")}
          </button>
          <h3 className="font-medium">
            {categoryName(
              selectedCategoryId === "other" ? null : selectedCategoryId,
            )}
          </h3>
          {drillDownTransactions.length === 0 ? (
            <p className="text-muted-foreground">
              {t("dashboard.emptyHint", { period: periodLabel })}
            </p>
          ) : (
            <div className="divide-y divide-border rounded-lg border">
              {drillDownTransactions.map((expense) => (
                <div
                  key={expense.expenseId}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      {expense.date}
                    </span>
                    {expense.notes && (
                      <span className="text-sm text-muted-foreground">
                        {expense.notes}
                      </span>
                    )}
                  </div>
                  <span className="tabular-nums font-medium">
                    {formatCurrency(expense.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {breakdown.length === 0 ? (
            <p className="text-muted-foreground">
              {t("dashboard.emptyHint", { period: periodLabel })}
            </p>
          ) : (
            <>
              <div className="flex justify-center">
                <DonutChart slices={breakdown} />
              </div>
              <div className="divide-y divide-border rounded-lg border">
                {breakdown.map((entry, index) => (
                  <button
                    key={entry.categoryId ?? "other"}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryId(entry.categoryId ?? "other")
                    }
                    className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_CHART_COLORS[
                              index % CATEGORY_CHART_COLORS.length
                            ],
                        }}
                      />
                      <span className="font-medium">
                        {categoryName(entry.categoryId)}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="text-sm text-muted-foreground">
                        {entry.percent}%
                      </span>
                      <span className="font-medium">
                        {formatCurrency(entry.amount, currency)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </CollapsibleSectionCard>
  );
}
