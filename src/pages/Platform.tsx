import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ClipboardCheck, UserCheck, CheckCircle2, Briefcase, MapPin, Building2, Users, ArrowRight, CheckCircle, Heart } from "lucide-react";

const pipelineStages = [
  { name: "Preparation", description: "Initial readiness assessment and profile completion.", icon: ClipboardCheck, duration: "1-2 weeks" },
  { name: "Selection", description: "Screening, interviews, and company matching.", icon: UserCheck, duration: "2-4 weeks" },
  { name: "Readiness", description: "Technical, social, and cultural validation.", icon: CheckCircle2, duration: "4-6 weeks" },
  { name: "Internship", description: "Project-based digital engagement with the Nordic company.", icon: Briefcase, duration: "3-6 months" },
  { name: "Relocation", description: "Visa, housing, language courses, and cultural preparation.", icon: MapPin, duration: "1-3 months" },
  { name: "Onboarding", description: "Physical arrival and workplace integration.", icon: Building2, duration: "1-2 months" },
  { name: "Follow-up", description: "Long-term support and career development.", icon: Users, duration: "Ongoing" },
];

const faqs = [
  { question: "How long does the entire process take?", answer: "The complete pipeline typically takes 6-12 months from initial application to successful onboarding." },
  { question: "What countries do you place candidates in?", answer: "We focus on the Nordic region: Sweden, Norway, Denmark, and Finland." },
  { question: "Is there a cost for candidates?", answer: "No, candidates do not pay for our services. Our model is employer-funded." },
  { question: "What kind of mentoring support is provided?", answer: "Mentoring begins during Readiness and continues through Internship and Follow-up with a dedicated company mentor." },
];

export default function Platform() {
  return (
    <div className="flex flex-col">
      <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">The <span className="nordic-gradient-text">7-Stage Pipeline</span></h1>
          <p className="text-xl text-muted-foreground mb-8">A proven process that prepares engineers for successful careers in the Nordics.</p>
          <Button size="lg" asChild className="nordic-gradient nordic-glow"><Link to="/contact">Get Started<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-6">
          {pipelineStages.map((stage, i) => (
            <Card key={stage.name}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl nordic-gradient flex items-center justify-center flex-shrink-0">
                  <stage.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold">Stage {i + 1}: {stage.name}</h3>
                    <span className="text-sm text-primary">{stage.duration}</span>
                  </div>
                  <p className="text-muted-foreground">{stage.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="py-16 bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl flex items-center gap-6">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Continuous Mentoring</h3>
            <p className="text-muted-foreground">Every candidate is paired with a dedicated mentor from their destination company throughout the journey.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-border rounded-lg px-6">
                <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground mb-8">Contact us to learn more about our platform.</p>
        <Button size="lg" asChild className="nordic-gradient nordic-glow"><Link to="/contact">Contact Us<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
      </section>
    </div>
  );
}