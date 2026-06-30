const CV_MAX_BYTES = 10 * 1024 * 1024;

const CV_MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const CV_ALLOWED_MIMES = new Set(Object.values(CV_MIME_BY_EXT));

export function getCvExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function resolveCvContentType(file: File): string {
  const ext = getCvExtension(file.name);
  const fromExt = CV_MIME_BY_EXT[ext];
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  return fromExt ?? file.type ?? "application/octet-stream";
}

export function validateCvFile(file: File): { ok: true } | { ok: false; message: string } {
  if (file.size > CV_MAX_BYTES) {
    return { ok: false, message: "Maximum size is 10 MB" };
  }

  const ext = getCvExtension(file.name);
  const contentType = resolveCvContentType(file);

  if (!CV_MIME_BY_EXT[ext] && !CV_ALLOWED_MIMES.has(contentType)) {
    return { ok: false, message: "Use PDF, DOC, or DOCX" };
  }

  return { ok: true };
}

export const CV_ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
