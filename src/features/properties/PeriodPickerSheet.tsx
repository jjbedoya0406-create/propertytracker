import { useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  earliestYearWithData,
  formatPeriodLabel,
  isFutureMonth,
  MONTH_ABBREVIATIONS,
} from "../../lib/period";
import { useTranslation } from "../../i18n/useTranslation";
import { useSettings } from "../../portfolio/context";
import { usePeriod } from "../../portfolio/PeriodContext";
import { useScopedExpenses, useScopedIncome, type FinancialScope } from "./financialScope";

interface PeriodPickerSheetProps {
  scope: FinancialScope;
}

// The chip (page header) + bottom sheet (issue #22) together — reused on
// every property/building screen. Uses the existing Sheet component
// (Radix Dialog under the hood, same one the "More" nav sheet uses),
// which already closes on backdrop tap/Escape; true swipe-to-dismiss was
// deliberately cut (see the issue #22 plan) as real added complexity for
// a dismiss affordance the backdrop already provides.
export function PeriodPickerSheet({ scope }: PeriodPickerSheetProps) {
  const { t } = useTranslation();
  const { language } = useSettings();
  const { period, setPeriod } = usePeriod();
  const { data: income } = useScopedIncome(scope);
  const { data: expenses } = useScopedExpenses(scope);
  const [isOpen, setIsOpen] = useState(false);
  const [viewingYear, setViewingYear] = useState(period.year);

  const currentYear = new Date().getFullYear();
  const earliestYear = earliestYearWithData(
    [...(income ?? []), ...(expenses ?? [])],
    currentYear,
  );

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      setViewingYear(period.year);
    }
  }

  function selectMonth(month: number) {
    setPeriod({ kind: "month", year: viewingYear, month });
    setIsOpen(false);
  }

  function selectYear() {
    setPeriod({ kind: "year", year: viewingYear });
    setIsOpen(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("period.pickerLabel")}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium"
        >
          <Calendar className="size-4" />
          {formatPeriodLabel(period, language)}
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{t("period.sheetTitle")}</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("period.previousYear")}
              disabled={viewingYear <= earliestYear}
              onClick={() => setViewingYear((y) => y - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-lg font-medium">{viewingYear}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("period.nextYear")}
              disabled={viewingYear >= currentYear}
              onClick={() => setViewingYear((y) => y + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={selectYear}>
            {t("period.allOfYear", { year: String(viewingYear) })}
          </Button>

          <div className="grid grid-cols-4 gap-2">
            {MONTH_ABBREVIATIONS[language].map((label, index) => {
              const month = index + 1;
              const disabled = isFutureMonth(viewingYear, month);
              const isSelected =
                period.kind === "month" &&
                period.year === viewingYear &&
                period.month === month;
              return (
                <button
                  key={month}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectMonth(month)}
                  className={cn(
                    "min-h-11 rounded-lg border px-2 py-2 text-center text-sm font-medium",
                    disabled &&
                      "cursor-not-allowed border-border bg-background text-muted-foreground opacity-50",
                    !disabled &&
                      (isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"),
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
