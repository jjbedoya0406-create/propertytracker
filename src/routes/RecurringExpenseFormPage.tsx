import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, Archive, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { parseCurrencyAmount } from "@/lib/currency";
import {
  advancePeriod,
  formatShortDate,
  localToday,
} from "@/lib/recurringExpenseDates";
import { useTranslation } from "../i18n/useTranslation";
import { useCategories } from "../features/categories/hooks";
import { useBuildings } from "../features/buildings/hooks";
import {
  useCreateRecurringExpense,
  useRecurringExpenses,
  useUpdateRecurringExpense,
} from "../features/recurringExpenses/hooks";
import { useSettings } from "../portfolio/context";
import type {
  Building,
  Category,
  RecurringExpense,
  RecurringExpenseFrequency,
} from "../types";

export function RecurringExpenseFormPage() {
  const { t } = useTranslation();
  const { buildingId, recurringExpenseId } = useParams<{
    buildingId: string;
    recurringExpenseId?: string;
  }>();
  const { data: buildings, isPending: buildingsPending } = useBuildings();
  const { data: categories, isPending: categoriesPending } = useCategories();
  const { data: recurringExpenses, isPending: recurringPending } =
    useRecurringExpenses();

  if (!buildingId) {
    return <Navigate to="/properties" replace />;
  }

  const isPending = buildingsPending || categoriesPending || recurringPending;
  if (isPending) {
    return (
      <p className="text-muted-foreground">{t("common.loading")}</p>
    );
  }

  const building = buildings?.find((b) => b.buildingId === buildingId);
  if (!building) {
    return <Navigate to="/properties" replace />;
  }

  const existing = recurringExpenseId
    ? recurringExpenses?.find(
        (r) => r.recurringExpenseId === recurringExpenseId,
      )
    : undefined;
  if (recurringExpenseId && !existing) {
    return <Navigate to={`/buildings/${buildingId}`} replace />;
  }

  return (
    <RecurringExpenseFormFields
      key={recurringExpenseId ?? "new"}
      building={building}
      categories={categories ?? []}
      existing={existing}
    />
  );
}

interface RecurringExpenseFormFieldsProps {
  building: Building;
  categories: Category[];
  existing?: RecurringExpense;
}

function RecurringExpenseFormFields({
  building,
  categories,
  existing,
}: RecurringExpenseFormFieldsProps) {
  const { t } = useTranslation();
  const { currency, language } = useSettings();
  const navigate = useNavigate();
  const createMutation = useCreateRecurringExpense();
  const updateMutation = useUpdateRecurringExpense();

  const [name, setName] = useState(existing?.name ?? "");
  const [amount, setAmount] = useState(
    existing ? String(existing.amount) : "",
  );
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [frequency, setFrequency] = useState<RecurringExpenseFrequency>(
    existing?.frequency ?? "monthly",
  );
  const [nextDueDate, setNextDueDate] = useState(existing?.nextDueDate ?? "");
  const [formError, setFormError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const activeCategories = categories.filter((c) => c.status === "active");
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isPaused = existing?.status === "paused";

  function goBackWithToast(message: string) {
    navigate(`/buildings/${building.buildingId}`, {
      state: { toastMessage: message },
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedAmount = parseCurrencyAmount(amount, currency);
    // Lowercased to match the issue's own example sentence exactly
    // ("Add a name, amount to save.") — these labels are normally
    // capitalized field headings, not sentence fragments.
    const missing: string[] = [];
    if (!name.trim()) missing.push(t("recurringExpense.nameLabel").toLowerCase());
    if (!amount.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      missing.push(t("recurringExpense.amountLabel").toLowerCase());
    }
    if (!categoryId) missing.push(t("expenseForm.categoryLabel").toLowerCase());
    if (!nextDueDate) {
      missing.push(t("recurringExpense.nextDueDateLabel").toLowerCase());
    }
    if (missing.length > 0) {
      setFormError(
        t("recurringExpense.missingFieldsError", {
          fields: missing.join(", "),
        }),
      );
      return;
    }
    setFormError(null);

    const anchorDay = Number(nextDueDate.slice(8, 10));
    const trimmedName = name.trim();

    if (existing) {
      updateMutation.mutate(
        {
          ...existing,
          name: trimmedName,
          amount: parsedAmount,
          categoryId,
          frequency,
          nextDueDate,
          anchorDay,
        },
        {
          onSuccess: () =>
            goBackWithToast(
              t("recurringExpense.savedToast", { name: trimmedName }),
            ),
        },
      );
    } else {
      createMutation.mutate(
        {
          buildingId: building.buildingId,
          name: trimmedName,
          amount: parsedAmount,
          categoryId,
          frequency,
          nextDueDate,
          anchorDay,
        },
        {
          onSuccess: () =>
            goBackWithToast(
              t("recurringExpense.addedToast", { name: trimmedName }),
            ),
        },
      );
    }
  }

  function handlePauseResume() {
    if (!existing) return;
    if (isPaused) {
      // Resuming: if the due date already passed while paused, move
      // forward to the next upcoming occurrence rather than creating a
      // backlog of overdue periods (FR8/AC10).
      const today = localToday();
      let resumedDueDate = existing.nextDueDate;
      while (resumedDueDate < today) {
        resumedDueDate = advancePeriod(
          resumedDueDate,
          existing.frequency,
          existing.anchorDay,
        );
      }
      updateMutation.mutate(
        { ...existing, status: "active", nextDueDate: resumedDueDate },
        {
          onSuccess: () =>
            goBackWithToast(
              t("recurringExpense.resumedToast", {
                name: existing.name,
                date: formatShortDate(resumedDueDate, language),
              }),
            ),
        },
      );
    } else {
      updateMutation.mutate(
        { ...existing, status: "paused" },
        {
          onSuccess: () =>
            goBackWithToast(
              t("recurringExpense.pausedToast", { name: existing.name }),
            ),
        },
      );
    }
  }

  function handleEnd() {
    if (!existing) return;
    updateMutation.mutate(
      { ...existing, status: "ended" },
      {
        onSuccess: () =>
          goBackWithToast(
            t("recurringExpense.endedToast", { name: existing.name }),
          ),
      },
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        to={`/buildings/${building.buildingId}`}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {building.name}
      </Link>

      <div>
        <h1 className="text-xl font-medium">
          {existing
            ? t("recurringExpense.editTitle")
            : t("recurringExpense.newTitle")}
        </h1>
        <p className="text-muted-foreground">
          {t("recurringExpense.buildingSubtitle", { building: building.name })}
        </p>
      </div>

      {isPaused && (
        <Alert>
          <AlertDescription>
            {t("recurringExpense.pausedNote")}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recurring-name">
            {t("recurringExpense.nameLabel")}
          </Label>
          <Input
            id="recurring-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recurring-amount">
            {t("recurringExpense.amountLabel")}
          </Label>
          {currency === "COP" ? (
            <Input
              id="recurring-amount"
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          ) : (
            <Input
              id="recurring-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recurring-category">
            {t("expenseForm.categoryLabel")}
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="recurring-category" className="w-full">
              <SelectValue placeholder={t("expenseForm.categoryPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {activeCategories.map((cat) => (
                <SelectItem key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>{t("recurringExpense.frequencyLabel")}</Label>
          <div className="flex gap-2">
            {(["monthly", "quarterly"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFrequency(option)}
                className={cn(
                  "min-h-11 flex-1 rounded-lg px-3 py-2 text-sm font-medium",
                  frequency === option
                    ? "border border-primary bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground hover:bg-muted",
                )}
              >
                {t(`recurringExpense.${option}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recurring-next-due-date">
            {t("recurringExpense.nextDueDateLabel")}
          </Label>
          <Input
            id="recurring-next-due-date"
            type="date"
            value={nextDueDate}
            onChange={(event) => setNextDueDate(event.target.value)}
          />
        </div>

        {formError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={isSaving}>
          {t("common.saveChanges")}
        </Button>

        {existing && !showEndConfirm && (
          <>
            <div className="border-t border-border" />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isSaving}
                onClick={handlePauseResume}
              >
                {isPaused
                  ? t("recurringExpense.resumeButton")
                  : t("recurringExpense.pauseButton")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                disabled={isSaving}
                onClick={() => setShowEndConfirm(true)}
              >
                <Archive className="size-4" />
                {t("recurringExpense.endButton")}
              </Button>
            </div>
          </>
        )}

        {existing && showEndConfirm && (
          <div className="flex flex-col gap-3 rounded-lg border border-destructive p-4">
            <div className="flex flex-col gap-1">
              <p className="font-medium">
                {t("recurringExpense.endConfirmTitle", {
                  name: existing.name,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("recurringExpense.endConfirmBody")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isSaving}
                onClick={() => setShowEndConfirm(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isSaving}
                onClick={handleEnd}
              >
                {t("recurringExpense.endButton")}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
