import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Info,
  ClipboardCheck,
  UserCheck,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building2,
  Users,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

const pipelineStages = [
  { id: 0, name: "My Journey", status: "info", href: "/candidate/dashboard", icon: Info, description: "Overview of your complete candidate journey and progress" },
  { id: 1, name: "Preparation", status: "completed", href: "/candidate/preparation", icon: ClipboardCheck, description: "Document collection, CV review, and initial assessments" },
  { id: 2, name: "Selection", status: "completed", href: "/candidate/selection", icon: UserCheck, description: "Interview process and employer matching" },
  { id: 3, name: "Readiness", status: "active", href: "/candidate/readiness", icon: CheckCircle2, description: "Skills assessment and pre-departure preparation" },
  { id: 4, name: "Internship", status: "not_started", href: "/candidate/internship", icon: Briefcase, description: "On-the-job training and workplace integration" },
  { id: 5, name: "Relocation", status: "not_started", href: "/candidate/relocation", icon: MapPin, description: "Language courses, cultural integration, and settling in" },
  { id: 6, name: "Onboarding", status: "not_started", href: "/candidate/onboarding", icon: Building2, description: "Final workplace onboarding and long-term setup" },
  { id: 7, name: "Follow-up", status: "not_started", href: "/candidate/followup", icon: Users, description: "Ongoing support and career development check-ins" },
];

const PipelineProgress = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePopover, setActivePopover] = useState<number | null>(null);

  return (
    <div className="bg-card border-b px-6 py-4 relative z-20">
      <div className="flex items-center justify-between overflow-x-auto">
        {pipelineStages.map((stage, index) => {
          const isCurrentPage = location.pathname === stage.href;
          return (
            <div key={stage.id} className="flex items-center">
              <Popover
                open={activePopover === stage.id}
                onOpenChange={(open) => setActivePopover(open ? stage.id : null)}
              >
                <PopoverTrigger asChild>
                  <button className="flex flex-col items-center min-w-[80px] group cursor-pointer">
                    {stage.status === 'info' ? (
                      <div className={`relative w-12 h-12 mb-1 flex items-center justify-center ${isCurrentPage ? 'ring-2 ring-offset-2 ring-primary rounded-full' : ''}`}>
                        <div className="absolute inset-0 rounded-full border-[3px] border-primary/30" />
                        <div className="absolute inset-1 rounded-full border-2 border-primary/50" />
                        <div className="w-8 h-8 rounded-full bg-primary/15 border-2 border-primary text-primary flex items-center justify-center">
                          <stage.icon className="h-4 w-4" />
                        </div>
                      </div>
                    ) : (
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 mb-1
                        ${stage.status === 'completed' ? 'bg-success border-success text-success-foreground' : ''}
                        ${stage.status === 'active' ? 'bg-primary border-primary text-primary-foreground' : ''}
                        ${stage.status === 'not_started' ? 'bg-muted border-muted-foreground/30 text-muted-foreground' : ''}
                        ${isCurrentPage ? 'ring-2 ring-offset-2 ring-primary' : ''}
                        group-hover:opacity-80 transition-opacity
                      `}>
                        <stage.icon className="h-4 w-4" />
                      </div>
                    )}
                    <span className={`text-xs font-medium text-center ${
                      isCurrentPage ? 'text-primary' : stage.status === 'active' ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {stage.name}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-4" side="bottom" align="center">
                  <div className="flex items-center gap-2 mb-2">
                    <stage.icon className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-sm">{stage.name}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{stage.description}</p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setActivePopover(null);
                      navigate(stage.href);
                    }}
                  >
                    Open {stage.name}
                  </Button>
                </PopoverContent>
              </Popover>
              {index < pipelineStages.length - 1 && (
                <div className={`w-6 h-0.5 mx-1 ${
                  stage.status === 'completed' ? 'bg-success' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineProgress;
