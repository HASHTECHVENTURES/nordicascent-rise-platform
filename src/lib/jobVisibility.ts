import { supabase } from "@/lib/supabase";
import { isCompanyProfileComplete, type CompanyProfile } from "@/lib/companyProfileCompleteness";

export const VISIBLE_COMPANY_STATUSES = ["active", "verified", "intake_received"] as const;

const LISTABLE_COMPANY_STATUSES = [...VISIBLE_COMPANY_STATUSES, "pending"] as const;

type JobWithCompany = {
  status: string;
  companies: { status?: string | null } | null;
};

/** Open jobs employers have published — includes pending companies until admin verifies. */
export function isCandidateVisibleJob(job: JobWithCompany) {
  if (job.status !== "open") return false;
  const status = job.companies?.status;
  if (!status || status === "suspended") return false;
  return LISTABLE_COMPANY_STATUSES.includes(status as (typeof LISTABLE_COMPANY_STATUSES)[number]);
}

/** Pending/intake companies become active when they publish an open role (profile already complete in UI). */
export async function ensureCompanyActiveWhenPublishingJob(companyId: string) {
  const { data: company, error } = await supabase
    .from("companies")
    .select("id, status, name, industry, location, size, description, website, logo_url")
    .eq("id", companyId)
    .maybeSingle();
  if (error || !company) return;

  if (VISIBLE_COMPANY_STATUSES.includes(company.status as (typeof VISIBLE_COMPANY_STATUSES)[number])) {
    return;
  }

  if (company.status !== "pending" && company.status !== "intake_received") return;

  const profile: CompanyProfile = {
    name: company.name,
    industry: company.industry,
    location: company.location,
    size: company.size,
    description: company.description,
    website: company.website,
    logo_url: company.logo_url,
    status: company.status,
  };

  if (!isCompanyProfileComplete(profile)) return;

  await supabase.from("companies").update({ status: "active" }).eq("id", companyId);
}
