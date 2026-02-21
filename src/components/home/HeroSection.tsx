import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-nordic-sand">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/5 translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block text-sm font-semibold tracking-widest uppercase text-secondary mb-4">
              Nordic Talent Mobility
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-foreground mb-6">
              Building Bridges Between{" "}
              <span className="bg-gradient-to-r from-primary via-secondary to-nordic-orange bg-clip-text text-transparent">
                Talent & Opportunity
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
              Connecting exceptional engineers from India with forward-thinking Nordic companies. 
              A journey of growth, culture, and lasting success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="btn-professional text-base h-13 px-10 shadow-lg">
                <Link to="/contact">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-13 px-10 border-primary/20 hover:bg-primary/5">
                <Link to="/platform">Explore Our Platform</Link>
              </Button>
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80" 
                alt="Diverse team of engineers collaborating in a modern Nordic office" 
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            {/* Floating accent */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-xl bg-nordic-orange/20 -z-10" />
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-secondary/20 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
