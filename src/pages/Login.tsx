import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mountain, ArrowLeft, User, Building2, Shield, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "candidate" | "employer" | "internal" | null;

const roleConfig = {
  candidate: {
    title: "Candidate",
    description: "Looking for Nordic job opportunities",
    icon: User,
    color: "candidate-accent",
    gradient: "from-candidate-accent to-candidate-accent/70",
    redirectTo: "/candidate/dashboard",
  },
  employer: {
    title: "Employer",
    description: "Hiring talent for your company",
    icon: Building2,
    color: "employer-accent",
    gradient: "from-employer-accent to-employer-accent/70",
    redirectTo: "/employer/dashboard",
  },
  internal: {
    title: "Internal Team",
    description: "Nordicascent staff access",
    icon: Shield,
    color: "primary",
    gradient: "from-primary to-primary/70",
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
      <div className="hidden lg:flex lg:w-1/2 nordic-gradient p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <div className="bg-primary-foreground/20 p-2 rounded-lg">
              <Mountain className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">Nordicascent</span>
          </Link>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight">
            {selectedRole 
              ? `Welcome, ${roleConfig[selectedRole].title}` 
              : "Join the Nordic talent ecosystem"}
          </h1>
          <p className="text-xl text-primary-foreground/80">
            {selectedRole 
              ? roleConfig[selectedRole].description 
              : "Connect with top companies and talent across the Nordic region."}
          </p>
        </div>
        <div className="flex items-center gap-4 text-primary-foreground/60 text-sm">
          <span>© 2025 Nordicascent</span>
          <span>•</span>
          <a href="#" className="hover:text-primary-foreground">Privacy</a>
          <span>•</span>
          <a href="#" className="hover:text-primary-foreground">Terms</a>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="nordic-gradient p-2 rounded-lg">
                <Mountain className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Nordicascent</span>
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
            <Card className="border-0 shadow-none lg:border lg:shadow-sm">
              <CardHeader className="space-y-1 px-0 lg:px-6">
                <CardTitle className="text-2xl">Get started</CardTitle>
                <CardDescription>Choose how you want to use Nordicascent</CardDescription>
              </CardHeader>
              <CardContent className="px-0 lg:px-6 space-y-4">
                {(Object.entries(roleConfig) as [UserRole, typeof roleConfig.candidate][]).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedRole(key as UserRole)}
                      className={`w-full p-4 rounded-xl border-2 border-border hover:border-${config.color} bg-card hover:bg-muted/50 transition-all group flex items-center justify-between text-left`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{config.title}</h3>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            /* Auth Form */
            <Card className="border-0 shadow-none lg:border lg:shadow-sm">
              <CardHeader className="space-y-1 px-0 lg:px-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${roleConfig[selectedRole].gradient} flex items-center justify-center`}>
                    {(() => {
                      const Icon = roleConfig[selectedRole].icon;
                      return <Icon className="h-5 w-5 text-white" />;
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
              <CardContent className="px-0 lg:px-6">
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

                  <Button 
                    type="submit" 
                    className={`w-full bg-gradient-to-r ${roleConfig[selectedRole].gradient} text-white`}
                    disabled={isLoading}
                  >
                    {isLoading 
                      ? (authMode === "signin" ? "Signing in..." : "Creating account...") 
                      : (authMode === "signin" ? "Sign In" : "Create Account")}
                  </Button>
                </form>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button">
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" type="button">
                    <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </Button>
                </div>

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
