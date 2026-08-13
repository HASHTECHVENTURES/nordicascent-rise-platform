import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 lg:pt-24 lg:pb-20">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">
            Nordic Talent Mobility
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.15] text-primary mb-5 tracking-tight">
            <span className="inline-block border-l-[3px] border-warning pl-4 text-left sm:text-center sm:border-l-0 sm:pl-0">
              Engineering talent from India, hired to stay.
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            <span className="inline-block border-l-[3px] border-warning/70 pl-4 text-left sm:border-l-0 sm:pl-0 sm:text-center">
              Validated before arrival. Supported for six months after. Not placement — integration.
            </span>
          </p>
          <p className="text-sm text-muted-foreground/90 mb-12 max-w-xl mx-auto">
            Engineers from the top Indian institutions choose this path.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Link
            to="/companies"
            className="group rounded-md bg-primary text-primary-foreground p-8 md:p-10 text-left transition-opacity hover:opacity-95 min-h-[180px] flex flex-col justify-between"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground/70 mb-6">
              For companies
            </p>
            <span className="inline-flex items-center text-lg font-medium leading-snug">
              Hire proven engineers without the risk
              <ArrowRight className="ml-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            to="/engineers"
            className="group rounded-md bg-[#2B4A6F] text-primary-foreground p-8 md:p-10 text-left transition-opacity hover:opacity-95 min-h-[180px] flex flex-col justify-between"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground/70 mb-6">
              For engineers
            </p>
            <span className="inline-flex items-center text-lg font-medium leading-snug">
              Build your career in the Nordics
              <ArrowRight className="ml-2 h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
