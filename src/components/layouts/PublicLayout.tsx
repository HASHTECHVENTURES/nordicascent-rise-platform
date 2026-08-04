import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/nordic-ascent-logo.png";
import logoBlue from "@/assets/nordic-ascent-logo-blue.png";

const navigation = [
  { name: "For companies", href: "/companies" },
  { name: "For engineers", href: "/engineers" },
  { name: "How it works", href: "/how-it-works" },
  { name: "Insights", href: "/insight" },
  { name: "Contact", href: "/contact" },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3 h-14 overflow-hidden">
              <img src={logoBlue} alt="Nordic Ascent" className="h-full w-auto object-contain" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href ||
                      (item.href === "/insight" && location.pathname.startsWith("/insight"))
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild className="text-muted-foreground hover:text-primary">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-warning text-warning-foreground hover:opacity-90">
                <Link to="/contact">Book a demo</Link>
              </Button>
            </div>

            <button
              className="md:hidden p-2 text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <div className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary px-2 py-2",
                      location.pathname === item.href ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <Button
                    variant="ghost"
                    asChild
                    className="justify-start text-muted-foreground hover:text-primary"
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-warning text-warning-foreground hover:opacity-90 justify-start"
                  >
                    <Link to="/contact">Book a demo</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
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
                  <a href="#" className="hover:text-primary-foreground">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary-foreground">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/70">
              © 2026 Nordic Ascent. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
