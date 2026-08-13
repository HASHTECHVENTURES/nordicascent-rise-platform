import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Clock, User, Loader2 } from "lucide-react";
import { useInsightArticles } from "@/hooks/useData";

export default function Insight() {
  const { data: articles, isLoading } = useInsightArticles();
  const list = articles ?? [];
  const featured = list[0];
  const rest = list.slice(1);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-semibold text-primary tracking-tight mb-5">
              Insights
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Thoughts on mobility, culture, and building engineering careers across borders.
            </p>
          </div>
        </div>
      </section>

      {featured && (
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden border-border">
              <CardContent className="p-8">
                <Badge variant="secondary" className="w-fit mb-4">
                  {featured.category}
                </Badge>
                <h2 className="text-2xl lg:text-3xl font-semibold mb-4">{featured.title}</h2>
                <p className="text-muted-foreground mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {featured.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {featured.created_at.split("T")[0]}
                  </span>
                </div>
                <Button className="w-fit gap-2" asChild>
                  <Link to={`/insight/${featured.id}`}>
                    Read article <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold mb-8">Recent articles</h2>
          {rest.length === 0 && !featured && (
            <p className="text-muted-foreground text-center py-12">No articles published yet.</p>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {rest.map((article) => (
              <Card key={article.id} className="hover:border-primary/50 transition-colors border-border">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-2">
                    {article.category}
                  </Badge>
                  <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {article.author}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/insight/${article.id}`}>
                        Read <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-6">
          <BookOpen className="h-8 w-8 text-primary mx-auto" />
          <h2 className="text-2xl font-semibold">Want to talk further?</h2>
          <Button size="lg" asChild className="bg-warning text-warning-foreground hover:opacity-90">
            <Link to="/contact">
              Book a demo <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
