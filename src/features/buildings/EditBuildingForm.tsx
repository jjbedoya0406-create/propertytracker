import { useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "../../i18n/useTranslation";

export interface EditBuildingInput {
  name: string;
  address?: string;
}

interface EditBuildingFormProps {
  initialName: string;
  initialAddress?: string;
  isSubmitting?: boolean;
  onSubmit: (input: EditBuildingInput) => void;
  onCancel: () => void;
}

// Edits both name and address together (issue #20 added address —
// previously this only renamed) — units belonging to this building read
// its address rather than storing their own copy, so this is the one
// place a building's address gets corrected.
export function EditBuildingForm({
  initialName,
  initialAddress,
  isSubmitting,
  onSubmit,
  onCancel,
}: EditBuildingFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("validation.buildingNameRequired"));
      return;
    }
    setError(null);
    onSubmit({ name: trimmed, address: address.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="building-name">
          {t("buildings.buildingNameLabel")}
        </Label>
        <Input
          id="building-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="building-address">{t("buildings.addressLabel")}</Label>
        <Input
          id="building-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {t("common.saveChanges")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onCancel}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
