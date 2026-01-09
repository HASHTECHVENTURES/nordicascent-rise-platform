import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Target, Heart, Lightbulb, Users, ArrowRight, Linkedin, Twitter } from "lucide-react";

const values = [
  { icon: Target, title: "Excellence", description: "We strive for excellence in everything we do, from code to customer service." },
  { icon: Heart, title: "Empathy", description: "We put people first, understanding and addressing real workforce challenges." },
  { icon: Lightbulb, title: "Innovation", description: "We continuously evolve our platform to stay ahead of workforce trends." },
  { icon: Users, title: "Collaboration", description: "We believe in the power of teamwork, both internally and with our clients." },
];

const team = [
  { name: "Anders Björkman", role: "CEO & Co-Founder", bio: "Former VP of People at Spotify, 15+ years in HR tech.", initials: "AB", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80" },
  { name: "Katarina Holm", role: "CTO & Co-Founder", bio: "Ex-Google engineer, passionate about building scalable systems.", initials: "KH", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80" },
  { name: "Henrik Larsson", role: "Chief Product Officer", bio: "Product leader with background at Klarna and Wise.", initials: "HL", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80" },
  { name: "Sofia Andersson", role: "VP of Customer Success", bio: "10+ years helping enterprises transform their HR operations.", initials: "SA", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=80" },
];

const milestones = [
  { year: "2019", event: "Nordicascent founded in Stockholm" },
  { year: "2020", event: "Launched first version of the platform" },
  { year: "2021", event: "Reached 100 enterprise customers" },
  { year: "2022", event: "Expanded to all Nordic countries" },
  { year: "2023", event: "Series B funding, 500+ customers" },
  { year: "2024", event: "AI-powered insights launched" },
];

export default function About() {
  return (
    <div className="flex flex-col">
      <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Our Mission is to <span className="nordic-gradient-text">Elevate</span> Every Team
              </h1>
              <p className="text-xl text-muted-foreground">
                We're building the future of workforce management with Nordic design principles: simplicity, functionality, and human-centered innovation.
              </p>
            </div>
            <div className="relative animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-card rounded-2xl border border-border overflow-hidden nordic-shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80" 
                  alt="Diverse team collaborating in modern workspace"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Our Story</h2>
            <div className="text-lg text-muted-foreground space-y-4">
              <p>Nordicascent was born from a simple observation: workforce management tools were either too complex for users or too simple for enterprise needs.</p>
              <p>Founded in Stockholm in 2019 by a team of HR tech veterans and software engineers, we set out to create a platform that combines the elegance of Nordic design with the power needed by modern organizations.</p>
              <p>Today, we serve over 500 companies across the Nordics and Europe, helping them train, manage, and empower their teams to reach new heights.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">The principles that guide everything we do.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Card key={value.title} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="h-14 w-14 rounded-xl bg-accent mx-auto flex items-center justify-center">
                    <value.icon className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Leadership Team</h2>
            <p className="text-lg text-muted-foreground">Meet the people driving Nordicascent's mission forward.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <Card key={member.name} className="overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className="h-24 w-24 rounded-full mx-auto overflow-hidden border-2 border-primary/20">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                  <div className="flex justify-center gap-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Linkedin className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Twitter className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-lg text-muted-foreground">Key milestones in our growth story.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
              <div className="space-y-8">
                {milestones.map((milestone, i) => (
                  <div key={milestone.year} className="relative pl-20 animate-slide-in-left" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="absolute left-5 w-6 h-6 rounded-full nordic-gradient flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <span className="text-sm font-bold text-primary">{milestone.year}</span>
                      <p className="text-foreground">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Join Our Journey</h2>
            <p className="text-lg text-muted-foreground">We're always looking for talented people who share our passion for building great products.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="nordic-gradient nordic-glow">
                <Link to="/careers">View Open Positions<ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild><Link to="/contact">Get in Touch</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
