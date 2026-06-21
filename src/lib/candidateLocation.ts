export const DEFAULT_COUNTRY = "India";

export const COUNTRIES = [
  "India",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Iceland",
  "Germany",
  "Other",
] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
] as const;

export function formatCandidateLocation(candidate: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  location?: string | null;
}) {
  const parts = [candidate.city, candidate.state, candidate.country].map((p) => p?.trim()).filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return candidate.location?.trim() ?? "";
}

export function normalizeIndiaPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length >= 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return phone.trim();
}

export function displayIndiaPhone(phone: string | null | undefined) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length >= 12) return digits.slice(2);
  return phone.replace(/^\+91/, "").trim();
}
