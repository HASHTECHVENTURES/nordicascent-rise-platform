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

/** Map application.status onto the company Candidates pipeline tabs. */
const STATUS_TO_PIPELINE_STAGE: Record<string, string> = {
  applied: "preparation",
  application_complete: "preparation",
  reviewing: "preparation",
  interview: "preparation",
  offer: "preparation",
  rejected: "preparation",
  accepted: "selection",
  eligibility_review: "selection",
  eligibility_pass: "selection",
  offee_review: "selection",
  offee_pass: "selection",
  step3_review: "selection",
  step3_pass: "selection",
  step4_review: "selection",
  step4_pass: "selection",
  selected_for_readiness: "selection",
  selection_hold: "selection",
  selection_rejected: "selection",
  mentor_assigned: "readiness",
  readiness_active: "readiness",
  readiness_complete: "readiness",
  internship: "activation",
  go_no_go: "activation",
  pre_arrival: "activation",
  relocation: "relocation",
  onboarding: "onboarding",
  followup: "followup",
  journey_complete: "followup",
};

/** Pipeline tab for an application. Status wins over a stale/null stage_id. */
export function pipelineStageFromApplication(app: {
  status?: string | null;
  stage_id?: string | null;
}): string {
  const fromStatus = app.status ? STATUS_TO_PIPELINE_STAGE[app.status] : undefined;
  if (fromStatus) return fromStatus;
  return normalizePipelineStageId(app.stage_id);
}

/** Task pages may still use legacy stage ids (e.g. internship tasks inside Activation). */
export function programStageLabel(stageId: string): string {
  if (stageId === "internship") return "Internship";
  if (stageId === "mentoring") return "Mentoring";
  return PIPELINE_STAGES.find((s) => s.id === stageId)?.name ?? stageId;
}

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
