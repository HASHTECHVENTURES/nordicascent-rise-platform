import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const stages = [
  { name: "Selection", brief: "Match talent to roles" },
  { name: "Readiness", brief: "Validate fit before arrival" },
  { name: "Activation", brief: "Internship & Final Clearance" },
  { name: "Relocation", brief: "Move with specialist partners" },
  { name: "Onboarding", brief: "First weeks on site" },
  { name: "Follow-up", brief: "Six-month support" },
];

export default function ProcessTeaser() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-3 block">
            How it works
          </span>
          <h2 className="text-2xl lg:text-3xl font-semibold mb-3 text-foreground">
            Risk retired at each step
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            From selection through six-month follow-up — one structured pipeline for companies and engineers.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {stages.map((stage, i) => (
              <div
                key={stage.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-card border border-border"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{stage.name}</span>
              </div>
            ))}
          </div>

          <Button size="lg" variant="outline" asChild>
            <Link to="/how-it-works">
              Learn how it works
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
