import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stages = [
  { name: "Preparation", brief: "Skill assessment & readiness" },
  { name: "Selection", brief: "Matching talent to roles" },
  { name: "Training", brief: "Technical & cultural prep" },
  { name: "Internship", brief: "Real-world experience" },
  { name: "Relocation", brief: "Seamless move to Nordics" },
  { name: "Onboarding", brief: "Integration support" },
  { name: "Follow-up", brief: "Long-term success" },
];

export default function ProcessTeaser() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-sm font-semibold tracking-widest uppercase text-secondary mb-3 block">
            The Journey
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Our 7-Stage Pipeline</h2>
          <p className="text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            From initial assessment to successful onboarding, every candidate is prepared, 
            supported, and set up for long-term success.
          </p>

          {/* Stage indicators */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {stages.map((stage, i) => (
              <div
                key={stage.name}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-card shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{stage.name}</span>
                </div>
                {/* Tooltip */}
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded shadow-sm border border-border/50">
                    {stage.brief}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Button size="lg" asChild className="btn-professional text-base h-13 px-10">
            <Link to="/platform">
              Learn About Our Pipeline
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
