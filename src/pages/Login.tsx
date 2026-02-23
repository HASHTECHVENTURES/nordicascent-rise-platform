import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Building2, Shield, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@/assets/nordic-ascent-logo.png";

type UserRole = "candidate" | "employer" | "internal" | null;

const roleConfig = {
  candidate: {
    title: "Candidate",
    description: "Engineers seeking Nordic opportunities",
    icon: User,
    redirectTo: "/candidate/dashboard",
  },
  employer: {
    title: "Company",
    description: "Nordic companies hiring talent",
    icon: Building2,
    redirectTo: "/employer/dashboard",
  },
  internal: {
    title: "Admin",
    description: "Nordic Ascent team access",
    icon: Shield,
    redirectTo: "/admin/dashboard",
  },
};

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const config = roleConfig[selectedRole];
    toast({ 
      title: authMode === "signin" ? "Welcome back!" : "Account created!", 
      description: authMode === "signin" 
        ? `Logged in as ${config.title}` 
        : `Your ${config.title} account has been created.`
    });
    setIsLoading(false);
    navigate(config.redirectTo);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setAuthMode("signin");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-3 text-primary-foreground">
              <img src={logoImage} alt="Nordic Ascent" className="h-24 w-auto" style={{ filter: "brightness(0) saturate(100%) invert(19%) sepia(32%) saturate(1200%) hue-rotate(183deg) brightness(95%) contrast(92%)" }} />
            <span className="text-xl font-medium">Nordic Ascent</span>
          </Link>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-medium text-primary-foreground leading-tight">
            {selectedRole 
              ? `Welcome, ${roleConfig[selectedRole].title}` 
              : "Engineering talent mobility"}
          </h1>
          <p className="text-xl text-primary-foreground/80">
            {selectedRole 
              ? roleConfig[selectedRole].description 
              : "Connecting exceptional engineers from India with Nordic companies."}
          </p>
        </div>
        <div className="flex items-center gap-4 text-primary-foreground/60 text-sm">
          <span>© 2026 Nordic Ascent</span>
          <span>•</span>
          <a href="#" className="hover:text-primary-foreground">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-primary-foreground">Terms</a>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={logoImage} alt="Nordic Ascent" className="h-24 w-auto" />
              <span className="text-xl font-medium">Nordic Ascent</span>
            </Link>
          </div>

          <Button variant="ghost" asChild className="mb-4">
            {selectedRole ? (
              <button onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Choose different role
              </button>
            ) : (
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            )}
          </Button>

          {/* Role Selection */}
          {!selectedRole ? (
            <Card className="border-border">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-medium">Get started</CardTitle>
                <CardDescription>Choose how you want to use Nordic Ascent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.candidate][]).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRole(key as UserRole)}
                      className="w-full p-4 rounded border border-border hover:border-primary bg-card hover:bg-muted/50 group flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{config.title}</h3>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            /* Auth Form */
            <Card className="border-border">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    {(() => {
                      const Icon = roleConfig[selectedRole].icon;
                      return <Icon className="h-5 w-5 text-primary" />;
                    })()}
                  </div>
                  <span className="font-medium text-muted-foreground">{roleConfig[selectedRole].title}</span>
                </div>
                <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" required />
                      </div>
                    </div>
                  )}
                  
                  {authMode === "signup" && selectedRole === "employer" && (
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" placeholder="Your company" required />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@company.com" required />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {authMode === "signin" && (
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" required />
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" required />
                    </div>
                  )}

                  {authMode === "signin" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <Label htmlFor="remember" className="text-sm font-normal">
                        Remember me for 30 days
                      </Label>
                    </div>
                  )}

                  {authMode === "signup" && (
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                        I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{" "}
                        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                      </Label>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading 
                      ? (authMode === "signin" ? "Signing in..." : "Creating account...") 
                      : (authMode === "signin" ? "Sign In" : "Create Account")}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  {authMode === "signin" ? (
                    <>Don't have an account? <button onClick={() => setAuthMode("signup")} className="text-primary hover:underline">Sign up</button></>
                  ) : (
                    <>Already have an account? <button onClick={() => setAuthMode("signin")} className="text-primary hover:underline">Sign in</button></>
                  )}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
