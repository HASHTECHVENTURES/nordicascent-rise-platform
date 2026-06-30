import type { Track } from "@/lib/track";

export const APPLICATION_MOTIVATION_MAX_WORDS = 500;

export type JobApplicationForm = {
  motivation_statement: string;
  academic_transcript_path: string;
  project_descriptions_text: string;
  project_descriptions_path: string;
  work_experience_path: string;
  portfolio_path: string;
};

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validateJobApplication(
  track: Track,
  form: JobApplicationForm
): { ok: true } | { ok: false; message: string } {
  if (!form.motivation_statement.trim()) {
    return { ok: false, message: "Motivation statement is required." };
  }
  if (countWords(form.motivation_statement) > APPLICATION_MOTIVATION_MAX_WORDS) {
    return { ok: false, message: `Motivation statement must be ${APPLICATION_MOTIVATION_MAX_WORDS} words or fewer.` };
  }
  if (!form.academic_transcript_path) {
    return { ok: false, message: "Academic transcript (PDF) is required." };
  }
  if (track === "entry") {
    const hasProject =
      form.project_descriptions_text.trim().length > 0 || Boolean(form.project_descriptions_path);
    if (!hasProject) {
      return { ok: false, message: "Project descriptions are required for Entry Track." };
    }
  }
  if (track === "fast") {
    if (!form.work_experience_path) {
      return { ok: false, message: "Work experience breakdown (PDF) is required for Fast Track." };
    }
  }
  return { ok: true };
}

export const APPLICATION_PDF_ACCEPT = ".pdf,application/pdf";

export function validateApplicationPdf(file: File): { ok: true } | { ok: false; message: string } {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const isPdf = file.type === "application/pdf" || ext === "pdf";
  if (!isPdf) return { ok: false, message: "Only PDF files are allowed for this upload." };
  if (file.size > 10 * 1024 * 1024) return { ok: false, message: "Maximum file size is 10 MB." };
  return { ok: true };
}

export function applicationDocumentPath(profileId: string, jobId: string, field: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${profileId}/applications/${jobId}/${field}-${Date.now()}-${safeName}`;
}
