// Shared Entry Track / Fast Track helpers.
// Reads track from Supabase auth context when available; falls back to localStorage for guests.
import { useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type Track = "entry" | "fast";

export const TRACK_META: Record<Track, { label: string; short: string; stages: string[] }> = {
  entry: {
    label: "Entry Track",
    short: "12-month program · 0–12 months experience",
    stages: ["preparation", "selection", "readiness", "mentoring", "internship", "activation", "relocation", "onboarding", "followup"],
  },
  fast: {
    label: "Fast Track",
    short: "Accelerated · 1+ years experience · no internship",
    stages: ["preparation", "selection", "readiness", "mentoring", "activation", "relocation", "onboarding", "followup"],
  },
};

export const isStageInTrack = (stageId: string, track: Track) =>
  TRACK_META[track].stages.includes(stageId);

export const getNextStageInTrack = (stageId: string, track: Track): string | null => {
  const stages = TRACK_META[track].stages;
  const idx = stages.indexOf(stageId);
  if (idx < 0 || idx >= stages.length - 1) return null;
  return stages[idx + 1];
};

const ALL_PIPELINE_STAGE_IDS = [
  "preparation",
  "selection",
  "readiness",
  "mentoring",
  "internship",
  "activation",
  "relocation",
  "onboarding",
  "followup",
] as const;

/** Where to send a candidate when they open a stage that is not in their track. */
export function getContinueStageForExcluded(stageId: string, track: Track): string {
  const trackStages = TRACK_META[track].stages;
  const idx = ALL_PIPELINE_STAGE_IDS.indexOf(stageId as (typeof ALL_PIPELINE_STAGE_IDS)[number]);
  if (idx >= 0) {
    for (let i = idx + 1; i < ALL_PIPELINE_STAGE_IDS.length; i++) {
      if (trackStages.includes(ALL_PIPELINE_STAGE_IDS[i])) return ALL_PIPELINE_STAGE_IDS[i];
    }
  }
  return trackStages[0];
}

export const EXPERIENCE_OPTIONS: { value: string; label: string; track: Track }[] = [
  { value: "0-12 months", label: "0 – 12 months", track: "entry" },
  { value: "1-3 years", label: "1 – 3 years", track: "fast" },
  { value: "3-5 years", label: "3 – 5 years", track: "fast" },
  { value: "5+ years", label: "5+ years", track: "fast" },
  { value: "Fresher", label: "Fresher (legacy)", track: "entry" },
  { value: "12 months", label: "12 months (legacy)", track: "entry" },
  { value: "1 year", label: "1 year (legacy)", track: "fast" },
  { value: "2 years", label: "2 years (legacy)", track: "fast" },
  { value: "3 years", label: "3 years (legacy)", track: "fast" },
  { value: "4 years", label: "4 years (legacy)", track: "fast" },
  { value: "5 years", label: "5 years (legacy)", track: "fast" },
  { value: "6+ years", label: "6+ years (legacy)", track: "fast" },
];

/** Map free-text experience to Entry (0–12 mo) or Fast (1+ yr). Returns null if unclear. */
export function deriveTrackFromExperience(experience: string): Track | null {
  const text = experience.trim().toLowerCase();
  if (!text) return null;

  const preset = EXPERIENCE_OPTIONS.find((o) => o.value.toLowerCase() === text);
  if (preset) return preset.track;

  if (/\b(fresher|graduate|intern|no experience|none|zero)\b/.test(text)) {
    return "entry";
  }

  const yearMatch = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:year|yr|years|yrs)\b/);
  if (yearMatch) {
    const years = parseFloat(yearMatch[1]);
    if (text.includes("+") && years >= 6) return "fast";
    return years >= 1 ? "fast" : "entry";
  }

  if (/\b6\s*\+?\s*(?:year|yr|years|yrs)?\b/.test(text) || text === "6+ years") {
    return "fast";
  }

  if (/^1\s*\+/.test(text) || /\b1\s*\+\s*(?:year|yr)?\b/.test(text)) {
    return "fast";
  }

  const monthMatch = text.match(/(\d+)\s*(?:month|months|mo)\b/);
  if (monthMatch) {
    return parseInt(monthMatch[1], 10) >= 12 ? "fast" : "entry";
  }

  // Bare number like "1" or "2" — treat as years of experience
  if (/^\d+(?:\.\d+)?$/.test(text)) {
    return parseFloat(text) >= 1 ? "fast" : "entry";
  }

  return null;
}

/** Normalize legacy free-text values to a select option when possible. */
export function normalizeExperienceValue(experience: string | null | undefined): string {
  const text = experience?.trim() ?? "";
  if (!text) return "";

  if (text.toLowerCase() === "2+ years") return "1-3 years";
  if (text.toLowerCase() === "6 months") return "0-12 months";

  const preset = EXPERIENCE_OPTIONS.find((o) => o.value.toLowerCase() === text.toLowerCase());
  if (preset) return preset.value;

  const derived = deriveTrackFromExperience(text);
  if (derived === "fast") {
    if (text.toLowerCase().includes("6+") || text.toLowerCase().includes("5+")) return "5+ years";
    const years = text.match(/(\d+(?:\.\d+)?)/);
    if (years) {
      const n = parseFloat(years[1]);
      if (n >= 5) return "5+ years";
      if (n >= 3) return "3-5 years";
      return "1-3 years";
    }
    return "1-3 years";
  }
  if (derived === "entry") {
    return "0-12 months";
  }

  return text;
}

const STORAGE_KEY = "na.candidateTrack";

const isTrack = (v: unknown): v is Track => v === "entry" || v === "fast";

const getSnapshot = (): Track => {
  if (typeof window === "undefined") return "entry";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return isTrack(v) ? v : "entry";
};

const subscribe = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) cb();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("na-track-change", cb);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("na-track-change", cb);
  };
};

export const setTrack = (t: Track) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, t);
  window.dispatchEvent(new Event("na-track-change"));
};

export const getTrack = getSnapshot;

export const useTrack = (): [Track, (t: Track) => void] => {
  const { candidate } = useAuth();
  const localTrack = useSyncExternalStore(subscribe, getSnapshot, () => "entry" as Track);
  const track = (candidate?.track as Track) ?? localTrack;
  return [track, setTrack];
};
