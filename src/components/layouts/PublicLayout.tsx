import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mountain, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  { name: "About", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="nordic-gradient p-2 rounded-lg">
                <Mountain className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Nordicascent</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="nordic-gradient nordic-glow">
                <Link to="/contact">Book Demo</Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
              <div className="flex flex-col gap-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary px-2 py-2",
                      location.pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild className="nordic-gradient">
                    <Link to="/contact">Book Demo</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="nordic-gradient p-2 rounded-lg">
                  <Mountain className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Nordicascent</span>
              </Link>
              <p className="text-sm text-background/80">
                Empowering teams to rise higher with modern workforce management solutions.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/services" className="hover:text-background transition-colors">Features</Link></li>
                <li><Link to="/services" className="hover:text-background transition-colors">Pricing</Link></li>
                <li><Link to="/services" className="hover:text-background transition-colors">Integrations</Link></li>
                <li><Link to="/services" className="hover:text-background transition-colors">API</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><Link to="/about" className="hover:text-background transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-background transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-background transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-muted-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/70">
              © 2024 Nordicascent. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                LinkedIn
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                Twitter
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
