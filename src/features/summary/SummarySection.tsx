import { useMemo } from "react";
import { CollapsibleSectionCard } from "@/components/CollapsibleSectionCard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { formatPeriodLabel, periodToPrefix, type Period } from "@/lib/period";
import { useTranslation } from "../../i18n/useTranslation";
import { useSettings } from "../../portfolio/context";
import {
  useScopedExpenses,
  useScopedIncome,
  type FinancialScope,
} from "../properties/financialScope";

interface SummarySectionProps {
  scope: FinancialScope;
  period: Period;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function SummarySection({
  scope,
  period,
  isExpanded,
  onToggleExpanded,
}: SummarySectionProps) {
  const { t } = useTranslation();
  const { currency, language } = useSettings();
  const { data: income } = useScopedIncome(scope);
  const { data: expenses } = useScopedExpenses(scope);

  const prefix = periodToPrefix(period);

  const periodExpenses = useMemo(
    () => (expenses ?? []).filter((entry) => entry.date.startsWith(prefix)),
    [expenses, prefix],
  );

  const totalIncome = useMemo(
    () =>
      (income ?? [])
        .filter((entry) => entry.date.startsWith(prefix))
        .reduce((sum, entry) => sum + entry.amount, 0),
    [income, prefix],
  );
  const totalExpenses = useMemo(
    () => periodExpenses.reduce((sum, entry) => sum + entry.amount, 0),
    [periodExpenses],
  );
  const net = totalIncome - totalExpenses;

  // Building-level vs unit-level split (FR6) — a building expense has
  // buildingId set, a unit expense has propertyId set (types/expense.ts).
  // Only meaningful for a genuine multi-unit building's own overview.
  const showBreakdown = scope.kind === "building";
  const buildingExpenses = showBreakdown
    ? periodExpenses
        .filter((entry) => entry.buildingId)
        .reduce((sum, entry) => sum + entry.amount, 0)
    : 0;
  const unitExpenses = showBreakdown
    ? periodExpenses
        .filter((entry) => entry.propertyId)
        .reduce((sum, entry) => sum + entry.amount, 0)
    : 0;

  const periodLabel = formatPeriodLabel(period, language);
  const hint = `${periodLabel}: ${t("summary.income")} ${formatCurrency(totalIncome, currency)} · ${t("summary.expenses")} ${formatCurrency(totalExpenses, currency)}`;

  return (
    <CollapsibleSectionCard
      title={t("summary.title")}
      hint={hint}
      isExpanded={isExpanded}
      onToggle={onToggleExpanded}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span>{t("summary.income")}</span>
            <span className="tabular-nums">
              {formatCurrency(totalIncome, currency)}
            </span>
          </div>
          <div className="border-t border-border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span>{t("summary.expenses")}</span>
              <span className="tabular-nums text-destructive">
                -{formatCurrency(totalExpenses, currency)}
              </span>
            </div>
            {showBreakdown && (
              <div className="mt-1.5 flex flex-col gap-1 pl-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between gap-2">
                  <span>{t("summary.buildingExpenses")}</span>
                  <span className="tabular-nums">
                    {formatCurrency(buildingExpenses, currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span>{t("summary.unitExpenses")}</span>
                  <span className="tabular-nums">
                    {formatCurrency(unitExpenses, currency)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3 font-medium">
            <span>{t("summary.net")}</span>
            <span
              className={cn(
                "tabular-nums",
                net < 0 ? "text-destructive" : undefined,
              )}
            >
              {net < 0 ? "-" : ""}
              {formatCurrency(Math.abs(net), currency)}
            </span>
          </div>
        </div>
      </div>
    </CollapsibleSectionCard>
  );
}
