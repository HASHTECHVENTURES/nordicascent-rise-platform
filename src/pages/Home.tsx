import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  CheckCircle, 
  ClipboardCheck,
  UserCheck,
  GraduationCap,
  Briefcase,
  MapPin,
  Building2,
  Users,
  Globe
} from "lucide-react";

const pipelineStages = [
  { name: "Preparation", description: "Initial readiness assessment and profile completion", icon: ClipboardCheck },
  { name: "Selection", description: "Screening, interviews, and company matching", icon: UserCheck },
  { name: "Trainee", description: "Digital validation of technical skills", icon: GraduationCap },
  { name: "Internship", description: "Project-based engagement with Nordic company", icon: Briefcase },
  { name: "Relocation", description: "Visa, housing, and documentation support", icon: MapPin },
  { name: "Onboarding", description: "Physical arrival and workplace integration", icon: Building2 },
  { name: "Follow-up", description: "Long-term support and career development", icon: Users },
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

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-medium leading-tight text-foreground mb-6">
                Engineering Talent from India to the Nordics
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                A structured mobility pipeline connecting exceptional engineers with leading Nordic companies. End-to-end support from selection to successful integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="btn-professional text-base h-12 px-8">
                  <Link to="/contact">
                    Partner With Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base h-12 px-8">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="rounded overflow-hidden">
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

      {/* Pipeline Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-medium mb-4 text-foreground">The 7-Stage Mobility Pipeline</h2>
            <p className="text-muted-foreground">
              A proven process that prepares engineers for successful careers in the Nordics.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {pipelineStages.slice(0, 4).map((stage, i) => (
              <Card key={stage.name} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <stage.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Stage {i + 1}</span>
                  </div>
                  <h3 className="font-medium mb-2">{stage.name}</h3>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {pipelineStages.slice(4).map((stage, i) => (
              <Card key={stage.name} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <stage.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">Stage {i + 5}</span>
                  </div>
                  <h3 className="font-medium mb-2">{stage.name}</h3>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-medium mb-4 text-foreground">Who We Serve</h2>
            <p className="text-muted-foreground">
              Structured support for both sides of the talent journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-4">Nordic Companies</h3>
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
                <h3 className="text-xl font-medium mb-4">Engineers from India</h3>
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

      {/* Global Reach */}
      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-medium mb-4 text-foreground">
                India to the Nordics
              </h2>
              <p className="text-muted-foreground mb-6">
                We specialize in connecting engineering talent from India with companies across Norway, Sweden, Denmark, and Finland. Our structured approach ensures successful transitions and long-term retention.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {["End-to-end Support", "Visa Assistance", "Cultural Training", "Ongoing Mentorship"].map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="bg-muted/50 rounded p-12">
                <Globe className="h-32 w-32 text-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-medium text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/80 mb-8">
              Whether you're a Nordic company looking for talent or an engineer seeking opportunities, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base h-12 px-8">
                <Link to="/contact">
                  Contact Us
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
