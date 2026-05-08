// Shared Entry Track / Fast Track helpers and persistent client store.
// Prototype only — no backend.
import { useSyncExternalStore } from "react";

export type Track = "entry" | "fast";

export const TRACK_META: Record<Track, { label: string; short: string; stages: string[] }> = {
  entry: {
    label: "Entry Track",
    short: "12-month program · 0–12 months experience",
    stages: ["preparation", "selection", "readiness", "activation", "relocation", "onboarding", "followup"],
  },
  fast: {
    label: "Fast Track",
    short: "Accelerated · 1+ years experience",
    stages: ["readiness", "activation", "relocation", "onboarding", "followup"],
  },
};

export const isStageInTrack = (stageId: string, track: Track) =>
  TRACK_META[track].stages.includes(stageId);

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
  const track = useSyncExternalStore(subscribe, getSnapshot, () => "entry" as Track);
  return [track, setTrack];
};
