import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Full-bleed background image */}
      <img
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop&q=80"
        alt="Diverse team of engineers collaborating in a modern Nordic office"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-block text-sm font-semibold tracking-widest uppercase text-white/70 mb-4">
            Nordic Talent Mobility
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-white mb-6">
            Building Bridges Between{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-nordic-orange bg-clip-text text-transparent">
              Talent & Opportunity
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-lg leading-relaxed">
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
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base h-13 px-10 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/platform">Explore Our Platform</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
