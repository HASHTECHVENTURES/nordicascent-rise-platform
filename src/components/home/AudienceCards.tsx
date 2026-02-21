import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Building2, Users, ArrowRight } from "lucide-react";

const benefits = {
  companies: [
    "Access pre-vetted engineering talent",
    "Reduced hiring risk through structured pipeline",
    "Cultural integration support included",
    "Ongoing retention assistance",
  ],
  candidates: [
    "Clear path to Nordic employment",
    "Skill development and training",
    "Complete relocation support",
    "Long-term career guidance",
  ],
};

export default function AudienceCards() {
  return (
    <section className="py-24 bg-nordic-sand">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-widest uppercase text-secondary mb-3 block">
            Who We Serve
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Built for Both Sides</h2>
          <p className="text-muted-foreground text-lg">
            Structured support for companies and candidates alike.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Companies Card */}
          <div className="bg-card rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-foreground">Nordic Companies</h3>
            <ul className="space-y-4 mb-8">
              {benefits.companies.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full h-12" asChild>
              <Link to="/contact">
                Partner With Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {/* Candidates Card */}
          <div className="bg-card rounded-2xl p-10 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary/15 to-secondary/5 flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-foreground">Engineers from India</h3>
            <ul className="space-y-4 mb-8">
              {benefits.candidates.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full h-12" variant="secondary" asChild>
              <Link to="/contact">
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
