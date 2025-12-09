import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, GraduationCap, BarChart3, Shield, ArrowRight, CheckCircle, Briefcase, UserCog, LineChart } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Employee Management",
    description: "Comprehensive employee lifecycle management from onboarding to offboarding.",
    features: ["Centralized employee directory", "Document management", "Performance tracking", "Automated workflows", "Custom fields & attributes", "Organizational charts"],
  },
  {
    icon: GraduationCap,
    title: "Training & Learning",
    description: "Build a culture of continuous learning with our LMS platform.",
    features: ["Course creation tools", "Progress tracking", "Certification management", "Learning paths", "Quiz & assessments", "Mobile learning"],
  },
  {
    icon: BarChart3,
    title: "Reporting & Insights",
    description: "Data-driven decision making with powerful analytics tools.",
    features: ["Real-time dashboards", "Custom report builder", "Scheduled reports", "Export to PDF/CSV", "Trend analysis", "Benchmarking"],
  },
  {
    icon: Shield,
    title: "Admin & Compliance",
    description: "Enterprise-grade security and compliance management.",
    features: ["Role-based access control", "Audit logging", "GDPR compliance tools", "SSO integration", "Data encryption", "Backup & recovery"],
  },
];

const useCases = [
  { icon: UserCog, title: "For HR Teams", description: "Streamline HR operations with automated workflows, self-service portals, and comprehensive employee records management." },
  { icon: Briefcase, title: "For Managers", description: "Empower managers with team insights, training assignments, performance reviews, and approval workflows." },
  { icon: LineChart, title: "For Executives", description: "Strategic workforce insights with executive dashboards, workforce planning tools, and ROI tracking." },
];

const faqs = [
  { question: "How long does implementation take?", answer: "Most organizations are fully onboarded within 2-4 weeks. Our dedicated implementation team guides you through every step, from data migration to training your administrators." },
  { question: "Can I integrate with existing HR systems?", answer: "Yes! Nordicascent offers robust integrations with popular HRIS, payroll, and SSO providers. Our API also enables custom integrations for enterprise needs." },
  { question: "Is my data secure?", answer: "Absolutely. We employ bank-level encryption, regular security audits, and are fully GDPR compliant. Your data is stored in secure Nordic data centers with 99.9% uptime SLA." },
  { question: "What kind of support do you offer?", answer: "All plans include email support. Pro and Enterprise plans include priority support with dedicated account managers, phone support, and custom SLAs." },
];

export default function Services() {
  return (
    <div className="flex flex-col">
      <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Platform <span className="nordic-gradient-text">Capabilities</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">Everything you need to manage, develop, and empower your workforce — all in one elegant, Nordic-designed platform.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="nordic-gradient nordic-glow">
                <Link to="/contact">Request Demo<ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild><Link to="/contact">Contact Sales</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, i) => (
              <Card key={service.title} className="overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl nordic-gradient flex items-center justify-center flex-shrink-0">
                      <service.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                      <p className="text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-2 gap-3">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Every Role</h2>
            <p className="text-lg text-muted-foreground">Tailored experiences for everyone in your organization.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <Card key={useCase.title} className="text-center p-8 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-0 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                    <useCase.icon className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">Got questions? We've got answers.</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform Your Workforce Management?</h2>
            <p className="text-lg text-muted-foreground">Schedule a personalized demo and see how Nordicascent can help your organization thrive.</p>
            <Button size="lg" asChild className="nordic-gradient nordic-glow">
              <Link to="/contact">Book Your Demo<ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
