import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowRight, BookOpen, Clock, User, Globe, Heart, Lightbulb, TrendingUp } from "lucide-react";

const featuredArticle = {
  id: 1,
  title: "The Future of Global Mobility: Bridging Cultures Through Work",
  excerpt: "How international talent mobility is reshaping the way we think about careers, culture, and human connection in an increasingly interconnected world.",
  author: "Anders Björkman",
  readTime: "8 min read",
  date: "2026-01-28",
  category: "Thought Leadership",
  image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop&q=80",
};

const articles = [
  {
    id: 2,
    title: "Nordic Work Culture: What Makes It Different",
    excerpt: "An exploration of flat hierarchies, work-life balance, and the philosophy behind Scandinavian workplace success.",
    author: "Katarina Holm",
    readTime: "5 min read",
    date: "2026-01-21",
    category: "Culture",
    icon: Globe,
  },
  {
    id: 3,
    title: "The Human Side of Relocation",
    excerpt: "Moving across continents is more than logistics—it's a journey of personal growth and resilience.",
    author: "Sofia Andersson",
    readTime: "6 min read",
    date: "2026-01-14",
    category: "Personal Growth",
    icon: Heart,
  },
  {
    id: 4,
    title: "Building Bridges, Not Just Careers",
    excerpt: "Why successful talent mobility requires understanding the deeper connections between people and places.",
    author: "Henrik Larsson",
    readTime: "4 min read",
    date: "2026-01-07",
    category: "Philosophy",
    icon: Lightbulb,
  },
  {
    id: 5,
    title: "The Evolution of Remote Work and Global Teams",
    excerpt: "How distributed teams are changing our understanding of collaboration and cultural exchange.",
    author: "Anders Björkman",
    readTime: "7 min read",
    date: "2025-12-28",
    category: "Trends",
    icon: TrendingUp,
  },
];

export default function Insight() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="nordic-gradient-text">Insight</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thoughts on mobility, culture, and the human journey of building careers across borders.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden animate-fade-in-up">
            <div className="grid lg:grid-cols-2">
              <div className="relative h-64 lg:h-auto overflow-hidden">
                <img 
                  src={featuredArticle.image} 
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge variant="secondary" className="w-fit mb-4">{featuredArticle.category}</Badge>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4">{featuredArticle.title}</h2>
                <p className="text-muted-foreground mb-6">{featuredArticle.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featuredArticle.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featuredArticle.readTime}
                  </span>
                </div>
                <Button className="w-fit gap-2">
                  Read Article
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recent Articles</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article, i) => (
              <Card key={article.id} className="hover:border-primary/50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <article.icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">{article.category}</Badge>
                      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {article.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          Read
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Stay Inspired</h2>
            <p className="text-muted-foreground">
              Subscribe to receive our latest insights on mobility, culture, and building meaningful careers across borders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1"
              />
              <Button className="nordic-gradient nordic-glow">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              By subscribing, you agree to our privacy policy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Ready to Start Your Journey?</h2>
            <p className="text-muted-foreground">
              Whether you're a company seeking talent or an engineer exploring opportunities, we're here to help you build bridges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="nordic-gradient nordic-glow">
                <Link to="/contact">
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/about">Learn About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
