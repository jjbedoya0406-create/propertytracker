import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { parseCurrencyAmount } from "@/lib/currency";
import { advancePeriod } from "@/lib/recurringExpenseDates";
import { useTranslation } from "../../i18n/useTranslation";
import { useSettings } from "../../portfolio/context";
import type { Building, RecurringExpense } from "../../types";
import { ReceiptCaptureInput } from "../expenses/ReceiptCaptureInput";
import { useCreateExpenseWithReceipt } from "../expenses/hooks";
import { useUpdateRecurringExpense } from "./hooks";

interface ConfirmRecurringExpenseSheetProps {
  item: RecurringExpense;
  building: Building;
  onClose: () => void;
  onLogged: (amount: number) => void;
}

// FR5: prefilled amount/date, both editable — editing the amount here
// never changes the recurring expense's own saved amount, only what gets
// logged for this one period. No OCR here (unlike the main Capture
// screen): the amount is already known, so both Take-photo and Upload
// only ever attach a receipt for the record, never auto-fill anything.
export function ConfirmRecurringExpenseSheet({
  item,
  building,
  onClose,
  onLogged,
}: ConfirmRecurringExpenseSheetProps) {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const createExpense = useCreateExpenseWithReceipt();
  const updateRecurringExpense = useUpdateRecurringExpense();

  const [amount, setAmount] = useState(String(item.amount));
  const [datePaid, setDatePaid] = useState(item.nextDueDate);
  const [photo, setPhoto] = useState<Blob | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  function attachFile(file: File) {
    setAttachedFile(file);
    setPhoto(file);
    setPreviewUrl(
      file.type.startsWith("image/") && file.type !== "image/heic"
        ? URL.createObjectURL(file)
        : null,
    );
  }

  function removeAttachment() {
    setAttachedFile(null);
    setPhoto(null);
    setPreviewUrl(null);
  }

  function handleLogExpense() {
    const parsedAmount = parseCurrencyAmount(amount, currency);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !datePaid) {
      setFormError(t("validation.invalidInput"));
      return;
    }
    setFormError(null);

    createExpense.mutate(
      {
        target: { scope: "building", building },
        amount: parsedAmount,
        date: datePaid,
        categoryId: item.categoryId,
        photo,
        attachmentSource: null,
      },
      {
        onSuccess: () => {
          updateRecurringExpense.mutate(
            {
              ...item,
              nextDueDate: advancePeriod(
                item.nextDueDate,
                item.frequency,
                item.anchorDay,
              ),
            },
            { onSuccess: () => onLogged(parsedAmount) },
          );
        },
        onError: (err) =>
          setFormError(
            err instanceof Error ? err.message : t("errors.saveExpenseFailed"),
          ),
      },
    );
  }

  const isSaving = createExpense.isPending || updateRecurringExpense.isPending;

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>
            {t("recurringExpense.confirmSheetTitle", { name: item.name })}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="text-muted-foreground">
            {t("recurringExpense.buildingSubtitle", { building: building.name })}
          </p>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-amount">
              {t("recurringExpense.amountLabel")}
            </Label>
            {currency === "COP" ? (
              <Input
                id="confirm-amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            ) : (
              <Input
                id="confirm-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-date-paid">
              {t("recurringExpense.datePaidLabel")}
            </Label>
            <Input
              id="confirm-date-paid"
              type="date"
              value={datePaid}
              onChange={(event) => setDatePaid(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("recurringExpense.receiptLabel")}</Label>
            <ReceiptCaptureInput
              file={attachedFile}
              previewUrl={previewUrl}
              onCapture={attachFile}
              onUpload={attachFile}
              onRemove={removeAttachment}
              disabled={isSaving}
            />
          </div>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={isSaving}
              onClick={onClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={isSaving}
              onClick={handleLogExpense}
            >
              {t("expenses.logButton")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
