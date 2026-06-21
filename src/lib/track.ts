// Shared Entry Track / Fast Track helpers.
// Reads track from Supabase auth context when available; falls back to localStorage for guests.
import { useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type Track = "entry" | "fast";

export const TRACK_META: Record<Track, { label: string; short: string; stages: string[] }> = {
  entry: {
    label: "Entry Track",
    short: "12-month program · 0–12 months experience",
    stages: ["preparation", "selection", "readiness", "internship", "activation", "relocation", "onboarding", "followup"],
  },
  fast: {
    label: "Fast Track",
    short: "Accelerated · 1+ years experience",
    stages: ["readiness", "internship", "activation", "relocation", "onboarding", "followup"],
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
