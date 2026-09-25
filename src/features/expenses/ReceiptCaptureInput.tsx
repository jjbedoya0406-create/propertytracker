import { Camera, FileImage, FileText, Upload, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "../../i18n/useTranslation";
import {
  ATTACHMENT_ACCEPT,
  attachmentKind,
  formatFileSize,
  MAX_ATTACHMENT_SIZE_BYTES,
  validateAttachment,
} from "./attachment";

interface ReceiptCaptureInputProps {
  file: File | null;
  previewUrl: string | null;
  onCapture: (file: File) => void;
  onUpload: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

// Two capture paths (issue #17): "Take photo" opens the camera directly on
// mobile via `capture="environment"` (unchanged from before this issue);
// "Upload file" is a separate input with no capture attribute, so phones
// offer Files/photo library instead. Kept as two distinct <input>s per the
// spec rather than sharing one, since their accept/capture behavior
// genuinely differs. Both inputs stay mounted (visually hidden, triggered
// via ref) even once a file is attached, so "Replace" can reopen whichever
// one was last used.
export function ReceiptCaptureInput({
  file,
  previewUrl,
  onCapture,
  onUpload,
  onRemove,
  disabled,
}: ReceiptCaptureInputProps) {
  const { t } = useTranslation();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [lastSource, setLastSource] = useState<"camera" | "upload" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleCameraChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    setLastSource("camera");
    setValidationError(null);
    onCapture(selected);
  }

  function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    setLastSource("upload");

    const result = validateAttachment(selected);
    if (!result.ok) {
      setValidationError(
        result.reason === "type"
          ? t("expenseForm.unsupportedFileType")
          : t("expenseForm.fileTooLarge", {
              max: String(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024)),
            }),
      );
      return;
    }
    setValidationError(null);
    onUpload(selected);
  }

  function handleReplace() {
    if (lastSource === "camera") {
      cameraInputRef.current?.click();
    } else {
      uploadInputRef.current?.click();
    }
  }

  function handleRemove() {
    setValidationError(null);
    onRemove();
  }

  const hiddenInputs = (
    <>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        disabled={disabled}
        className="sr-only"
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept={ATTACHMENT_ACCEPT}
        onChange={handleUploadChange}
        disabled={disabled}
        className="sr-only"
      />
    </>
  );

  if (file) {
    const kind = attachmentKind(file);
    return (
      <div className="flex flex-col gap-2">
        {hiddenInputs}
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
            {kind === "image" && previewUrl ? (
              <img
                src={previewUrl}
                alt={t("expenseForm.receiptPreviewAlt")}
                className="size-full object-cover"
              />
            ) : kind === "pdf" ? (
              <FileText className="size-6 text-muted-foreground" />
            ) : (
              <FileImage className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {kind.toUpperCase()} · {formatFileSize(file.size)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={handleReplace}
            >
              {t("expenseForm.replaceAttachment")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t("expenseForm.removeAttachment")}
              disabled={disabled}
              onClick={handleRemove}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {hiddenInputs}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={disabled}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera className="size-4" />
          {t("expenseForm.takePhotoButton")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={disabled}
          onClick={() => uploadInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {t("expenseForm.uploadFileButton")}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("expenseForm.attachmentHelperText")}
      </p>
      {validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
    </div>
  );
}
