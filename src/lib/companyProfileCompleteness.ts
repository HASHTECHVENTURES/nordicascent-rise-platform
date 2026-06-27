import { parseContactPhone } from "@/lib/companyRegistration";

export type CompanyProfile = {
  id?: string;
  name: string;
  industry: string | null;
  location: string | null;
  size: string | null;
  description: string | null;
  website: string | null;
  logo_url: string | null;
  status?: string;
  updated_at?: string;
  country?: string | null;
  org_number?: string | null;
  postal_code?: string | null;
  contact_name?: string | null;
  contact_role?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  hired_international_before?: boolean | null;
  international_hiring_challenge?: string | null;
  workplace_language?: string | null;
  relocation_support?: string | null;
  heard_about?: string | null;
  registration_notes?: string | null;
};

export type CompanyJobDraft = {
  title: string;
  engineering_discipline: string;
  discipline_other: string;
  positions_count: string;
  experience_level: string;
  target_track: string;
  core_skills: string;
  desired_start_window: string;
};

export type CompanyFieldKey =
  | "industry"
  | "location"
  | "description"
  | "logo"
  | "country"
  | "org_number"
  | "postal_code"
  | "contact_name"
  | "contact_role"
  | "contact_email"
  | "contact_phone"
  | "hired_international_before"
  | "workplace_language"
  | "relocation_support"
  | "heard_about";

export const COMPANY_PROFILE_REQUIREMENTS: { key: CompanyFieldKey; label: string }[] = [
  { key: "country", label: "Country" },
  { key: "org_number", label: "Org number" },
  { key: "postal_code", label: "Post number" },
  { key: "industry", label: "Industry" },
  { key: "location", label: "Location" },
  { key: "description", label: "Company description" },
  { key: "logo", label: "Company logo" },
  { key: "contact_name", label: "Contact name" },
  { key: "contact_role", label: "Contact role" },
  { key: "contact_email", label: "Contact email" },
  { key: "contact_phone", label: "Contact phone" },
  { key: "hired_international_before", label: "International hiring experience" },
  { key: "workplace_language", label: "Workplace language" },
  { key: "relocation_support", label: "Relocation support" },
  { key: "heard_about", label: "How you heard about us" },
];

export const JOB_DRAFT_REQUIREMENTS: { key: keyof CompanyJobDraft; label: string }[] = [
  { key: "title", label: "Job title" },
  { key: "engineering_discipline", label: "Engineering discipline" },
  { key: "positions_count", label: "Number of positions" },
  { key: "experience_level", label: "Experience level" },
  { key: "target_track", label: "Program track" },
  { key: "core_skills", label: "Core technical skills" },
  { key: "desired_start_window", label: "Desired start window" },
];

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function isCompanyFieldComplete(key: CompanyFieldKey, company: CompanyProfile | null): boolean {
  if (!company) return false;
  switch (key) {
    case "industry":
      return hasValue(company.industry);
    case "location":
      return hasValue(company.location);
    case "description":
      return hasValue(company.description);
    case "logo":
      return hasValue(company.logo_url);
    case "country":
      return hasValue(company.country);
    case "org_number":
      return hasValue(company.org_number);
    case "postal_code":
      return hasValue(company.postal_code);
    case "contact_name":
      return hasValue(company.contact_name);
    case "contact_role":
      return hasValue(company.contact_role);
    case "contact_email":
      return hasValue(company.contact_email);
    case "contact_phone":
      return hasValue(company.contact_phone);
    case "hired_international_before":
      return company.hired_international_before !== null && company.hired_international_before !== undefined;
    case "workplace_language":
      return hasValue(company.workplace_language);
    case "relocation_support":
      return hasValue(company.relocation_support);
    case "heard_about":
      return hasValue(company.heard_about);
    default:
      return false;
  }
}

export function getMissingCompanyFields(company: CompanyProfile | null) {
  if (!company?.name?.trim()) {
    return [{ key: "name" as const, label: "Company name" }];
  }
  const missing = COMPANY_PROFILE_REQUIREMENTS.filter((f) => !isCompanyFieldComplete(f.key, company));
  if (
    company.hired_international_before === true &&
    !hasValue(company.international_hiring_challenge)
  ) {
    missing.push({ key: "international_hiring_challenge" as CompanyFieldKey, label: "Main hiring challenge" });
  }
  return missing;
}

export function getMissingJobDraftFields(job: CompanyJobDraft) {
  const missing = JOB_DRAFT_REQUIREMENTS.filter((f) => !hasValue(job[f.key]));
  if (job.engineering_discipline === "Other" && !hasValue(job.discipline_other)) {
    missing.push({ key: "discipline_other", label: "Discipline (other)" });
  }
  return missing;
}

export function isCompanyProfileComplete(company: CompanyProfile | null) {
  return getMissingCompanyFields(company).length === 0;
}

export function isRegistrationComplete(company: CompanyProfile | null, job: CompanyJobDraft) {
  return isCompanyProfileComplete(company) && getMissingJobDraftFields(job).length === 0;
}

export function getCompanyProfilePercent(company: CompanyProfile | null) {
  const total = COMPANY_PROFILE_REQUIREMENTS.length + 1;
  const missing = getMissingCompanyFields(company).length;
  return Math.round(((total - missing) / total) * 100);
}

export function companyToForm(company: CompanyProfile) {
  const parsedPhone = parseContactPhone(company.contact_phone);
  return {
    name: company.name ?? "",
    industry: company.industry ?? "",
    location: company.location ?? "",
    size: company.size ?? "",
    description: company.description ?? "",
    website: company.website ?? "",
    logo_url: company.logo_url ?? "",
    country: company.country ?? "Norway",
    org_number: company.org_number ?? "",
    postal_code: company.postal_code ?? "",
    contact_name: company.contact_name ?? "",
    contact_role: company.contact_role ?? "",
    contact_email: company.contact_email ?? "",
    contact_phone: parsedPhone.local,
    contact_phone_country: parsedPhone.country,
    hired_international_before:
      company.hired_international_before === null || company.hired_international_before === undefined
        ? ""
        : company.hired_international_before
          ? "yes"
          : "no",
    international_hiring_challenge: company.international_hiring_challenge ?? "",
    workplace_language: company.workplace_language ?? "",
    relocation_support: company.relocation_support ?? "",
    heard_about: company.heard_about ?? "",
    registration_notes: company.registration_notes ?? "",
  };
}

export const emptyJobDraft = (): CompanyJobDraft => ({
  title: "",
  engineering_discipline: "",
  discipline_other: "",
  positions_count: "1",
  experience_level: "",
  target_track: "",
  core_skills: "",
  desired_start_window: "",
});

export function jobToDraft(job: {
  title?: string | null;
  engineering_discipline?: string | null;
  discipline_other?: string | null;
  positions_count?: number | null;
  experience_level?: string | null;
  target_track?: string | null;
  core_skills?: string | null;
  desired_start_window?: string | null;
} | null | undefined): CompanyJobDraft {
  if (!job) return emptyJobDraft();
  return {
    title: job.title ?? "",
    engineering_discipline: job.engineering_discipline ?? "",
    discipline_other: job.discipline_other ?? "",
    positions_count: job.positions_count != null ? String(job.positions_count) : "1",
    experience_level: job.experience_level ?? "",
    target_track: job.target_track ?? "",
    core_skills: job.core_skills ?? "",
    desired_start_window: job.desired_start_window ?? "",
  };
}
