import {
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Heart,
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
  { id: "mentoring", name: "Mentoring", href: "/candidate/mentoring", icon: Heart, color: "text-primary" },
  { id: "internship", name: "Internship", href: "/candidate/internship", icon: Briefcase, color: "text-primary" },
  { id: "activation", name: "Activation", href: "/candidate/activation", icon: FileCheck, color: "text-primary" },
  { id: "relocation", name: "Relocation", href: "/candidate/relocation", icon: MapPin, color: "text-secondary" },
  { id: "onboarding", name: "Onboarding", href: "/candidate/onboarding", icon: Building2, color: "text-success" },
  { id: "followup", name: "Follow-up", href: "/candidate/followup", icon: Users, color: "text-muted-foreground" },
];

export const stageIcon = (stageId: string) =>
  PIPELINE_STAGES.find((s) => s.id === stageId)?.icon ?? ClipboardCheck;
