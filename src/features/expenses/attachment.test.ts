import { describe, expect, it } from "vitest";
import {
  attachmentKind,
  extensionForMimeType,
  formatFileSize,
  MAX_ATTACHMENT_SIZE_BYTES,
  validateAttachment,
} from "./attachment";

function file(name: string, type: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

describe("validateAttachment", () => {
  it("accepts a PDF under the size limit", () => {
    expect(validateAttachment(file("invoice.pdf", "application/pdf", 1024))).toEqual({
      ok: true,
    });
  });

  it.each([
    ["image/jpeg", "photo.jpg"],
    ["image/png", "photo.png"],
    ["image/heic", "photo.heic"],
  ])("accepts %s", (type, name) => {
    expect(validateAttachment(file(name, type, 1024))).toEqual({ ok: true });
  });

  it("accepts HEIC by extension even when the browser reports no MIME type", () => {
    expect(validateAttachment(file("photo.HEIC", "", 1024))).toEqual({
      ok: true,
    });
  });

  it("rejects an unsupported file type", () => {
    expect(
      validateAttachment(
        file("notes.docx", "application/vnd.openxmlformats", 1024),
      ),
    ).toEqual({ ok: false, reason: "type" });
  });

  it("rejects a file over the size limit", () => {
    expect(
      validateAttachment(
        file("invoice.pdf", "application/pdf", MAX_ATTACHMENT_SIZE_BYTES + 1),
      ),
    ).toEqual({ ok: false, reason: "size" });
  });

  it("accepts a file exactly at the size limit", () => {
    expect(
      validateAttachment(
        file("invoice.pdf", "application/pdf", MAX_ATTACHMENT_SIZE_BYTES),
      ),
    ).toEqual({ ok: true });
  });
});

describe("extensionForMimeType", () => {
  it("maps each accepted MIME type to its extension", () => {
    expect(extensionForMimeType("application/pdf")).toBe(".pdf");
    expect(extensionForMimeType("image/jpeg")).toBe(".jpg");
    expect(extensionForMimeType("image/png")).toBe(".png");
    expect(extensionForMimeType("image/heic")).toBe(".heic");
  });

  it("falls back to .jpg for an unrecognized type (camera output is always JPEG)", () => {
    expect(extensionForMimeType("")).toBe(".jpg");
  });
});

describe("attachmentKind", () => {
  it("classifies JPG/PNG as image", () => {
    expect(attachmentKind(file("a.jpg", "image/jpeg", 10))).toBe("image");
    expect(attachmentKind(file("a.png", "image/png", 10))).toBe("image");
  });

  it("classifies HEIC separately from other images", () => {
    expect(attachmentKind(file("a.heic", "image/heic", 10))).toBe("heic");
  });

  it("classifies PDF", () => {
    expect(attachmentKind(file("a.pdf", "application/pdf", 10))).toBe("pdf");
  });
});

describe("formatFileSize", () => {
  it("formats bytes under 1KB", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(450 * 1024)).toBe("450 KB");
  });

  it("formats megabytes with one decimal", () => {
    expect(formatFileSize(2.3 * 1024 * 1024)).toBe("2.3 MB");
  });
});
