import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, BarChart3, Shield, ArrowRight, CheckCircle, Zap, Globe, Award } from "lucide-react";
const features = [{
  icon: Users,
  title: "Employee Management",
  description: "Centralized employee directory with profiles, documents, and performance tracking."
}, {
  icon: GraduationCap,
  title: "Training & Learning",
  description: "Comprehensive training modules with progress tracking and certifications."
}, {
  icon: BarChart3,
  title: "Reporting & Insights",
  description: "Real-time analytics and customizable reports for data-driven decisions."
}, {
  icon: Shield,
  title: "Admin & Compliance",
  description: "Role-based access control, audit logs, and regulatory compliance tools."
}];
const steps = [{
  number: "01",
  title: "Quick Setup",
  description: "Get your workspace configured in minutes with our guided onboarding."
}, {
  number: "02",
  title: "Import Your Team",
  description: "Easily import employee data or add team members individually."
}, {
  number: "03",
  title: "Start Growing",
  description: "Launch trainings, track performance, and watch your team ascend."
}];
const stats = [{
  value: "500+",
  label: "Companies Trust Us"
}, {
  value: "50K+",
  label: "Active Users"
}, {
  value: "99.9%",
  label: "Uptime SLA"
}, {
  value: "4.9/5",
  label: "Customer Rating"
}];
export default function Home() {
  return <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-background to-background" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-accent/50 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                <Zap className="h-4 w-4" />
                <span>Now with AI-powered insights</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Empowering Teams to{" "}
                <span className="nordic-gradient-text">Rise Higher</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg">
                Training, internships, relocation, performance, and workforce development — all in one structured Nordic talent pipeline platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="nordic-gradient nordic-glow text-lg h-12 px-8">
                  <Link to="/contact">
                    Book a Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8">
                  <Link to="/services">Explore Features</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  {["EL", "IS", "LJ", "AN"].map((initials, i) => <div key={i} className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium">
                      {initials}
                    </div>)}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">500+</span> companies growing with Nordicascent
                </p>
              </div>
            </div>

            <div className="relative animate-fade-in-up" style={{
            animationDelay: "0.2s"
          }}>
              <div className="relative bg-card rounded-2xl border border-border nordic-shadow-lg overflow-hidden">
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-3xl font-bold">87%</p>
                    </div>
                    <div className="h-16 w-16 rounded-full nordic-gradient flex items-center justify-center">
                      <Award className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[87%] nordic-gradient rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[{
                    label: "Employees",
                    value: "156"
                  }, {
                    label: "Trainings",
                    value: "24"
                  }, {
                    label: "Reports",
                    value: "12"
                  }].map(stat => <div key={stat.label} className="text-center p-3 bg-secondary/50 rounded-lg">
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>)}
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-success text-success-foreground px-4 py-2 rounded-lg shadow-lg animate-float">
                <CheckCircle className="h-5 w-5 inline mr-2" />
                Training Complete
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Manage Your Workforce
            </h2>
            <p className="text-lg text-muted-foreground">
              A complete platform designed with Nordic simplicity and enterprise capability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => <Card key={feature.title} className="group hover:border-primary/50 transition-all duration-300 animate-fade-in-up" style={{
            animationDelay: `${i * 0.1}s`
          }}>
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">The Nordicascent Journey: M1–M7 Talent Pipeline</h2>
            <p className="text-lg text-muted-foreground">
              A proven seven-stage journey that prepares global talent for successful careers in the Nordics.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{
            title: "M1 — Company Alignment",
            desc: "Define workforce needs, roles, competencies."
          }, {
            title: "M2 — Candidate Selection & Matching",
            desc: "Screening, interviews, profiling, shortlist."
          }, {
            title: "M3 — Preparation Phase",
            desc: "Light training, communication practice, mentor support."
          }, {
            title: "M4 — Relocation Preparation",
            desc: "Culture, language, documentation, housing."
          }, {
            title: "M5 — Digital Internship",
            desc: "Project-based internship with Nordic companies."
          }, {
            title: "M6 — Physical Relocation & Onboarding",
            desc: "Move to Norway, settle in, start work."
          }, {
            title: "M7 — Long-Term Follow-Up",
            desc: "Check-ins, mentoring, integration, retention."
          }].map((stage, i) => <Card key={stage.title} className="h-full animate-fade-in-up" style={{
            animationDelay: `${i * 0.05}s`
          }}>
                <CardContent className="p-6 space-y-3">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 text-primary font-semibold">{stage.title.slice(0, 2)}</div>
                  <h3 className="text-lg font-semibold">{stage.title}</h3>
                  <p className="text-muted-foreground text-sm">{stage.desc}</p>
                </CardContent>
              </Card>)}
          </div>
          <div className="flex justify-center mt-10">
            <Button size="lg" asChild className="nordic-gradient nordic-glow">
              <Link to="/services">Explore the Complete M1–M7 Journey →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Who We Help */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Who We Help</h2>
            <p className="text-lg text-muted-foreground">Structured support for every stakeholder in the talent journey.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[{
            title: "Students & Candidates",
            desc: "Learn, train, intern, relocate."
          }, {
            title: "Nordic Companies",
            desc: "Hire trained, relocation-ready talent."
          }, {
            title: "Mentors & Admins",
            desc: "Review progress, guide development."
          }].map((item, i) => <Card key={item.title} className="text-center p-8 animate-fade-in-up" style={{
            animationDelay: `${i * 0.1}s`
          }}>
                <CardContent className="p-0 space-y-3">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How Nordicascent Works</h2>
            <p className="text-lg text-muted-foreground">
              Get started in three simple steps and transform your workforce management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => <div key={step.number} className="relative animate-fade-in-up" style={{
            animationDelay: `${i * 0.15}s`
          }}>
                <div className="text-6xl font-bold text-primary/10 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 nordic-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => <div key={stat.label} className="text-center text-primary-foreground animate-fade-in" style={{
            animationDelay: `${i * 0.1}s`
          }}>
                <p className="text-4xl lg:text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Trusted by Teams Across the Nordics and Beyond
              </h2>
              <p className="text-lg text-muted-foreground">
                From Stockholm to Helsinki, Copenhagen to Oslo — organizations of all sizes rely on Nordicascent to manage their most valuable asset: their people.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {["Enterprise Security", "GDPR Compliant", "Multi-language Support", "24/7 Support"].map(item => <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>)}
              </div>
            </div>
            <div className="relative">
              <div className="bg-card rounded-2xl border border-border p-8 nordic-shadow">
                <Globe className="h-48 w-48 mx-auto text-primary/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl nordic-gradient p-12 lg:p-20 text-center">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground">
                Ready to Elevate Your Workforce?
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Join hundreds of companies already using Nordicascent to empower their teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" asChild className="text-lg h-12 px-8 bg-background text-foreground hover:bg-background/90">
                  <Link to="/contact">
                    Book a Consultation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg h-12 px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>;
}