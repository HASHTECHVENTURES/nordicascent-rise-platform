import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight } from "lucide-react";

type Step = { name: string; desc: string };

const ENTRY_STEPS: Step[] = [
  { name: "Preparation", desc: "Company and candidate registration feed the rest of the system." },
  { name: "Selection", desc: "Eligibility through selection board — mentor assigned when selected for readiness." },
  { name: "Readiness", desc: "Structured validation of cultural and technical fit before internship." },
  { name: "Activation", desc: "Digital internship with checkpoints, then Final Clearance before relocation." },
  { name: "Relocation", desc: "Coordinated with specialist partners — not resold by Nordic Ascent." },
  { name: "Onboarding", desc: "First weeks on site with structured checkpoints." },
  { name: "Follow-up", desc: "Six-month support with questionnaires and coordinator meetings." },
];

const FAST_STEPS: Step[] = [
  { name: "Preparation", desc: "Company and candidate registration feed the rest of the system." },
  { name: "Selection", desc: "Eligibility through selection board — mentor assigned when selected for readiness." },
  { name: "Readiness", desc: "Structured validation of cultural and technical fit before clearance." },
  { name: "Activation", desc: "Skips internship — Final Clearance after Readiness, then pre-arrival employment." },
  { name: "Relocation", desc: "Coordinated with specialist partners — not resold by Nordic Ascent." },
  { name: "Onboarding", desc: "First weeks on site with structured checkpoints." },
  { name: "Follow-up", desc: "Six-month support with questionnaires and coordinator meetings." },
];

const TRACKS: { label: string; short: string; steps: Step[] }[] = [
  {
    label: "Entry Track",
    short: "Final-year students · 0–12 months experience",
    steps: ENTRY_STEPS,
  },
  {
    label: "Fast Track",
    short: "Accelerated · 1+ years experience · no internship",
    steps: FAST_STEPS,
  },
];

const faqs = [
  { question: "How long does the entire process take?", answer: "The complete pipeline typically takes 6–12 months from initial application to successful onboarding, depending on readiness and the employer’s timeline." },
  { question: "What countries do you place candidates in?", answer: "We focus on the Nordic region: Sweden, Norway, Denmark, and Finland." },
  { question: "Is there a cost for candidates?", answer: "No. Candidates do not pay for our services. Our model is employer-funded." },
  { question: "What kind of mentoring support is provided?", answer: "Mentoring begins during Readiness and continues through Activation with a dedicated company mentor. Meetings follow a shared agenda; observations stay with mentor, company, and admin." },
  { question: "Do candidates need to speak a Nordic language?", answer: "A1-level Norwegian is part of preparation before arrival. Further language training can continue after onboarding." },
];

function TrackColumn({ label, short, steps }: { label: string; short: string; steps: Step[] }) {
  return (
    <div className="min-w-0">
      <div className="mb-6 pb-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{label}</h2>
        <p className="text-sm text-muted-foreground mt-1">{short}</p>
      </div>
      <div className="space-y-6">
        {steps.map((m, i) => (
          <div key={m.name} className="flex gap-4 border-b border-border pb-6 last:border-0 last:pb-0">
            <span className="text-sm font-semibold text-muted-foreground w-8 shrink-0 pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-base font-semibold text-foreground mb-1">{m.name}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold text-primary tracking-tight mb-5">
            How it works
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A structured mobility pipeline — from selection through six-month follow-up — built so Nordic companies hire to stay, and engineers arrive prepared.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-10 lg:gap-16">
            {TRACKS.map((track) => (
              <TrackColumn key={track.label} {...track} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Common questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.question} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-16 text-center">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link to="/companies">
              For companies <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/engineers">
              For engineers <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
