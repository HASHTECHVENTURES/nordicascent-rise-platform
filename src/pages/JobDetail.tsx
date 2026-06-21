import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useInsightArticle, useJobById, useApplyToJob } from "@/hooks/useData";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isProfileComplete } from "@/lib/profileCompleteness";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidate, session, profile } = useAuth();
  const { data: article, isLoading: articleLoading } = useInsightArticle(id);
  const { data: job, isLoading: jobLoading } = useJobById(id);
  const applyToJob = useApplyToJob();

  const isLoading = articleLoading || jobLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (article) {
    return (
      <div className="flex flex-col">
        <section className="py-12 bg-gradient-to-b from-accent/30 to-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate("/insight")} className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back to Insight
            </Button>
            <Badge variant="secondary" className="mb-4">{article.category}</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-muted-foreground mb-2">{article.author} · {article.created_at.split("T")[0]}</p>
            <p className="text-lg text-muted-foreground">{article.excerpt}</p>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl prose prose-neutral">
            <p className="whitespace-pre-wrap text-muted-foreground">{article.content ?? article.excerpt}</p>
          </div>
        </section>
      </div>
    );
  }

  if (job) {
    const company = job.companies as { name: string; location: string | null } | null;
    const handleApply = async () => {
      if (!session) {
        navigate("/login");
        return;
      }
      if (!candidate) {
        toast({ title: "Candidates only", description: "Sign in as a candidate to apply.", variant: "destructive" });
        return;
      }
      if (!isProfileComplete(profile, candidate)) {
        toast({
          title: "Complete your profile first",
          description: "Add your details and CV in My Profile before applying.",
          variant: "destructive",
        });
        navigate("/candidate/profile");
        return;
      }
      try {
        await applyToJob.mutateAsync(job.id);
        toast({ title: "Application submitted!", description: "The employer will review your profile." });
      } catch (err) {
        toast({ title: "Application failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
      }
    };

    return (
      <div className="flex flex-col">
        <section className="py-12 bg-gradient-to-b from-accent/30 to-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate("/insight")} className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold">{job.title}</h1>
              <Badge variant="secondary">{job.job_type}</Badge>
            </div>
            <p className="text-muted-foreground mb-6">{company?.name} · {job.location}</p>
            <Button size="lg" className="nordic-gradient" onClick={handleApply} disabled={applyToJob.isPending}>
              Apply Now
            </Button>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl space-y-6">
            <Card>
              <CardHeader><CardTitle>About the Role</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground">{job.description ?? "No description provided."}</p></CardContent>
            </Card>
            {(job.requirements ?? []).length > 0 && (
              <Card>
                <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(job.requirements ?? []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-primary mt-1" /><span>{item}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Content not found</h1>
      <Button asChild><Link to="/insight">Back to Insight</Link></Button>
    </div>
  );
}
