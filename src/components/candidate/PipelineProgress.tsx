import { Link, useLocation } from "react-router-dom";
import {
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building2,
  Users,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useTrack, isStageInTrack, TRACK_META } from "@/lib/track";
import { cn } from "@/lib/utils";

const pipelineStages = [
  { id: "preparation", name: "Preparation", status: "completed", href: "/candidate/preparation", icon: ClipboardCheck, description: "Document collection, CV review, and initial assessments" },
  { id: "selection", name: "Selection", status: "completed", href: "/candidate/selection", icon: UserCheck, description: "Interview process and employer matching" },
  { id: "readiness", name: "Readiness", status: "active", href: "/candidate/readiness", icon: CheckCircle2, description: "Skills assessment and pre-departure preparation" },
  { id: "activation", name: "Activation", status: "not_started", href: "/candidate/internship", icon: Briefcase, description: "Activation – Internship (6–10 weeks) or Pre-Employment" },
  { id: "relocation", name: "Relocation", status: "not_started", href: "/candidate/relocation", icon: MapPin, description: "Language courses, cultural integration, and settling in" },
  { id: "onboarding", name: "Onboarding", status: "not_started", href: "/candidate/onboarding", icon: Building2, description: "Final workplace onboarding and long-term setup" },
  { id: "followup", name: "Follow-up", status: "not_started", href: "/candidate/followup", icon: Users, description: "Ongoing support and career development check-ins" },
];

const PipelineProgress = () => {
  const location = useLocation();
  const [track] = useTrack();

  return (
    <div className="bg-card border-b px-6 py-4 relative z-20 overflow-visible">
      <div className="flex items-center gap-4 overflow-visible">
        <Badge
          variant="outline"
          className="border-primary/40 text-primary font-medium shrink-0"
          title={TRACK_META[track].short}
        >
          {TRACK_META[track].label}
        </Badge>
        <div className="flex items-center justify-between flex-1 overflow-visible">
          {pipelineStages.map((stage, index) => {
            const isCurrentPage = location.pathname === stage.href;
            const inTrack = isStageInTrack(stage.id, track);
            return (
              <div key={stage.id} className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    {inTrack ? (
                      <Link to={stage.href} className="flex flex-col items-center min-w-[80px] group">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1 transition-opacity group-hover:opacity-80",
                            stage.status === "completed" && "bg-success border-success text-success-foreground",
                            stage.status === "active" && "bg-primary border-primary text-primary-foreground",
                            stage.status === "not_started" && "bg-muted border-muted-foreground/30 text-muted-foreground",
                            isCurrentPage && "ring-2 ring-offset-2 ring-primary",
                          )}
                        >
                          <stage.icon className="h-4 w-4" />
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium text-center",
                            isCurrentPage || stage.status === "active" ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {stage.name}
                        </span>
                      </Link>
                    ) : (
                      <div
                        className="flex flex-col items-center min-w-[80px] opacity-40 cursor-not-allowed select-none"
                        aria-disabled
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30 text-muted-foreground mb-1">
                          <stage.icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-medium text-center text-muted-foreground line-through">
                          {stage.name}
                        </span>
                      </div>
                    )}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{inTrack ? stage.description : `Not part of ${TRACK_META[track].label}`}</p>
                  </TooltipContent>
                </Tooltip>
                {index < pipelineStages.length - 1 && (
                  <div
                    className={cn(
                      "w-6 h-0.5 mx-1",
                      inTrack && stage.status === "completed" ? "bg-success" : "bg-muted",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PipelineProgress;
