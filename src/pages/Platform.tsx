import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, ArrowRight, Heart, Building2, Users } from "lucide-react";

const companyBenefits = [
  "Access pre-vetted, pipeline-ready engineering talent",
  "Reduce time-to-hire with structured candidate preparation",
  "Cultural alignment training before Day 1",
  "Dedicated mentoring support throughout the process",
];

const candidateBenefits = [
  "Structured career pathway to Nordic tech companies",
  "Interview and technical preparation included",
  "Visa, relocation, and cultural onboarding support",
  "Ongoing mentoring and follow-up after placement",
];

const faqs = [
  { question: "How long does the entire process take?", answer: "The complete pipeline typically takes 6-12 months from initial application to successful onboarding, depending on the candidate's readiness and the employer's timeline." },
  { question: "What countries do you place candidates in?", answer: "We focus on the Nordic region: Sweden, Norway, Denmark, and Finland." },
  { question: "Is there a cost for candidates?", answer: "No, candidates do not pay for our services. Our model is employer-funded." },
  { question: "What kind of mentoring support is provided?", answer: "Mentoring begins during Readiness and continues through Internship and Onboarding with a dedicated company mentor. After onboarding, follow-up is available as an add-on service." },
  { question: "What happens if a candidate doesn't pass the internship phase?", answer: "If a hire decision is not made after the official internship, the candidate receives feedback and guidance on next steps. They may re-enter the pipeline for other opportunities." },
  { question: "Do candidates need to speak a Nordic language?", answer: "A1-level Norwegian is part of the preparation before arrival. A2-level language training is available as part of the follow-up add-on service after onboarding." },
  { question: "What industries do you cover?", answer: "We primarily serve the technology sector, including software development, data engineering, DevOps, UX design, and product management roles across Nordic companies." },
  { question: "How is the internship structured?", answer: "The internship has two phases: an official academic internship (8-10 weeks) and, upon a positive hire decision, a professional pre-employment engagement where the candidate begins contributing to real projects." },
];

export default function Platform() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Our <span className="nordic-gradient-text">Platform</span></h1>
          <p className="text-xl text-muted-foreground mb-8">A proven process that prepares engineers for successful careers in the Nordics — and gives companies access to exceptional, pipeline-ready talent.</p>
          <Button size="lg" asChild className="nordic-gradient nordic-glow"><Link to="/contact">Get Started<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
        </div>
      </section>

      {/* Built for Both Sides */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Both Sides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Companies */}
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Nordic Companies</h3>
                <ul className="space-y-3">
                  {companyBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" asChild>
                  <Link to="/contact">Hire with Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>

            {/* Candidates */}
            <Card className="border-secondary/20">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Engineers from India</h3>
                <ul className="space-y-3">
                  {candidateBenefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" className="mt-6 w-full" asChild>
                  <Link to="/contact">Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Continuous Mentoring Callout */}
      <section className="py-16 bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl flex items-center gap-6">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">Continuous Mentoring</h3>
            <p className="text-muted-foreground">Every candidate is paired with a dedicated mentor from their destination company throughout the journey — from readiness through onboarding.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-muted-foreground mb-8">Contact us to learn more about our platform.</p>
        <Button size="lg" asChild className="nordic-gradient nordic-glow"><Link to="/contact">Contact Us<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
      </section>
    </div>
  );
}
