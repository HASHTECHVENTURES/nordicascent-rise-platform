import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import PartnerLogos from "@/components/home/PartnerLogos";

const RISK_POINTS = [
  "Readiness validation before arrival",
  "Mentor early-warning layer",
  "Digital internship before any relocation commitment",
  "Six-month follow-up after arrival",
];

export default function Companies() {
  return (
    <div className="flex flex-col">
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold text-primary tracking-tight mb-5 leading-tight">
            Hire proven engineers from India, without the integration risk.
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            We validate cultural and technical fit before arrival and support integration for six
            months after, so the engineer you hire is the engineer who stays.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Engineers from the top Indian institutions choose this path.
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
          <h2 className="text-2xl font-semibold text-foreground mb-4">The problem</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Nordic engineering shortage is well known. The harder problem is a hire that doesn’t
            work out. A mis-hire can cost 2 to 3 MNOK. Nordic Ascent retires that risk step by step
            before you commit to relocation.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
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

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Proof</h2>
          <PartnerLogos className="mb-10" />
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
