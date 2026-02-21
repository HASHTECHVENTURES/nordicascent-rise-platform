import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="relative py-24 bg-primary overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-secondary" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-nordic-orange" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Build Bridges?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-4 leading-relaxed">
            Whether you're a Nordic company looking for exceptional talent or an engineer 
            ready for a new chapter, we're here to guide your journey.
          </p>
          <p className="text-primary-foreground/60 text-sm italic">
            "Nordic Ascent helped us find engineers who truly integrated into our team and culture." 
            — CTO, Nordic Tech Company
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild className="text-base h-13 px-10 shadow-lg">
            <Link to="/contact">
              <Building2 className="mr-2 h-5 w-5" />
              I'm a Company
            </Link>
          </Button>
          <Button
            size="lg"
            asChild
            className="text-base h-13 px-10 bg-nordic-orange text-foreground hover:bg-nordic-orange/90 shadow-lg"
          >
            <Link to="/contact">
              <Users className="mr-2 h-5 w-5" />
              I'm an Engineer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
