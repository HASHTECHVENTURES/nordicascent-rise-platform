import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/nordic-ascent-logo.png";
import bridgeIcon from "@/assets/nordic-bridge-icon.png";

const secondaryNav = [
  { name: "How it works", href: "/how-it-works" },
  { name: "Insights", href: "/insight" },
  { name: "Contact", href: "/contact" },
];

type Audience = "companies" | "engineers";

function audienceFromPath(pathname: string): Audience | null {
  if (pathname.startsWith("/engineers")) return "engineers";
  if (pathname.startsWith("/companies")) return "companies";
  return null;
}

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [audienceHint, setAudienceHint] = useState<Audience>("companies");
  const location = useLocation();

  const pathAudience = audienceFromPath(location.pathname);
  const ctaAudience = pathAudience ?? audienceHint;
  const isCompaniesCta = ctaAudience === "companies";
  const companiesActive = pathAudience === "companies";
  const engineersActive = pathAudience === "engineers";

  useEffect(() => {
    const fromPath = audienceFromPath(location.pathname);
    if (fromPath) setAudienceHint(fromPath);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const cta = isCompaniesCta
    ? { label: "Book a demo", href: "/contact" }
    : { label: "Start your journey", href: "/login?role=candidate&signup=1" };

  const isSecondaryActive = (href: string) =>
    location.pathname === href ||
    (href === "/insight" && location.pathname.startsWith("/insight"));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 pointer-events-none">
        <div
          className={cn(
            "pointer-events-auto px-3 sm:px-4 lg:px-6 transition-[padding] duration-300 ease-out",
            scrolled ? "pt-2.5" : "pt-4",
          )}
        >
          <nav
            className={cn(
              "fjord-glass mx-auto max-w-6xl transition-all duration-300 ease-out",
              scrolled
                ? "rounded-2xl shadow-[0_8px_30px_rgba(28,58,95,0.10)] ring-1 ring-primary/10"
                : "rounded-[1.35rem] shadow-[0_12px_40px_rgba(28,58,95,0.08)] ring-1 ring-white/60",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-between gap-3 px-3 sm:px-4 transition-[height] duration-300",
                scrolled ? "h-14" : "h-16",
              )}
            >
              <Link
                to="/"
                className="group flex items-center gap-2.5 shrink-0 min-w-0"
                aria-label="Nordic Ascent home"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary ring-1 ring-primary/20 shadow-[0_4px_14px_rgba(28,58,95,0.25)]">
                  <img
                    src={bridgeIcon}
                    alt=""
                    aria-hidden
                    className="h-[22px] w-[22px] object-contain brightness-0 invert opacity-95 transition-transform duration-300 group-hover:scale-105"
                  />
                </span>
                <span className="flex flex-col justify-center leading-none">
                  <span className="text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-primary">
                    Nordic
                  </span>
                  <span className="mt-1 text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-primary">
                    Ascent
                  </span>
                </span>
              </Link>

              {/* Desktop: audience + secondary */}
              <div className="hidden lg:flex items-center gap-1 min-w-0">
                <Link
                  to="/companies"
                  onClick={() => setAudienceHint("companies")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    companiesActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  Companies
                </Link>
                <Link
                  to="/engineers"
                  onClick={() => setAudienceHint("engineers")}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium transition-colors",
                    engineersActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  Engineers
                </Link>

                {secondaryNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium transition-colors",
                      isSecondaryActive(item.href)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Desktop actions */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full px-4"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="group rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5"
                >
                  <Link to={cta.href} className="inline-flex items-center gap-1.5">
                    <span>{cta.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Button>
              </div>

              {/* Mobile */}
              <div className="flex lg:hidden items-center gap-2">
                <div className="hidden sm:flex items-center gap-1">
                  <Link
                    to="/companies"
                    onClick={() => setAudienceHint("companies")}
                    className={cn(
                      "px-2 py-1 text-xs font-medium transition-colors",
                      companiesActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    Companies
                  </Link>
                  <Link
                    to="/engineers"
                    onClick={() => setAudienceHint("engineers")}
                    className={cn(
                      "px-2 py-1 text-xs font-medium transition-colors",
                      engineersActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    Engineers
                  </Link>
                </div>
                <button
                  className="p-2.5 rounded-full text-primary ring-1 ring-primary/10 bg-white/50 hover:bg-white/80 transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mobile panel */}
            <div
              className={cn(
                "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out border-t border-primary/5",
                mobileMenuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 border-t-0",
              )}
            >
              <div className="px-4 pb-4 pt-3 space-y-4">
                <div className="sm:hidden flex flex-col gap-1">
                  <Link
                    to="/companies"
                    onClick={() => setAudienceHint("companies")}
                    className={cn(
                      "px-3 py-2.5 text-sm font-medium transition-colors",
                      companiesActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    Companies
                  </Link>
                  <Link
                    to="/engineers"
                    onClick={() => setAudienceHint("engineers")}
                    className={cn(
                      "px-3 py-2.5 text-sm font-medium transition-colors",
                      engineersActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary",
                    )}
                  >
                    Engineers
                  </Link>
                </div>

                <div className="flex flex-col gap-1">
                  {secondaryNav.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "px-3 py-2.5 text-sm font-medium transition-colors",
                        isSecondaryActive(item.href)
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-primary/10">
                  <Button
                    variant="ghost"
                    asChild
                    className="justify-start rounded-xl text-muted-foreground hover:text-primary"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 justify-center"
                  >
                    <Link to={cta.href}>{cta.label}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logoImage}
                  alt="Nordic Ascent"
                  className="h-24 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-sm text-primary-foreground/80">
                Engineering talent from India, hired to stay. Validated before arrival. Supported for
                six months after.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link to="/companies" className="hover:text-primary-foreground">
                    For companies
                  </Link>
                </li>
                <li>
                  <Link to="/engineers" className="hover:text-primary-foreground">
                    For engineers
                  </Link>
                </li>
                <li>
                  <Link to="/how-it-works" className="hover:text-primary-foreground">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link to="/about" className="hover:text-primary-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/insight" className="hover:text-primary-foreground">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/70">
                <li>
                  <Link to="/privacy" className="hover:text-primary-foreground">
                    Privacy Notice
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-primary-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/gdpr" className="hover:text-primary-foreground">
                    GDPR
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/70">
              © 2026 Nordic Ascent. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="https://www.linkedin.com/company/nordic-ascent/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
