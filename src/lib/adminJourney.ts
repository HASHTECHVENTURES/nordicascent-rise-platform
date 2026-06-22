import type { LucideIcon } from "lucide-react";
import { GraduationCap, ClipboardCheck, Heart, Briefcase } from "lucide-react";

export type AdminJourneyStep = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

/** Admin workflow mirrors candidate journey: Prep → Readiness → Mentoring → Jobs */
export const ADMIN_JOURNEY_STEPS: AdminJourneyStep[] = [
  {
    id: "universities",
    label: "Universities",
    href: "/admin/universities",
    icon: GraduationCap,
    match: (p) => p.startsWith("/admin/universities"),
  },
  {
    id: "readiness",
    label: "Readiness",
    href: "/admin/readiness",
    icon: ClipboardCheck,
    match: (p) => p.startsWith("/admin/readiness"),
  },
  {
    id: "mentoring",
    label: "Mentoring",
    href: "/admin/mentoring",
    icon: Heart,
    match: (p) => p.startsWith("/admin/mentoring"),
  },
  {
    id: "jobs",
    label: "Jobs",
    href: "/admin/jobs",
    icon: Briefcase,
    match: (p) => p.startsWith("/admin/jobs"),
  },
];

export type AdminCandidateJourneyStage =
  | "preparation"
  | "readiness"
  | "mentoring"
  | "jobs";

export function adminJourneyStageLabel(stage: AdminCandidateJourneyStage) {
  switch (stage) {
    case "preparation":
      return "Preparation";
    case "readiness":
      return "Readiness";
    case "mentoring":
      return "Mentoring";
    case "jobs":
      return "Jobs open";
  }
}

export function inferCandidateJourneyStage(input: {
  universityId: string | null;
  jobsUnlocked: boolean;
  testsSubmitted: number;
  testsTotal: number;
}): AdminCandidateJourneyStage {
  const { universityId, jobsUnlocked, testsSubmitted, testsTotal } = input;
  if (jobsUnlocked) return "jobs";
  if (testsTotal > 0 && testsSubmitted >= testsTotal) return "mentoring";
  if (universityId) return "readiness";
  return "preparation";
}
