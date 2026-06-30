import type { Track } from "@/lib/track";
import {
  deriveTrackFromJobExperience,
  JOB_EXPERIENCE_LEVELS,
  START_WINDOW_OPTIONS,
} from "@/lib/companyRegistration";

export const ANONYMOUS_COMPANY_NAME = "Leading Nordic engineering company";

export const NORDIC_ASCENT_PROCESS_TEXT = `Nordic Ascent connects top engineering talent from India with leading Nordic companies through a structured process. You will go through a selection process, a Readiness programme that prepares you for Nordic work culture, and a mentoring relationship with a senior person at the company — all before you make the decision to relocate. You are not just applying for a job. You are entering a process designed to make sure it works for both sides.`;

export type CandidateJobCompany = {
  name: string;
  logo_url?: string | null;
  location?: string | null;
  status?: string | null;
  industry?: string | null;
  size?: string | null;
  description?: string | null;
  website?: string | null;
  country?: string | null;
  postal_code?: string | null;
};

export type CandidateJobPosting = {
  id: string;
  title: string;
  location?: string | null;
  status: string;
  engineering_discipline?: string | null;
  discipline_other?: string | null;
  positions_count?: number | null;
  experience_level?: string | null;
  target_track?: Track | null;
  core_skills?: string | null;
  desired_start_window?: string | null;
  description?: string | null;
  companies?: CandidateJobCompany | null;
};

/** Pending companies stay anonymous on candidate-facing postings until verified. */
export function isAnonymousCompany(status: string | null | undefined) {
  return status === "pending";
}

export function getCandidateCompanyName(company: CandidateJobCompany | null | undefined) {
  if (!company?.name) return ANONYMOUS_COMPANY_NAME;
  return isAnonymousCompany(company.status) ? ANONYMOUS_COMPANY_NAME : company.name;
}

export function getCandidateJobLocation(
  job: CandidateJobPosting,
  company: CandidateJobCompany | null | undefined
) {
  return company?.location?.trim() || job.location?.trim() || null;
}

export function getJobTrackBadge(job: CandidateJobPosting) {
  const track = job.target_track ?? deriveTrackFromJobExperience(job.experience_level ?? "");
  if (track === "entry") return "Entry Track — final year students";
  if (track === "fast") return "Fast Track — 1+ years experience";
  return null;
}

export function formatEngineeringDiscipline(job: CandidateJobPosting) {
  if (!job.engineering_discipline) return null;
  if (job.engineering_discipline === "Other") {
    return job.discipline_other?.trim() || "Other";
  }
  return job.engineering_discipline;
}

export function formatExperienceLevel(value: string | null | undefined) {
  if (!value) return null;
  const match = JOB_EXPERIENCE_LEVELS.find((o) => o.value === value);
  return match?.label ?? value;
}

export function formatStartWindow(value: string | null | undefined) {
  if (!value) return null;
  const match = START_WINDOW_OPTIONS.find((o) => o.value === value);
  return match?.label ?? value;
}

export function formatPositionsCount(count: number | null | undefined) {
  if (count == null || count < 1) return null;
  return `${count} position${count === 1 ? "" : "s"} available`;
}

export function formatWebsiteUrl(url: string | null | undefined) {
  if (!url?.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function getRoleSkillsText(job: CandidateJobPosting) {
  const skills = job.core_skills?.trim();
  if (skills) return skills;
  return job.description?.trim() || null;
}

export type JobPostingDetail = {
  label: string;
  value: string;
};

export function getAboutRoleDetails(job: CandidateJobPosting): JobPostingDetail[] {
  const details: JobPostingDetail[] = [];

  const discipline = formatEngineeringDiscipline(job);
  if (discipline) details.push({ label: "Engineering discipline", value: discipline });

  const experience = formatExperienceLevel(job.experience_level);
  if (experience) details.push({ label: "Experience level", value: experience });

  const skills = getRoleSkillsText(job);
  if (skills) details.push({ label: "Core technical skills required", value: skills });

  const positions = formatPositionsCount(job.positions_count);
  if (positions) details.push({ label: "Positions", value: positions });

  const startWindow = formatStartWindow(job.desired_start_window);
  if (startWindow) details.push({ label: "Desired start window", value: startWindow });

  return details;
}

export function getAboutCompanyDetails(company: CandidateJobCompany | null | undefined): JobPostingDetail[] {
  if (!company) return [];
  const details: JobPostingDetail[] = [];

  if (company.industry?.trim()) {
    details.push({ label: "Industry / sector", value: company.industry.trim() });
  }
  if (company.size?.trim()) {
    details.push({ label: "Company size", value: company.size.trim() });
  }

  return details;
}

export const CANDIDATE_JOB_COMPANY_SELECT =
  "name, logo_url, location, status, industry, size, description, website, country, postal_code";
