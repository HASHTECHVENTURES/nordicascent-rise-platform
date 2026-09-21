import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  {
    name: "Selection",
    brief: "Match talent to roles",
    risk: "Wrong-fit hire avoided",
    detail:
      "Engineers are matched to real Nordic roles: not sprayed into a general talent pool.",
  },
  {
    name: "Readiness",
    brief: "Validate fit before arrival",
    risk: "Unproven skill retired",
    detail:
      "Technical and cultural readiness is validated before anyone relocates or commits full-time.",
  },
  {
    name: "Activation",
    brief: "Internship & final clearance",
    risk: "Blind commitment retired",
    detail:
      "A structured internship and clearance gate proves performance in context: before the move.",
  },
  {
    name: "Relocation",
    brief: "Move with specialist partners",
    risk: "Logistics chaos retired",
    detail:
      "Specialist partners handle the move so companies and engineers stay focused on the work.",
  },
  {
    name: "Onboarding",
    brief: "First weeks on site",
    risk: "Sink-or-swim retired",
    detail:
      "Structured first weeks on site: mentoring and clarity instead of a cold start.",
  },
  {
    name: "Follow-up",
    brief: "Six-month support",
    risk: "Early churn retired",
    detail:
      "Six months of follow-up after arrival. Retention is designed in: not hoped for.",
  },
];

/** Node positions along an ascending path (viewBox 0 0 1000 320) */
const nodes = [
  { x: 70, y: 250 },
  { x: 240, y: 210 },
  { x: 410, y: 155 },
  { x: 580, y: 120 },
  { x: 750, y: 85 },
  { x: 920, y: 55 },
];

const PATH_D =
  "M 70 250 C 150 250, 180 210, 240 210 S 350 155, 410 155 S 520 120, 580 120 S 690 85, 750 85 S 860 55, 920 55";

export default function ProcessTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [panelKey, setPanelKey] = useState(0);
  const [parallaxY, setParallaxY] = useState(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Scroll into view → draw-on
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (reduceMotion.current) {
            setDrawn(true);
          } else {
            window.setTimeout(() => setDrawn(true), 80);
          }
        }
      },
      { threshold: 0.28 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Soft parallax on background wash
  useEffect(() => {
    if (reduceMotion.current) return;

    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2: window.innerHeight / 2;
      setParallaxY(Math.max(-24, Math.min(24, mid * -0.04)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Autplay only after draw + in view
  useEffect(() => {
    if (!autoplay || !inView || !drawn || reduceMotion.current) return;
    const id = window.setInterval(() => {
      setActive((i) => {
        const next = (i + 1) % stages.length;
        setPanelKey((k) => k + 1);
        return next;
      });
    }, 3200);
    return () => window.clearInterval(id);
  }, [autoplay, inView, drawn]);

  const selectStage = (i: number) => {
    setAutoplay(false);
    setActive(i);
    setPanelKey((k) => k + 1);
  };

  const stage = stages[active];
  const progressPct = drawn ? ((active + 1) / stages.length) * 100 : 0;

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden bg-background"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,hsla(200,58%,58%,0.14),transparent_60%),radial-gradient(ellipse_40%_40%_at_80%_80%,hsla(215,54%,24%,0.07),transparent_50%)]" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-10 lg:mb-14">
          <span className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground mb-3 block">
            How it works
          </span>
          <h2 className="text-2xl lg:text-4xl font-semibold mb-3 text-primary tracking-tight">
            Risk retired at each step
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            One structured ascent: from selection through six-month follow-up. Click any stage.
          </p>
        </div>

        {/* Desktop / tablet visual graph */}
        <div
          className="hidden md:block max-w-5xl mx-auto"
          onMouseEnter={() => setAutoplay(false)}
          onFocus={() => setAutoplay(false)}
        >
          <div className="relative rounded-[1.75rem] bg-white/55 backdrop-blur-md ring-1 ring-primary/10 shadow-[0_20px_60px_rgba(28,58,95,0.08)] px-4 pt-6 pb-4 lg:px-8 lg:pt-8">
            <svg
              viewBox="0 0 1000 320"
              className="w-full h-auto"
              role="img"
              aria-label="Nordic Ascent journey from Selection to Follow-up"
            >
              <defs>
                <linearGradient id="ascent-stroke" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(215 54% 24%)" stopOpacity="0.25" />
                  <stop offset="55%" stopColor="hsl(200 58% 50%)" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="hsl(215 54% 24%)" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="ascent-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(200 58% 58%)" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="hsl(200 58% 58%)" stopOpacity="0" />
                </linearGradient>
                <filter id="node-glow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Area under curve: fades in after draw */}
              <path
                d={`${PATH_D} L 920 320 L 70 320 Z`}
                fill="url(#ascent-fill)"
                className={cn(
                  "transition-opacity duration-1000 ease-out",
                  drawn ? "opacity-100" : "opacity-0",
                )}
              />

              {/* Base track: scroll draw-on */}
              <path
                d={PATH_D}
                fill="none"
                stroke="hsl(215 20% 85%)"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="100"
                strokeDashoffset={drawn ? 0 : 100}
                className="journey-draw"
              />

              {/* Progress stroke to active node */}
              <path
                d={PATH_D}
                fill="none"
                stroke="url(#ascent-stroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray={`${progressPct} 100`}
                className="transition-[stroke-dasharray] duration-700 ease-out"
                style={{ opacity: drawn ? 1 : 0 }}
              />

              {/* Flowing dash: only after drawn */}
              {drawn && (
                <path
                  d={PATH_D}
                  fill="none"
                  stroke="hsl(200 58% 58%)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="6 14"
                  opacity="0.4"
                  className="journey-dash"
                />
              )}

              {nodes.map((node, i) => {
                const isActive = i === active && drawn;
                const isPast = i < active && drawn;
                const nodeVisible = drawn;
                return (
                  <g
                    key={stages[i].name}
                    className="transition-opacity duration-500"
                    style={{
                      opacity: nodeVisible ? 1 : 0,
                      transitionDelay: drawn ? `${180 + i * 90}ms` : "0ms",
                    }}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={28}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => selectStage(i)}
                    >
                      <title>{stages[i].name}</title>
                    </circle>

                    {isActive && (
                      <>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={32}
                          fill="hsl(200 58% 58% / 0.12)"
                          className="journey-pulse"
                        />
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={22}
                          fill="hsl(200 58% 58% / 0.28)"
                          filter="url(#node-glow)"
                          className="journey-pulse-inner"
                        />
                      </>
                    )}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 15 : 11}
                      fill={
                        isActive || isPast
                          ? "hsl(215 54% 24%)"
                          : "hsl(0 0% 100%)"
                      }
                      stroke={
                        isActive
                          ? "hsl(200 58% 58%)"
                          : isPast
                            ? "hsl(215 54% 24%)"
                            : "hsl(215 20% 78%)"
                      }
                      strokeWidth={isActive ? 3.5 : 2}
                      className="cursor-pointer transition-all duration-300"
                      onClick={() => selectStage(i)}
                    />

                    <text
                      x={node.x}
                      y={node.y + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                      fill={isActive || isPast ? "white" : "hsl(215 20% 45%)"}
                      fontSize="10"
                      fontWeight="600"
                    >
                      {i + 1}
                    </text>

                    <text
                      x={node.x}
                      y={node.y + 36}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fill={
                        isActive ? "hsl(215 54% 24%)" : "hsl(215 20% 45%)"
                      }
                      fontSize="12"
                      fontWeight={isActive ? "600" : "500"}
                    >
                      {stages[i].name}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Detail panel: crossfade on step change */}
            <div className="mt-2 mb-2 mx-2 lg:mx-4 rounded-2xl bg-primary text-primary-foreground px-6 py-5 lg:px-8 lg:py-6 overflow-hidden min-h-[140px] sm:min-h-[120px]">
              <div
                key={panelKey}
                className="journey-panel flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
              >
                <div className="min-w-0 text-left">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary-foreground/55 mb-2">
                    Step {active + 1} of {stages.length} · {stage.risk}
                  </p>
                  <h3 className="text-xl lg:text-2xl font-semibold tracking-tight mb-1.5">
                    {stage.name}
                  </h3>
                  <p className="text-sm lg:text-base text-primary-foreground/80 max-w-xl leading-relaxed">
                    {stage.detail}
                  </p>
                </div>
                <p className="text-xs text-primary-foreground/50 shrink-0 sm:text-right">
                  {stage.brief}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile vertical graph */}
        <div className="md:hidden max-w-md mx-auto">
          <ol className="relative space-y-0">
            <span
              aria-hidden
              className={cn(
                "absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-primary via-secondary to-primary/30 origin-top transition-transform duration-1000 ease-out",
                drawn ? "scale-y-100" : "scale-y-0",
              )}
            />
            {stages.map((s, i) => {
              const isActive = i === active;
              return (
                <li
                  key={s.name}
                  className="transition-opacity duration-500"
                  style={{
                    opacity: drawn ? 1 : 0,
                    transitionDelay: drawn ? `${120 + i * 80}ms` : "0ms",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => selectStage(i)}
                    className={cn(
                      "relative w-full flex gap-4 text-left py-3 pl-0 pr-2 transition-colors",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-2 transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground ring-secondary shadow-[0_0_0_6px_hsla(200,58%,58%,0.2)]"
                          : "bg-white text-muted-foreground ring-border",
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="pt-1.5 min-w-0 flex-1">
                      <span
                        className={cn(
                          "block text-sm font-semibold",
                          isActive ? "text-primary" : "text-foreground",
                        )}
                      >
                        {s.name}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {s.brief}
                      </span>
                      {isActive && (
                        <span
                          key={`m-${panelKey}`}
                          className="journey-panel block mt-2 text-sm text-muted-foreground leading-relaxed"
                        >
                          {s.detail}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex justify-center mt-10 lg:mt-12">
          <Button size="lg" variant="outline" asChild className="rounded-full px-6">
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
