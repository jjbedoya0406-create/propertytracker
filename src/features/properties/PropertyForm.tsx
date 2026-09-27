import { useState, type FormEvent } from "react";
import { AlertCircle, Archive } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "../../i18n/useTranslation";
import { createPropertyInputSchema, type PropertyInput } from "./schema";

interface PropertyFormProps {
  initialValues?: PropertyInput;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (input: PropertyInput) => void;
  onCancel?: () => void;
  // A unit that belongs to a building reads its address from the building
  // instead (issue #20 — the two used to drift independently), so its own
  // address field is redundant and misleading to edit here. Standalone
  // properties keep the field.
  showAddressField?: boolean;
  // Only passed when editing a genuine unit (issue #21) — archiving a
  // standalone property still happens via the identity card's own
  // buttons, unchanged. Confirmed here rather than immediately on tap,
  // since archiving is easy to trigger by accident.
  onArchive?: () => void;
  isArchiving?: boolean;
}

export function PropertyForm({
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
  showAddressField = true,
  onArchive,
  isArchiving,
}: PropertyFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialValues?.name ?? "");
  const [address, setAddress] = useState(initialValues?.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const result = createPropertyInputSchema(t).safeParse({ name, address });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? t("validation.invalidInput"));
      return;
    }
    setError(null);
    onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="property-name">{t("propertyForm.nameLabel")}</Label>
        <Input
          id="property-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      {showAddressField && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="property-address">
            {t("propertyForm.addressLabel")}
          </Label>
          <Input
            id="property-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
        )}
      </div>

      {onArchive && (
        <>
          <div className="border-t border-border" />
          <button
            type="button"
            onClick={() => setShowArchiveConfirm(true)}
            className="flex items-center justify-center gap-2 text-body-strong text-red-text"
          >
            <Archive className="size-4" />
            {t("property.archiveUnitButton")}
          </button>
        </>
      )}

      {onArchive && (
        <Dialog open={showArchiveConfirm} onOpenChange={setShowArchiveConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("property.archiveUnitConfirmTitle", { name })}
              </DialogTitle>
              <DialogDescription>
                {t("property.archiveUnitConfirmBody")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isArchiving}
                onClick={() => setShowArchiveConfirm(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                disabled={isArchiving}
                onClick={onArchive}
              >
                {t("common.archive")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </form>
  );
}
