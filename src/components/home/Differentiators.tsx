import { Heart, Globe, Shield, TrendingUp } from "lucide-react";

const differentiators = [
  { icon: Heart, title: "Human-Centered", description: "We focus on the person, not just the placement. Every journey is supported with mentoring and care." },
  { icon: Globe, title: "Cultural Bridge", description: "Deep understanding of both Indian and Nordic cultures enables successful integration." },
  { icon: Shield, title: "Reduced Risk", description: "Our 7-stage pipeline validates candidates thoroughly before commitment." },
  { icon: TrendingUp, title: "Long-term Success", description: "Follow-up support ensures retention and career growth beyond day one." },
];

export default function Differentiators() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-sm font-semibold tracking-widest uppercase text-secondary mb-3 block">
            Why Us
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">Why Nordic Ascent?</h2>
          <p className="text-muted-foreground text-lg">
            We're not just a recruitment agency. We're partners in transformation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {differentiators.map((item, i) => (
            <div
              key={item.title}
              className="text-center p-8 rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 mx-auto flex items-center justify-center mb-6">
                <item.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
