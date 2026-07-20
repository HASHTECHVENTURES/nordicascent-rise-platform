import {
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Briefcase,
  FileCheck,
  MapPin,
  Building2,
  Users,
  type LucideIcon,
} from "lucide-react";

export const PIPELINE_STAGES: Array<{
  id: string;
  name: string;
  href: string;
  icon: LucideIcon;
  color: string;
}> = [
  { id: "preparation", name: "Preparation", href: "/candidate/preparation", icon: ClipboardCheck, color: "text-secondary" },
  { id: "selection", name: "Selection", href: "/candidate/selection", icon: UserCheck, color: "text-primary" },
  { id: "readiness", name: "Readiness", href: "/candidate/readiness", icon: CheckCircle2, color: "text-warning" },
  { id: "internship", name: "Internship", href: "/candidate/activation", icon: Briefcase, color: "text-primary" },
  {
    id: "activation",
    name: "Pre Arrival Employment",
    href: "/candidate/activation",
    icon: FileCheck,
    color: "text-primary",
  },
  { id: "relocation", name: "Relocation", href: "/candidate/relocation", icon: MapPin, color: "text-secondary" },
  { id: "onboarding", name: "Onboarding", href: "/candidate/onboarding", icon: Building2, color: "text-success" },
  { id: "followup", name: "Follow-up", href: "/candidate/followup", icon: Users, color: "text-muted-foreground" },
];

/** Mentoring is parallel inside Readiness/Activation — fold legacy stage ids into Readiness. */
export function normalizePipelineStageId(stageId: string | null | undefined): string {
  if (!stageId) return "preparation";
  if (stageId === "mentoring") return "readiness";
  return stageId;
}

export const stageIcon = (stageId: string) =>
  PIPELINE_STAGES.find((s) => s.id === stageId)?.icon ?? ClipboardCheck;
