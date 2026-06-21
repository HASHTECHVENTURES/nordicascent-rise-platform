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
};

export type CompanyFieldKey = "industry" | "location" | "description" | "logo";

export const COMPANY_PROFILE_REQUIREMENTS: { key: CompanyFieldKey; label: string }[] = [
  { key: "industry", label: "Industry" },
  { key: "location", label: "Location" },
  { key: "description", label: "Company description" },
  { key: "logo", label: "Company logo" },
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
    default:
      return false;
  }
}

export function getMissingCompanyFields(company: CompanyProfile | null) {
  if (!company?.name?.trim()) {
    return [{ key: "name" as const, label: "Company name" }];
  }
  return COMPANY_PROFILE_REQUIREMENTS.filter((f) => !isCompanyFieldComplete(f.key, company));
}

export function isCompanyProfileComplete(company: CompanyProfile | null) {
  return getMissingCompanyFields(company).length === 0;
}

export function getCompanyProfilePercent(company: CompanyProfile | null) {
  const total = COMPANY_PROFILE_REQUIREMENTS.length + 1;
  const missing = getMissingCompanyFields(company).length;
  return Math.round(((total - missing) / total) * 100);
}

export function companyToForm(company: CompanyProfile) {
  return {
    name: company.name ?? "",
    industry: company.industry ?? "",
    location: company.location ?? "",
    size: company.size ?? "",
    description: company.description ?? "",
    website: company.website ?? "",
    logo_url: company.logo_url ?? "",
  };
}
