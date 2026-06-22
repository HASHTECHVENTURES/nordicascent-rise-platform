import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ADMIN_JOURNEY_STEPS } from "@/lib/adminJourney";

export default function AdminJourneyProgress() {
  const { pathname } = useLocation();
  const activeIdx = ADMIN_JOURNEY_STEPS.findIndex((s) => s.match(pathname));

  return (
    <div className="bg-card border-b px-6 py-3">
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {ADMIN_JOURNEY_STEPS.map((step, i) => {
          const isActive = step.match(pathname);
          const isPast = activeIdx >= 0 && i < activeIdx;
          return (
            <div key={step.id} className="flex items-center gap-2 md:gap-3">
              <Link
                to={step.href}
                className={cn(
                  "flex items-center gap-1.5 text-sm rounded-md px-2 py-1 transition-colors",
                  isActive && "bg-primary/10 text-primary font-medium",
                  !isActive && isPast && "text-muted-foreground hover:text-foreground",
                  !isActive && !isPast && "text-muted-foreground/70 hover:text-foreground"
                )}
              >
                <step.icon className="h-4 w-4 shrink-0" />
                <span>{step.label}</span>
              </Link>
              {i < ADMIN_JOURNEY_STEPS.length - 1 && (
                <span className="text-muted-foreground/40 hidden sm:inline">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
