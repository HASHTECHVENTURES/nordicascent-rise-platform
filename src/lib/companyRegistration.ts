import type { Track } from "@/lib/track";

export const COMPANY_COUNTRIES = [
  "Norway",
  "Sweden",
  "Denmark",
  "Finland",
  "Iceland",
  "Germany",
  "Other",
] as const;

export const PHONE_COUNTRY_OPTIONS = [
  { country: "Norway", prefix: "+47" },
  { country: "Sweden", prefix: "+46" },
  { country: "Denmark", prefix: "+45" },
  { country: "Finland", prefix: "+358" },
  { country: "Iceland", prefix: "+354" },
  { country: "Germany", prefix: "+49" },
  { country: "India", prefix: "+91" },
  { country: "United Kingdom", prefix: "+44" },
  { country: "United States", prefix: "+1" },
  { country: "Other", prefix: "" },
] as const;

export const PHONE_PREFIX_BY_COUNTRY: Record<string, string> = Object.fromEntries(
  PHONE_COUNTRY_OPTIONS.map((o) => [o.country, o.prefix || "+"])
);

export const ENGINEERING_DISCIPLINES = [
  "Software / IT",
  "Mechanical",
  "Civil",
  "Electrical",
  "Chemical",
  "Industrial",
  "Environmental",
  "Other",
] as const;

export const JOB_EXPERIENCE_LEVELS: { value: string; label: string; track: Track }[] = [
  { value: "0-12 months", label: "0 – 12 months", track: "entry" },
  { value: "1-3 years", label: "1 – 3 years", track: "fast" },
  { value: "3-5 years", label: "3 – 5 years", track: "fast" },
  { value: "5+ years", label: "5+ years", track: "fast" },
];

export const START_WINDOW_OPTIONS = [
  { value: "3-6 months", label: "3 – 6 months" },
  { value: "6-12 months", label: "6 – 12 months" },
] as const;

export const WORKPLACE_LANGUAGE_OPTIONS = [
  { value: "not_required", label: "Not required (English-only workplace)" },
  { value: "basic", label: "Basic (occasional use)" },
  { value: "intermediate", label: "Intermediate (regular use)" },
  { value: "fluent", label: "Fluent (primary work language)" },
] as const;

export const HEARD_ABOUT_OPTIONS = [
  "LinkedIn",
  "Referral",
  "Search engine",
  "Industry event",
  "Partner / university",
  "Other",
] as const;

const POSTAL_COUNTRY_CODES: Record<string, string> = {
  Norway: "no",
  Sweden: "se",
  Denmark: "dk",
  Finland: "fi",
  Iceland: "is",
  Germany: "de",
};

export async function lookupPostalLocation(country: string, postalCode: string): Promise<string | null> {
  const code = postalCode.replace(/\s/g, "").trim();
  if (!code || code.length < 3) return null;

  const cc = POSTAL_COUNTRY_CODES[country];
  if (!cc) return null;

  try {
    const res = await fetch(`https://api.zippopotam.us/${cc}/${encodeURIComponent(code)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      places?: Array<{ "place name"?: string; "state abbreviation"?: string; state?: string }>;
    };
    const place = data.places?.[0];
    if (!place) return null;
    const city = place["place name"]?.trim();
    const region = (place["state abbreviation"] ?? place.state)?.trim();
    const parts = [city, region, country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

export function deriveTrackFromJobExperience(experienceLevel: string): Track | null {
  const match = JOB_EXPERIENCE_LEVELS.find((o) => o.value === experienceLevel);
  return match?.track ?? null;
}

export function normalizeContactPhone(country: string, phone: string): string {
  const prefix = PHONE_PREFIX_BY_COUNTRY[country] ?? "+";
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (phone.trim().startsWith("+")) return phone.trim();
  if (prefix === "+") return phone.trim();
  const prefixDigits = prefix.replace(/\D/g, "");
  if (digits.startsWith(prefixDigits)) return `+${digits}`;
  return `${prefix}${digits}`;
}

export function parseContactPhone(storedPhone: string | null | undefined): {
  country: string;
  local: string;
} {
  if (!storedPhone?.trim()) return { country: "Norway", local: "" };

  const byPrefix = [...PHONE_COUNTRY_OPTIONS]
    .filter((o) => o.prefix)
    .sort((a, b) => b.prefix.length - a.prefix.length);

  const digits = storedPhone.replace(/\D/g, "");
  for (const opt of byPrefix) {
    const prefixDigits = opt.prefix.replace(/\D/g, "");
    if (digits.startsWith(prefixDigits)) {
      return { country: opt.country, local: digits.slice(prefixDigits.length) };
    }
  }

  if (storedPhone.trim().startsWith("+")) {
    return { country: "Other", local: storedPhone.replace(/^\+\d+\s*/, "").trim() };
  }

  return { country: "Norway", local: storedPhone.trim() };
}

export function displayContactPhone(_country: string, phone: string | null | undefined): string {
  return parseContactPhone(phone).local;
}
