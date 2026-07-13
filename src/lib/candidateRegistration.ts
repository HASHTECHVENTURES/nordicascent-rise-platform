import type { Candidate, Profile } from "@/types/database";
import type { Track } from "@/lib/track";

export const DEGREE_TYPES = ["BSc", "MSc", "PhD", "BE", "BTech", "Diploma", "Other"] as const;

export const CANDIDATE_EXPERIENCE_OPTIONS: { value: string; label: string; track: Track }[] = [
  { value: "final-year-student", label: "Final year student", track: "entry" },
  { value: "0-12 months", label: "0 – 12 months", track: "entry" },
  { value: "1-3 years", label: "1 – 3 years", track: "fast" },
  { value: "3-5 years", label: "3 – 5 years", track: "fast" },
  { value: "5+ years", label: "5+ years", track: "fast" },
];

export function normalizeRegistrationExperience(experience: string | null | undefined): string {
  const text = experience?.trim() ?? "";
  if (!text) return "";

  const direct = CANDIDATE_EXPERIENCE_OPTIONS.find(
    (o) => o.value.toLowerCase() === text.toLowerCase() || o.label.toLowerCase() === text.toLowerCase()
  );
  if (direct) return direct.value;

  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .replace(/–/g, "-");

  const fuzzy = CANDIDATE_EXPERIENCE_OPTIONS.find((o) => o.value.toLowerCase() === normalized.toLowerCase());
  if (fuzzy) return fuzzy.value;

  if (/fresher|graduate|intern|no experience|0/.test(text.toLowerCase()) || /month/i.test(text)) {
    return "0-12 months";
  }
  if (/final\s*year|student/i.test(text)) return "final-year-student";
  if (/5\+|5\s*\+|6\+/.test(text)) return "5+ years";
  const years = text.match(/(\d+)/);
  if (years) {
    const n = parseInt(years[1], 10);
    if (n >= 5) return "5+ years";
    if (n >= 3) return "3-5 years";
    if (n >= 1) return "1-3 years";
  }
  return "";
}

export const NORDICS_MOTIVATION_MAX_WORDS = 500;

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export type Step1Form = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  title: string;
  experience: string;
  field_of_study: string;
  degree_type: string;
  linkedin_url: string;
  bio: string;
  skills: string[];
};

export type Step1FieldKey =
  | "full_name"
  | "email"
  | "phone"
  | "country"
  | "state"
  | "city"
  | "title"
  | "experience"
  | "field_of_study"
  | "degree_type"
  | "linkedin_url"
  | "skills"
  | "cv"
  | "avatar";

const STEP1_LABELS: Record<Step1FieldKey, string> = {
  full_name: "Full name",
  email: "Email",
  phone: "Phone number",
  country: "Country",
  state: "State",
  city: "City",
  title: "Professional title",
  experience: "Experience",
  field_of_study: "Field of study",
  degree_type: "Degree type",
  linkedin_url: "LinkedIn URL",
  skills: "At least one skill",
  cv: "CV upload",
  avatar: "Profile photo",
};

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function getMissingStep1Fields(
  form: Step1Form,
  opts: { phoneNormalized: string; hasCv: boolean; hasAvatar: boolean }
) {
  const missing: { key: Step1FieldKey; label: string }[] = [];
  const check = (key: Step1FieldKey, ok: boolean) => {
    if (!ok) missing.push({ key, label: STEP1_LABELS[key] });
  };

  check("full_name", hasValue(form.full_name));
  check("email", hasValue(form.email));
  check("phone", hasValue(opts.phoneNormalized));
  check("country", hasValue(form.country));
  check("state", hasValue(form.state));
  check("city", hasValue(form.city));
  check("title", hasValue(form.title));
  check("experience", hasValue(form.experience));
  check("field_of_study", hasValue(form.field_of_study));
  check("degree_type", hasValue(form.degree_type));
  check("linkedin_url", hasValue(form.linkedin_url));
  check("skills", form.skills.length > 0);
  check("cv", opts.hasCv);
  check("avatar", opts.hasAvatar);

  return missing;
}

export function isStep1Complete(
  form: Step1Form,
  opts: { phoneNormalized: string; hasCv: boolean; hasAvatar: boolean }
) {
  return getMissingStep1Fields(form, opts).length === 0;
}

export type Step3Form = {
  gpa_or_standing: string;
  nordics_motivation: string;
  expected_graduation_date: string;
  graduation_year: string;
  current_employer: string;
  current_role_title: string;
};

export function getMissingStep3Fields(track: Track, form: Step3Form) {
  const missing: { key: string; label: string }[] = [];
  if (!hasValue(form.gpa_or_standing)) {
    missing.push({ key: "gpa_or_standing", label: "GPA or academic standing" });
  }
  if (!hasValue(form.nordics_motivation)) {
    missing.push({ key: "nordics_motivation", label: "Why work in the Nordics" });
  } else if (countWords(form.nordics_motivation) > NORDICS_MOTIVATION_MAX_WORDS) {
    missing.push({ key: "nordics_motivation", label: "Motivation (max 500 words)" });
  }
  if (track === "entry") {
    if (!hasValue(form.expected_graduation_date)) {
      missing.push({ key: "expected_graduation_date", label: "Expected graduation date" });
    }
  } else {
    if (!hasValue(form.graduation_year)) {
      missing.push({ key: "graduation_year", label: "Graduation year" });
    }
    if (!hasValue(form.current_employer)) {
      missing.push({ key: "current_employer", label: "Current employer" });
    }
    if (!hasValue(form.current_role_title)) {
      missing.push({ key: "current_role_title", label: "Job role title" });
    }
  }
  return missing;
}

export function isStep3Complete(track: Track, form: Step3Form) {
  return getMissingStep3Fields(track, form).length === 0;
}

export function isRegistrationDetailsComplete(candidate: Candidate | null | undefined) {
  if (!candidate) return false;
  const track = (candidate.track ?? "entry") as Track;
  return isStep3Complete(track, {
    gpa_or_standing: candidate.gpa_or_standing ?? "",
    nordics_motivation: candidate.nordics_motivation ?? "",
    expected_graduation_date: candidate.expected_graduation_date ?? "",
    graduation_year: candidate.graduation_year ?? "",
    current_employer: candidate.current_employer ?? "",
    current_role_title: candidate.current_role_title ?? "",
  });
}

export function step1FormFromAuth(profile: Profile | null, candidate: Candidate | null | undefined): Step1Form {
  const degree = candidate?.degree_type?.trim() ?? "";
  const validDegree = DEGREE_TYPES.includes(degree as (typeof DEGREE_TYPES)[number]) ? degree : "";
  return {
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? "",
    phone: profile?.phone ?? "",
    country: candidate?.country?.trim() || "India",
    state: candidate?.state ?? "",
    city: candidate?.city ?? candidate?.location ?? "",
    title: candidate?.title ?? "",
    experience: normalizeRegistrationExperience(candidate?.experience),
    field_of_study: candidate?.field_of_study ?? candidate?.education ?? "",
    degree_type: validDegree,
    linkedin_url: candidate?.linkedin_url ?? "",
    bio: candidate?.bio ?? "",
    skills: candidate?.skills ?? [],
  };
}

export function step3FormFromCandidate(candidate: Candidate | null | undefined): Step3Form {
  return {
    gpa_or_standing: candidate?.gpa_or_standing ?? "",
    nordics_motivation: candidate?.nordics_motivation ?? "",
    expected_graduation_date: candidate?.expected_graduation_date ?? "",
    graduation_year: candidate?.graduation_year ?? "",
    current_employer: candidate?.current_employer ?? "",
    current_role_title: candidate?.current_role_title ?? "",
  };
}
