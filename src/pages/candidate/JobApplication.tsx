import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobById, useMyApplications, useSubmitJobApplication } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { isCandidateVisibleJob } from "@/lib/jobVisibility";
import { isPreparationComplete } from "@/lib/candidateJourney";
import { canCandidateApply } from "@/lib/candidatePool";
import {
  APPLICATION_MOTIVATION_MAX_WORDS,
  APPLICATION_PDF_ACCEPT,
  applicationDocumentPath,
  countWords,
  type JobApplicationForm,
  validateApplicationPdf,
  validateJobApplication,
} from "@/lib/jobApplication";
import { supabase } from "@/lib/supabase";
import { TRACK_META, type Track } from "@/lib/track";
import ApplicationSubmittedDialog from "@/components/candidate/ApplicationSubmittedDialog";
import { clearPendingJobApplication, loginPathForJobApply, setPendingJobApplication } from "@/lib/pendingJobApplication";

const emptyForm: JobApplicationForm = {
  motivation_statement: "",
  academic_transcript_path: "",
  project_descriptions_text: "",
  project_descriptions_path: "",
  work_experience_path: "",
  portfolio_path: "",
};

export default function CandidateJobApplication() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, candidate, session } = useAuth();
  const { data: job, isLoading } = useJobById(jobId);
  const { data: applications } = useMyApplications();
  const submitApplication = useSubmitJobApplication();
  const [form, setForm] = useState<JobApplicationForm>(emptyForm);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submittedJob, setSubmittedJob] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) setPendingJobApplication(jobId);
  }, [jobId]);

  const track = ((job?.target_track ?? candidate?.track ?? "entry") as Track);
  const alreadyApplied = (applications ?? []).some((a) => a.job_id === jobId);
  const profileComplete = isPreparationComplete(profile, candidate);
  const eligible = canCandidateApply(profile, candidate);

  const uploadPdf = async (field: keyof JobApplicationForm, file: File) => {
    if (!profile?.id || !jobId) return;
    const validation = validateApplicationPdf(file);
    if (!validation.ok) {
      toast({ title: "Invalid file", description: validation.message, variant: "destructive" });
      return;
    }
    setUploading(field);
    try {
      const path = applicationDocumentPath(profile.id, jobId, field, file.name);
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: "application/pdf" });
      if (error) throw error;
      setForm((prev) => ({ ...prev, [field]: path }));
      toast({ title: "File uploaded" });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !jobId) return;
    const validation = validateJobApplication(track, form);
    if (!validation.ok) {
      toast({ title: "Incomplete application", description: validation.message, variant: "destructive" });
      return;
    }
    try {
      const { jobTitle } = await submitApplication.mutateAsync({ jobId, track, ...form });
      clearPendingJobApplication();
      setSubmittedJob(jobTitle);
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (!session) {
    if (jobId) {
      setPendingJobApplication(jobId);
      navigate(loginPathForJobApply(jobId), { replace: true });
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job || !isCandidateVisibleJob(job)) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">This job is no longer available.</p>
        <Button asChild variant="outline">
          <Link to="/candidate/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="space-y-4 max-w-lg">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/candidate/jobs/${jobId}`}>Back to job posting</Link>
        </Button>
        <p className="font-medium">You have already applied for this role.</p>
        <Button asChild>
          <Link to="/candidate/applications">View my applications</Link>
        </Button>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="space-y-4 max-w-lg">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/candidate/jobs/${jobId}`}>Back to job posting</Link>
        </Button>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="font-medium">Complete your profile first</p>
            <p className="text-sm text-muted-foreground">
              Finish registration steps 1–3 before applying. Your profile details will be used automatically.
            </p>
            <Button asChild>
              <Link to="/candidate/profile">Go to profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!eligible) {
    return (
      <div className="space-y-4 max-w-lg">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/candidate/jobs/${jobId}`}>Back to job posting</Link>
        </Button>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-6 space-y-3">
            <p className="font-medium">Not eligible to apply yet</p>
            <p className="text-sm text-muted-foreground">
              Complete your profile and link a partner university to apply. Waitlist candidates cannot apply until approved.
              Alumni may apply again to other open roles.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const motivationWords = countWords(form.motivation_statement);

  return (
    <div className="space-y-6 max-w-2xl">
      <ApplicationSubmittedDialog
        open={!!submittedJob}
        onOpenChange={(open) => {
          if (!open) {
            setSubmittedJob(null);
            navigate("/candidate/applications");
          }
        }}
        jobTitle={submittedJob ?? ""}
      />

      <Button variant="ghost" size="sm" asChild>
        <Link to={`/candidate/jobs/${jobId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to job posting
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-medium">Application for {job.title}</h1>
        <p className="text-muted-foreground mt-1">
          Your profile is already on file. Complete the role-specific fields below.
        </p>
        <Badge variant="secondary" className="mt-2">{TRACK_META[track].label}</Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Motivation statement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="motivation">Why this role and company? (max {APPLICATION_MOTIVATION_MAX_WORDS} words)</Label>
            <Textarea
              id="motivation"
              rows={8}
              value={form.motivation_statement}
              onChange={(e) => setForm({ ...form, motivation_statement: e.target.value })}
              placeholder="Explain your motivation for this specific role..."
            />
            <p className={`text-xs ${motivationWords > APPLICATION_MOTIVATION_MAX_WORDS ? "text-destructive" : "text-muted-foreground"}`}>
              {motivationWords} / {APPLICATION_MOTIVATION_MAX_WORDS} words
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Academic transcripts</CardTitle>
          </CardHeader>
          <CardContent>
            <PdfUploadField
              label="Upload transcript (PDF, required)"
              uploading={uploading === "academic_transcript_path"}
              uploaded={Boolean(form.academic_transcript_path)}
              onFile={(f) => uploadPdf("academic_transcript_path", f)}
            />
          </CardContent>
        </Card>

        {track === "entry" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Project descriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projects">Describe your projects (text)</Label>
                <Textarea
                  id="projects"
                  rows={6}
                  value={form.project_descriptions_text}
                  onChange={(e) => setForm({ ...form, project_descriptions_text: e.target.value })}
                  placeholder="Describe academic or personal projects relevant to this role..."
                />
              </div>
              <PdfUploadField
                label="Or upload project document (PDF)"
                uploading={uploading === "project_descriptions_path"}
                uploaded={Boolean(form.project_descriptions_path)}
                onFile={(f) => uploadPdf("project_descriptions_path", f)}
              />
            </CardContent>
          </Card>
        )}

        {track === "fast" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Work experience breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <PdfUploadField
                  label="Upload experience breakdown (PDF, required)"
                  uploading={uploading === "work_experience_path"}
                  uploaded={Boolean(form.work_experience_path)}
                  onFile={(f) => uploadPdf("work_experience_path", f)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Portfolio / case examples</CardTitle>
              </CardHeader>
              <CardContent>
                <PdfUploadField
                  label="Upload portfolio (PDF, optional)"
                  uploading={uploading === "portfolio_path"}
                  uploaded={Boolean(form.portfolio_path)}
                  onFile={(f) => uploadPdf("portfolio_path", f)}
                  optional
                />
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex justify-end gap-3 pb-8">
          <Button type="button" variant="outline" asChild>
            <Link to={`/candidate/jobs/${jobId}`}>Cancel</Link>
          </Button>
          <Button type="submit" size="lg" disabled={submitApplication.isPending}>
            {submitApplication.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PdfUploadField({
  label,
  uploading,
  uploaded,
  onFile,
  optional,
}: {
  label: string;
  uploading: boolean;
  uploaded: boolean;
  onFile: (file: File) => void;
  optional?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}{optional ? " (optional)" : ""}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
          <label className="cursor-pointer">
            {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Choose PDF
            <Input
              type="file"
              accept={APPLICATION_PDF_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </label>
        </Button>
        {uploaded && (
          <Badge className="bg-success text-success-foreground gap-1">
            <FileText className="h-3 w-3" />
            Uploaded
          </Badge>
        )}
      </div>
    </div>
  );
}
