import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  ClipboardCheck,
  Heart,
  ClipboardList,
  Rocket,
  MapPin,
  Building2,
} from "lucide-react";

export type AdminJourneyStep = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

/** Admin workflow mirrors candidate journey: Universities → Selection → Readiness → … */
export const ADMIN_JOURNEY_STEPS: AdminJourneyStep[] = [
  {
    id: "universities",
    label: "Universities",
    href: "/admin/universities",
    icon: GraduationCap,
    match: (p) => p.startsWith("/admin/universities"),
  },
  {
    id: "selection",
    label: "Selection",
    href: "/admin/selection",
    icon: ClipboardList,
    match: (p) => p.startsWith("/admin/selection"),
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
    id: "activation",
    label: "Activation",
    href: "/admin/activation",
    icon: Rocket,
    match: (p) => p.startsWith("/admin/activation"),
  },
  {
    id: "relocation",
    label: "Relocation",
    href: "/admin/relocation",
    icon: MapPin,
    match: (p) => p.startsWith("/admin/relocation"),
  },
  {
    id: "onboarding",
    label: "Onboarding",
    href: "/admin/onboarding",
    icon: Building2,
    match: (p) => p.startsWith("/admin/onboarding"),
  },
];

export type AdminCandidateJourneyStage =
  | "preparation"
  | "selection"
  | "readiness"
  | "mentoring"
  | "activation";

export function adminJourneyStageLabel(stage: AdminCandidateJourneyStage) {
  switch (stage) {
    case "preparation":
      return "Preparation";
    case "selection":
      return "Selection";
    case "readiness":
      return "Readiness";
    case "mentoring":
      return "Mentoring";
    case "activation":
      return "Activation";
  }
}

export function inferCandidateJourneyStage(input: {
  universityId: string | null;
  jobsUnlocked: boolean;
  testsSubmitted: number;
  testsTotal: number;
}): AdminCandidateJourneyStage {
  const { universityId, jobsUnlocked, testsSubmitted, testsTotal } = input;
  if (!universityId) return "preparation";
  if (jobsUnlocked) return "activation";
  if (testsTotal > 0 && testsSubmitted >= testsTotal) return "mentoring";
  if (testsSubmitted > 0) return "readiness";
  return "selection";
}
