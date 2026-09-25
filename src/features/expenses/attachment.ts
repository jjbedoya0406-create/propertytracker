// Issue #17: shared file-type/size rules for the capture screen's "Upload
// file" path (and the filename-extension fix that also benefits camera
// photos). Kept pure/testable — no DOM, no network.

export const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

// HEIC's MIME type is unreliable across browsers/OSes (some report "",
// some report "image/heic", some "image/heif") — the accept attribute and
// this validator both fall back to the file extension for it.
const ACCEPTED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/heic",
]);
const ACCEPTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".heic"];

export const ATTACHMENT_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/heic,.pdf,.heic";

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export type AttachmentValidation =
  | { ok: true }
  | { ok: false; reason: "type" | "size" };

export function validateAttachment(file: File): AttachmentValidation {
  const typeOk =
    ACCEPTED_MIME_TYPES.has(file.type) || hasAcceptedExtension(file.name);
  if (!typeOk) {
    return { ok: false, reason: "type" };
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return { ok: false, reason: "size" };
  }
  return { ok: true };
}

// Today's Drive filename has no extension at all — this fixes that for
// both uploads (FR5: "preserve the original extension") and camera
// photos, which are always JPEG.
export function extensionForMimeType(type: string): string {
  switch (type) {
    case "application/pdf":
      return ".pdf";
    case "image/png":
      return ".png";
    case "image/heic":
      return ".heic";
    case "image/jpeg":
    default:
      return ".jpg";
  }
}

export type AttachmentKind = "image" | "heic" | "pdf";

// Drives the attachment card's icon vs. thumbnail choice (FR3). HEIC is
// split out from "image" because most browsers other than Safari can't
// render it — it gets a generic icon instead of an <img> thumbnail.
export function attachmentKind(file: File): AttachmentKind {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
    return "heic";
  }
  return "image";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
