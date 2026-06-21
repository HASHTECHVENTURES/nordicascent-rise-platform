import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Building2, Shield, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePublicConfig } from "@/hooks/useData";
import type { UserRole } from "@/types/database";
import logoImage from "@/assets/nordic-ascent-logo.png";
import { HARDCODED_ADMIN_EMAIL, HARDCODED_ADMIN_PASSWORD } from "@/lib/adminCredentials";

type LoginRole = "candidate" | "employer" | "internal" | null;

const ROLE_STORAGE_KEY = "na.login.selectedRole";

const roleConfig = {
  candidate: {
    title: "Candidate",
    description: "Engineers seeking Nordic opportunities",
    icon: User,
    redirectTo: "/candidate/dashboard",
    dbRole: "candidate" as UserRole,
  },
  employer: {
    title: "Company",
    description: "Nordic companies hiring talent",
    icon: Building2,
    redirectTo: "/employer/company",
    dbRole: "employer" as UserRole,
  },
  internal: {
    title: "Admin",
    description: "Nordic Ascent team access",
    icon: Shield,
    redirectTo: "/admin/dashboard",
    dbRole: "admin" as UserRole,
  },
};

export default function Login({ fixedRole }: { fixedRole?: Exclude<LoginRole, null> }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInAsAdmin, signUp } = useAuth();
  const { data: publicConfig } = usePublicConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>(fixedRole ?? null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState(fixedRole === "internal" ? HARDCODED_ADMIN_EMAIL : "");
  const [password, setPassword] = useState(fixedRole === "internal" ? HARDCODED_ADMIN_PASSWORD : "");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Restore role so refresh / redirect back from protected route doesn't lose context
  useEffect(() => {
    if (fixedRole) {
      setSelectedRole(fixedRole);
      return;
    }
    const saved = sessionStorage.getItem(ROLE_STORAGE_KEY);
    if (saved === "candidate" || saved === "employer" || saved === "internal") {
      setSelectedRole(saved);
    }
  }, [fixedRole]);

  useEffect(() => {
    if (selectedRole) {
      sessionStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
    } else {
      sessionStorage.removeItem(ROLE_STORAGE_KEY);
    }
  }, [selectedRole]);

  useEffect(() => {
    if (selectedRole === "internal") {
      setAuthMode("signin");
    }
  }, [selectedRole]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (selectedRole === "internal" && authMode !== "signin") {
      return;
    }

    if (authMode === "signup" && password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (authMode === "signup" && selectedRole === "internal" && import.meta.env.VITE_ALLOW_ADMIN_SIGNUP !== "true") {
      toast({
        title: "Admin signup disabled",
        description: "Contact Nordic Ascent for admin access.",
        variant: "destructive",
      });
      return;
    }

    if (authMode === "signup" && publicConfig) {
      if (selectedRole === "candidate" && !publicConfig.candidateRegistration) {
        toast({ title: "Registration closed", description: "Candidate registration is currently disabled.", variant: "destructive" });
        return;
      }
      if (selectedRole === "employer" && !publicConfig.employerRegistration) {
        toast({ title: "Registration closed", description: "Employer registration is currently disabled.", variant: "destructive" });
        return;
      }
    }

    if (publicConfig?.maintenanceMode && authMode === "signup") {
      toast({ title: "Maintenance mode", description: "New signups are paused during maintenance.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const config = roleConfig[selectedRole];

    try {
      if (authMode === "signin") {
        if (selectedRole === "internal") {
          await signInAsAdmin(email, password);
        } else {
          await signIn(email, password);
        }
        sessionStorage.removeItem(ROLE_STORAGE_KEY);
        toast({ title: "Welcome back!", description: `Logged in as ${config.title}` });
        navigate(
          selectedRole === "employer"
            ? "/employer/dashboard"
            : config.redirectTo
        );
      } else {
        await signUp(email, password, {
          role: config.dbRole,
          full_name: `${firstName} ${lastName}`.trim(),
          company_name: selectedRole === "employer" ? companyName : undefined,
        });
        sessionStorage.removeItem(ROLE_STORAGE_KEY);
        toast({
          title: "Account created!",
          description:
            selectedRole === "employer"
              ? "Complete your company profile to get started."
              : selectedRole === "candidate"
                ? "Complete your profile to get started."
                : `Welcome to Nordic Ascent, ${config.title}.`,
        });
        navigate(
          selectedRole === "candidate"
            ? "/candidate/profile"
            : config.redirectTo
        );
      }
    } catch (err) {
      toast({
        title: authMode === "signin" ? "Sign in failed" : "Sign up failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedRole(null);
    setAuthMode("signin");
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
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
              : "Connecting exceptional engineering talent from India—all disciplines—with Nordic companies."}
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

          {selectedRole && !fixedRole ? (
            <Button variant="ghost" className="mb-4" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Choose different role
            </Button>
          ) : (
            <Button variant="ghost" className="mb-4" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          )}

          {/* Role Selection */}
          {!selectedRole && !fixedRole ? (
            <Card className="border-border">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-medium">Get started</CardTitle>
                <CardDescription>Choose how you want to use Nordic Ascent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Object.entries(roleConfig) as [Exclude<LoginRole, null>, typeof roleConfig.candidate][]).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedRole(key)}
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
                <CardTitle className="text-2xl font-medium">
                  {selectedRole === "internal" ? "Admin sign in" : "Welcome back"}
                </CardTitle>
                {selectedRole === "internal" ? (
                  <CardDescription>
                    Use your Nordic Ascent admin credentials.
                  </CardDescription>
                ) : (
                  <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "signin" | "signup")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>
                  </Tabs>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>
                  )}
                  
                  {authMode === "signup" && selectedRole === "employer" && (
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input id="company" placeholder="Your company" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="name@company.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
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
                    <Input id="password" type="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type="password" placeholder="••••••••" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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
                      ? selectedRole === "internal" || authMode === "signin"
                        ? "Signing in..."
                        : "Creating account..."
                      : selectedRole === "internal" || authMode === "signin"
                        ? "Sign In"
                        : "Create Account"}
                  </Button>
                </form>

                {selectedRole !== "internal" && (
                  <p className="text-center text-sm text-muted-foreground mt-6">
                    {authMode === "signin" ? (
                      <>Don&apos;t have an account? <button type="button" onClick={() => setAuthMode("signup")} className="text-primary hover:underline">Sign up</button></>
                    ) : (
                      <>Already have an account? <button type="button" onClick={() => setAuthMode("signin")} className="text-primary hover:underline">Sign in</button></>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
