import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/** Brand aurora streaks: navy / fjord / ice (adapted from CodePen rainbow, toned for B2B) */
const AURORA_COUNT = 12;

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Brand aurora: soft light bands, hero only */}
      <div className="hero-aurora pointer-events-none absolute inset-0 -top-16 overflow-hidden" aria-hidden>
        <div className="hero-aurora-stage">
          {Array.from({ length: AURORA_COUNT }, (_, i) => (
            <span key={i} className={`hero-aurora-beam hero-aurora-beam--${(i % 6) + 1}`} />
          ))}
          <span className="hero-aurora-vignette-h" />
          <span className="hero-aurora-vignette-v" />
        </div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 lg:pt-16 lg:pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="hero-enter hero-enter-1 inline-block text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-5">
            Nordic Talent Mobility
          </span>
          <h1 className="hero-enter hero-enter-2 text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.15] text-primary mb-5 tracking-tight">
            Engineering talent from India, hired to stay.
          </h1>
          <p className="hero-enter hero-enter-3 text-lg lg:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
            Validated before arrival. Supported for six months after. Not placement. Integration.
          </p>
          <p className="hero-enter hero-enter-4 text-sm text-muted-foreground/90 mb-12 max-w-xl mx-auto">
            Engineers from the top Indian institutions choose this path.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Link
            to="/companies"
            className="hero-enter hero-enter-5 group rounded-2xl bg-primary text-primary-foreground p-8 md:p-10 text-left transition-all duration-300 hover:shadow-[0_20px_48px_rgba(28,58,95,0.28)] hover:-translate-y-1 min-h-[180px] flex flex-col justify-between ring-1 ring-white/10"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground/70 mb-6">
              For companies
            </p>
            <span className="inline-flex items-center text-lg font-medium leading-snug">
              Hire proven engineers without the risk
              <ArrowRight className="ml-2 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            to="/engineers"
            className="hero-enter hero-enter-6 group rounded-2xl bg-[#2B4A6F] text-primary-foreground p-8 md:p-10 text-left transition-all duration-300 hover:shadow-[0_20px_48px_rgba(28,58,95,0.28)] hover:-translate-y-1 min-h-[180px] flex flex-col justify-between ring-1 ring-white/10"
          >
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-foreground/70 mb-6">
              For engineers
            </p>
            <span className="inline-flex items-center text-lg font-medium leading-snug">
              Build your career in the Nordics
              <ArrowRight className="ml-2 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
