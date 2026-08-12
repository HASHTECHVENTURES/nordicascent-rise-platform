import {
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building2,
  Users,
  type LucideIcon,
} from "lucide-react";

export const PIPELINE_STAGES: Array<{
  id: string;
  name: string;
  href: string;
  employerHref: string;
  icon: LucideIcon;
  color: string;
}> = [
  {
    id: "preparation",
    name: "Preparation",
    href: "/candidate/preparation",
    employerHref: "/employer/candidates?stage=preparation",
    icon: ClipboardCheck,
    color: "text-secondary",
  },
  {
    id: "selection",
    name: "Selection",
    href: "/candidate/selection",
    employerHref: "/employer/selection",
    icon: UserCheck,
    color: "text-primary",
  },
  {
    id: "readiness",
    name: "Readiness",
    href: "/candidate/readiness",
    employerHref: "/employer/mentoring",
    icon: CheckCircle2,
    color: "text-warning",
  },
  {
    id: "activation",
    name: "Activation",
    href: "/candidate/activation",
    employerHref: "/employer/activation",
    icon: Briefcase,
    color: "text-primary",
  },
  {
    id: "relocation",
    name: "Relocation",
    href: "/candidate/relocation",
    employerHref: "/employer/relocation",
    icon: MapPin,
    color: "text-secondary",
  },
  {
    id: "onboarding",
    name: "Onboarding",
    href: "/candidate/onboarding",
    employerHref: "/employer/onboarding",
    icon: Building2,
    color: "text-success",
  },
  {
    id: "followup",
    name: "Follow-up",
    href: "/candidate/followup",
    employerHref: "/employer/followup",
    icon: Users,
    color: "text-muted-foreground",
  },
];

/** Mentoring + legacy internship ids fold into journey stages for pipeline display. */
export function normalizePipelineStageId(stageId: string | null | undefined): string {
  if (!stageId) return "preparation";
  if (stageId === "mentoring") return "readiness";
  if (stageId === "internship") return "activation";
  return stageId;
}

/** Task pages may still use legacy stage ids (e.g. internship tasks inside Activation). */
export function stageDisplayMeta(stageId: string) {
  const normalized = normalizePipelineStageId(stageId);
  const fromPipeline = PIPELINE_STAGES.find((s) => s.id === normalized);
  if (fromPipeline) return fromPipeline;
  if (stageId === "internship") {
    return {
      id: "internship",
      name: "Internship",
      href: "/candidate/internship",
      employerHref: "/employer/activation",
      icon: Briefcase,
      color: "text-primary",
    };
  }
  return undefined;
}

export const stageIcon = (stageId: string) =>
  stageDisplayMeta(stageId)?.icon ??
  PIPELINE_STAGES.find((s) => s.id === normalizePipelineStageId(stageId))?.icon ??
  ClipboardCheck;
