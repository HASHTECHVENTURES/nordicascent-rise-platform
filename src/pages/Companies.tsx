import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

const STEPS = [
  "Selection",
  "Readiness validation",
  "Activation",
  "Relocation",
  "Onboarding",
  "6-month follow-up",
];

const RISK_POINTS = [
  "Readiness validation before arrival",
  "Mentor early-warning layer",
  "Digital internship before any relocation commitment",
  "Six-month follow-up after arrival",
];

const PARTNERS = ["GCE NODE", "UiT", "Bangalore universities", "Relocation Agder"];

export default function Companies() {
  return (
    <div className="flex flex-col">
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-primary tracking-tight mb-5 leading-tight">
            Hire proven engineers from India, without the integration risk.
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            We validate cultural and technical fit before arrival and support integration for six months after — so the engineer you hire is the engineer who stays.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild className="bg-warning text-warning-foreground hover:opacity-90">
              <Link to="/contact">Book a demo</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground mb-4">The real risk isn’t finding talent</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Nordic engineering shortage is well known. The harder problem is a hire that doesn’t work out — a mis-hire can cost 2–3 MNOK. Nordic Ascent retires that risk step by step before you commit to relocation.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h2 className="text-2xl font-semibold text-foreground mb-8">How it works</h2>
          <div className="flex flex-wrap gap-2 sm:gap-0 sm:flex-nowrap items-stretch">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 min-w-[140px]">
                <div className="w-full rounded-md border border-border bg-card px-3 py-4 text-center">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    {i + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-foreground leading-snug">{step}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden sm:block h-4 w-4 text-muted-foreground mx-1 shrink-0" />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6 leading-relaxed">
            Final Clearance lets your company decide before it commits. Relocation is arranged directly with specialist partners — not resold.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Why it’s lower risk</h2>
          <ul className="space-y-3">
            {RISK_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Proof</h2>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 mb-10">
            {PARTNERS.map((p) => (
              <span key={p} className="text-sm font-medium text-primary/70">{p}</span>
            ))}
          </div>
          <p className="text-muted-foreground mb-6">
            See how Nordic Ascent de-risks your next engineering hire.
          </p>
          <Button size="lg" asChild className="bg-warning text-warning-foreground hover:opacity-90">
            <Link to="/contact">Book a demo</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
