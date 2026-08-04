import { Link } from "react-router-dom";
import { ArrowRight, Building2, Users } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">
            Nordic Talent Mobility
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.15] text-primary mb-5 tracking-tight">
            Engineering talent from India, hired to stay.
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Validated before arrival. Supported for six months after. Not placement — integration.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
          <Link
            to="/companies"
            className="group rounded-lg border border-border bg-card p-8 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-md bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                For companies
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              Hire proven engineers without the risk
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Validate cultural and technical fit before you commit — then support integration for six months after.
            </p>
            <span className="inline-flex items-center text-sm font-medium text-primary">
              Explore for companies
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/engineers"
            className="group rounded-lg border border-border bg-card p-8 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-md bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                For engineers
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              Build your career in the Nordics
            </h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              A structured path from a top Indian university to a lasting role — with preparation, a mentor, and support after you arrive.
            </p>
            <span className="inline-flex items-center text-sm font-medium text-primary">
              Explore for engineers
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
