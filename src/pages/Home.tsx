import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  CheckCircle, 
  Building2,
  Users,
  Globe,
  Heart,
  Shield,
  TrendingUp
} from "lucide-react";

const stats = [
  { value: "500+", label: "Engineers Placed" },
  { value: "50+", label: "Nordic Companies" },
  { value: "95%", label: "Retention Rate" },
  { value: "4", label: "Nordic Countries" },
];

const benefits = {
  companies: [
    "Access pre-vetted engineering talent",
    "Reduced hiring risk through structured pipeline",
    "Cultural integration support included",
    "Ongoing retention assistance"
  ],
  candidates: [
    "Clear path to Nordic employment",
    "Skill development and training",
    "Complete relocation support",
    "Long-term career guidance"
  ]
};

const differentiators = [
  { icon: Heart, title: "Human-Centered", description: "We focus on the person, not just the placement. Every journey is supported with mentoring and care." },
  { icon: Globe, title: "Cultural Bridge", description: "Deep understanding of both Indian and Nordic cultures enables successful integration." },
  { icon: Shield, title: "Reduced Risk", description: "Our 7-stage pipeline validates candidates thoroughly before commitment." },
  { icon: TrendingUp, title: "Long-term Success", description: "Follow-up support ensures retention and career growth beyond day one." },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Marketing Focus */}
      <section className="py-20 lg:py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
                Building Bridges Between 
                <span className="nordic-gradient-text"> Talent & Opportunity</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Connecting exceptional engineers from India with forward-thinking Nordic companies. 
                A journey of growth, culture, and lasting success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="btn-professional text-base h-12 px-8">
                  <Link to="/contact">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base h-12 px-8">
                  <Link to="/platform">Explore Our Platform</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden nordic-shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80" 
                  alt="Diverse team of engineers collaborating" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Why Nordic Ascent?</h2>
            <p className="text-muted-foreground">
              We're not just a recruitment agency. We're partners in transformation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {differentiators.map((item) => (
              <Card key={item.title} className="border-border text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Built for Both Sides</h2>
            <p className="text-muted-foreground">
              Structured support for companies and candidates alike.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Nordic Companies</h3>
                <ul className="space-y-3">
                  {benefits.companies.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link to="/contact">Partner With Us</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded bg-secondary/20 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Engineers from India</h3>
                <ul className="space-y-3">
                  {benefits.candidates.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant="outline" asChild>
                  <Link to="/contact">Apply Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brief Process Mention */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Our Process</h2>
            <p className="text-muted-foreground mb-8">
              From initial assessment to successful onboarding, our 7-stage pipeline ensures 
              every candidate is prepared, supported, and set up for long-term success.
            </p>
            <Button asChild className="nordic-gradient nordic-glow">
              <Link to="/platform">
                Learn About Our Pipeline
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Build Bridges?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Whether you're a Nordic company looking for exceptional talent or an engineer 
              ready for a new chapter, we're here to guide your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base h-12 px-8">
                <Link to="/contact">
                  Book a Conversation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
