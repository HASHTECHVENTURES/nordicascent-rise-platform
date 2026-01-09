import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const quickLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
            {location.pathname}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3 flex items-center justify-center gap-2">
                  <Search className="h-4 w-4" />
                  Quick Navigation
                </h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Button key={link.name} variant="outline" asChild size="sm">
                        <Link to={link.href}>
                          {Icon && <Icon className="h-4 w-4 mr-2" />}
                          {link.name}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button asChild className="w-full">
                  <Link to="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="w-full mt-2">
                  <Link to="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
