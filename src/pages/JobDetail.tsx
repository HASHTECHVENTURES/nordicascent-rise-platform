import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Loader2, UserPlus } from "lucide-react";
import { useInsightArticle, useJobById } from "@/hooks/useData";
import { loginPathForJobApply, setPendingJobApplication, signupPathForNetwork, jobApplyPath } from "@/lib/pendingJobApplication";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isCandidateVisibleJob } from "@/lib/jobVisibility";
import JobPostingView from "@/components/jobs/JobPostingView";
import type { CandidateJobPosting } from "@/lib/jobPostingDisplay";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { candidate, session } = useAuth();
  const { data: article, isLoading: articleLoading } = useInsightArticle(id);
  const { data: job, isLoading: jobLoading } = useJobById(id);

  const isLoading = articleLoading || jobLoading;
  const jobApplyPathForId = id ? jobApplyPath(id) : "/candidate/jobs";
  const loginApplyPath = id ? loginPathForJobApply(id) : "/login?role=candidate";

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
            <p className="text-sm text-muted-foreground mb-2">{article.category}</p>
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

  if (job && isCandidateVisibleJob(job)) {
    const posting = job as CandidateJobPosting;

    const goApply = () => {
      if (!id) return;
      setPendingJobApplication(id);
      if (!session) {
        navigate(loginApplyPath);
        return;
      }
      if (!candidate) {
        toast({ title: "Candidates only", description: "Sign in as a candidate to apply.", variant: "destructive" });
        return;
      }
      navigate(jobApplyPathForId);
    };

    const applyButton = (
      <Button size="lg" className="nordic-gradient" onClick={goApply}>
        <Briefcase className="h-4 w-4 mr-2" />
        Apply now
      </Button>
    );

    const secondaryButton = (
      <Button size="lg" variant="outline" asChild>
        <Link to={session ? "/candidate/profile" : signupPathForNetwork()}>
          <UserPlus className="h-4 w-4 mr-2" />
          Join our network
        </Link>
      </Button>
    );

    return (
      <div className="flex flex-col">
        <section className="py-10 bg-gradient-to-b from-accent/30 to-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" onClick={() => navigate("/insight")} className="mb-4 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Button>
            <JobPostingView job={posting} applyButton={applyButton} secondaryButton={secondaryButton} />
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
