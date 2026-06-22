export type InstitutionType = "university" | "institute";

export type University = {
  id: string;
  name: string;
  institution_type: InstitutionType;
  country: string;
  is_accessible?: boolean;
};

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  university: "Universities",
  institute: "Institutes & study programs",
};

/** Fallback list when DB seed is unavailable (local dev). */
export const UNIVERSITY_SEED: University[] = [
  { id: "seed-mu", name: "University of Mumbai", institution_type: "university", country: "India" },
  { id: "seed-sppu", name: "Savitribai Phule Pune University", institution_type: "university", country: "India" },
  { id: "seed-du", name: "University of Delhi", institution_type: "university", country: "India" },
  { id: "seed-iitb", name: "IIT Bombay", institution_type: "university", country: "India" },
  { id: "seed-vit", name: "Vellore Institute of Technology (VIT)", institution_type: "university", country: "India" },
  { id: "seed-bits", name: "BITS Pilani", institution_type: "university", country: "India" },
  { id: "seed-vit-mum", name: "Vidyalankar Institute of Technology", institution_type: "institute", country: "India" },
  { id: "seed-tsec", name: "Thadomal Shahani Engineering College", institution_type: "institute", country: "India" },
  { id: "seed-udacity", name: "Udacity", institution_type: "institute", country: "Global" },
];

export function filterUniversities(
  list: University[],
  query: string,
  institutionType?: InstitutionType
) {
  const q = query.trim().toLowerCase();
  return list
    .filter((u) => !institutionType || u.institution_type === institutionType)
    .filter((u) => !q || u.name.toLowerCase().includes(q));
}
