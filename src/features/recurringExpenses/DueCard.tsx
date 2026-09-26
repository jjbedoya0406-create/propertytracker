import { useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toast } from "@/components/Toast";
import { formatCurrency } from "@/lib/currency";
import {
  advancePeriod,
  formatShortDate,
  localToday,
} from "@/lib/recurringExpenseDates";
import { useTranslation } from "../../i18n/useTranslation";
import { useSettings } from "../../portfolio/context";
import type { Building, RecurringExpense } from "../../types";
import { ConfirmRecurringExpenseSheet } from "./ConfirmRecurringExpenseSheet";
import { selectDueItems } from "./dueItems";
import { useUpdateRecurringExpense } from "./hooks";

interface DueCardProps {
  building: Building;
  items: RecurringExpense[];
}

interface ToastState {
  message: string;
  onUndo?: () => void;
}

// Between the building header card and Summary (issue #24, FR4) — always
// uses real "today", never the period picker's selected period (AC9), and
// is hidden entirely when nothing is due or overdue (AC8).
export function DueCard({ building, items }: DueCardProps) {
  const { t } = useTranslation();
  const { currency, language } = useSettings();
  const updateMutation = useUpdateRecurringExpense();
  const [pendingSkipIds, setPendingSkipIds] = useState<Set<string>>(
    new Set(),
  );
  const skipTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const [toast, setToast] = useState<ToastState | null>(null);
  const [confirmingItem, setConfirmingItem] = useState<RecurringExpense | null>(
    null,
  );

  const today = localToday();
  const dueItems = useMemo(
    () => selectDueItems(items, today, pendingSkipIds),
    [items, today, pendingSkipIds],
  );

  if (dueItems.length === 0) {
    return null;
  }

  function handleSkip(item: RecurringExpense) {
    setPendingSkipIds((prev) => new Set(prev).add(item.recurringExpenseId));

    const timer = setTimeout(() => {
      skipTimers.current.delete(item.recurringExpenseId);
      updateMutation.mutate(
        {
          ...item,
          nextDueDate: advancePeriod(
            item.nextDueDate,
            item.frequency,
            item.anchorDay,
          ),
        },
        {
          onSettled: () => {
            setPendingSkipIds((prev) => {
              const next = new Set(prev);
              next.delete(item.recurringExpenseId);
              return next;
            });
          },
        },
      );
    }, 5000);
    skipTimers.current.set(item.recurringExpenseId, timer);

    setToast({
      message: t("recurringExpense.skippedToast", { name: item.name }),
      onUndo: () => {
        const pendingTimer = skipTimers.current.get(item.recurringExpenseId);
        if (pendingTimer) {
          clearTimeout(pendingTimer);
          skipTimers.current.delete(item.recurringExpenseId);
        }
        setPendingSkipIds((prev) => {
          const next = new Set(prev);
          next.delete(item.recurringExpenseId);
          return next;
        });
        setToast(null);
      },
    });
  }

  function handleConfirmTap(item: RecurringExpense) {
    // FR8a: opening a sheet dismisses any visible toast.
    setToast(null);
    setConfirmingItem(item);
  }

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-medium">
              {t("recurringExpense.dueTitle")}
            </h2>
            <Badge>{dueItems.length}</Badge>
          </div>
          <div className="divide-y divide-border rounded-lg border">
            {dueItems.map(({ recurringExpense, status }) => (
              <div
                key={recurringExpense.recurringExpenseId}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{recurringExpense.name}</span>
                    {status === "overdue" && (
                      <Badge variant="destructive">
                        {t("recurringExpense.overdueTag")}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(recurringExpense.amount, currency)} ·{" "}
                    {t("recurringExpense.dueDateLabel", {
                      date: formatShortDate(
                        recurringExpense.nextDueDate,
                        language,
                      ),
                    })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSkip(recurringExpense)}
                  >
                    {t("recurringExpense.skipButton")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleConfirmTap(recurringExpense)}
                  >
                    {t("recurringExpense.confirmButton")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {confirmingItem && (
        <ConfirmRecurringExpenseSheet
          item={confirmingItem}
          building={building}
          onClose={() => setConfirmingItem(null)}
          onLogged={(loggedAmount) => {
            setConfirmingItem(null);
            setToast({
              message: t("recurringExpense.loggedToast", {
                name: confirmingItem.name,
                amount: formatCurrency(loggedAmount, currency),
              }),
            });
          }}
        />
      )}

      {toast && <Toast message={toast.message} onUndo={toast.onUndo} />}
    </>
  );
}
