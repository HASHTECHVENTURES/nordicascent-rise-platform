import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const JOURNEY = [
  "Preparation and profile",
  "A mentor who has your back",
  "Digital internship to prove yourself",
  "Relocation handled with partners",
  "Support for six months after you arrive",
];

const LOOK_FOR = [
  "Openness and readiness to adapt",
  "Technical strength in your discipline",
  "Motivation for a lasting Nordic career",
];

export default function Engineers() {
  return (
    <div className="flex flex-col">
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-5 leading-tight">
            Build your engineering career in the Nordics.
          </h1>
          <p className="text-lg text-primary-foreground/85 mb-8 leading-relaxed">
            A structured path from a top Indian university to a lasting role in a Nordic company — with cultural preparation, a mentor, and support long after you arrive.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-warning text-warning-foreground hover:opacity-90"
          >
            <Link to="/login?role=candidate&signup=1">Start your journey</Link>
          </Button>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground mb-6">What the journey looks like</h2>
          <ul className="space-y-3">
            {JOURNEY.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <h2 className="text-2xl font-semibold text-foreground mb-6">What we look for</h2>
          <ul className="space-y-3 mb-4">
            {LOOK_FOR.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Being honest about the bar makes the opportunity feel real — this path is for engineers ready to commit.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-3">Stories and outcomes</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Partner universities and the structured programme carry the credibility today. Candidate stories will live here as placements complete.
          </p>
          <Button size="lg" asChild>
            <Link to="/login?role=candidate&signup=1">Create your profile</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
