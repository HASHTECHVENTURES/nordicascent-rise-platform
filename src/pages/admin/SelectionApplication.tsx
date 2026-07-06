import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import StepDecisionButtons from "@/components/selection/StepDecisionButtons";
import {
  useAdminSelectionApplication,
  useAdminJobSelectionApplications,
  useAssignMentorToApplication,
  useAdminCompanyMentors,
  useActivateHoldCandidate,
  useRefreshEligibilityChecks,
  useSelectionBoardDecision,
  useSelectionStepDecision,
} from "@/hooks/useSelection";
import {
  SELECTION_STEPS,
  buildOffeeCsvRows,
  canActivateHold,
  countSelectedForJob,
  downloadCsv,
  getSelectionStepFromStatus,
  isReadinessUnlocked,
  isStepOverdue,
  maxSelectionsForJob,
  selectionStatusLabel,
  type EligibilityAutoChecks,
  type StepDecision,
} from "@/lib/selectionModule";
import type { Track } from "@/lib/track";
import MentorProgramPanel from "@/components/mentor/MentorProgramPanel";
import { isMentorAssignmentOverdue } from "@/lib/mentorProgram";

const AdminSelectionApplication = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: app, isLoading, isError, error } = useAdminSelectionApplication(applicationId);
  const { data: jobApplications } = useAdminJobSelectionApplications(app?.job_id, "all");
  const decide = useSelectionStepDecision();
  const board = useSelectionBoardDecision();
  const refreshChecks = useRefreshEligibilityChecks();
  const assignMentor = useAssignMentorToApplication();
  const activateHold = useActivateHoldCandidate();
  const { toast } = useToast();

  const companyId = app?.jobs?.company_id;
  const { data: mentors } = useAdminCompanyMentors(companyId);

  const [eligibilityNotes, setEligibilityNotes] = useState("");
  const [offeeTechnical, setOffeeTechnical] = useState("");
  const [offeeOpen, setOffeeOpen] = useState("");
  const [offeeDate, setOffeeDate] = useState("");
  const [offeeNotes, setOffeeNotes] = useState("");
  const [techDigitalDate, setTechDigitalDate] = useState("");
  const [techDigitalNotes, setTechDigitalNotes] = useState("");
  const [techF2fDate, setTechF2fDate] = useState("");
  const [techF2fFormat, setTechF2fFormat] = useState("");
  const [techCompanyParticipated, setTechCompanyParticipated] = useState(false);
  const [techScore, setTechScore] = useState("");
  const [techCognitive, setTechCognitive] = useState("");
  const [techAssessorNotes, setTechAssessorNotes] = useState("");
  const [motDate, setMotDate] = useState("");
  const [motFormat, setMotFormat] = useState("");
  const [motCompanyParticipated, setMotCompanyParticipated] = useState(false);
  const [motScore, setMotScore] = useState("");
  const [motNotes, setMotNotes] = useState("");
  const [boardRec, setBoardRec] = useState<"recommended" | "not_recommended">("recommended");
  const [boardReason, setBoardReason] = useState("");
  const [boardDecision, setBoardDecision] = useState<"selected" | "hold" | "rejected">("selected");
  const [mentorId, setMentorId] = useState("");

  useEffect(() => {
    if (!app) return;
    setEligibilityNotes(app.eligibility_admin_notes ?? "");
    setOffeeTechnical(app.offee_technical_score != null ? String(app.offee_technical_score) : "");
    setOffeeOpen(app.offee_open_mindedness_score != null ? String(app.offee_open_mindedness_score) : "");
    setOffeeDate(app.offee_assessed_at ?? "");
    setOffeeNotes(app.offee_notes ?? "");
    setTechDigitalDate(app.technical_digital_date ?? "");
    setTechDigitalNotes(app.technical_digital_notes ?? "");
    setTechF2fDate(app.technical_f2f_date ?? "");
    setTechF2fFormat(app.technical_f2f_format ?? "");
    setTechCompanyParticipated(Boolean(app.technical_company_participated));
    setTechScore(app.technical_score != null ? String(app.technical_score) : "");
    setTechCognitive(app.technical_cognitive_score != null ? String(app.technical_cognitive_score) : "");
    setTechAssessorNotes(app.technical_assessor_notes ?? "");
    setMotDate(app.motivation_session_date ?? "");
    setMotFormat(app.motivation_format ?? "");
    setMotCompanyParticipated(Boolean(app.motivation_company_participated));
    setMotScore(app.motivation_score != null ? String(app.motivation_score) : "");
    setMotNotes(app.motivation_session_notes ?? "");
    setBoardRec((app.board_admin_recommendation as "recommended" | "not_recommended") ?? "recommended");
    setBoardReason(app.board_admin_reason ?? "");
    setBoardDecision((app.board_company_decision as "selected" | "hold" | "rejected") ?? "selected");
    setMentorId(app.assigned_mentor_id ?? "");
  }, [app]);

  useEffect(() => {
    if (app?.id && !app.eligibility_auto_checks) {
      refreshChecks.mutate(app.id);
    }
  }, [app?.id, app?.eligibility_auto_checks]);

  const handleStepDecision = async (step: 1 | 2 | 3 | 4, decision: StepDecision) => {
    if (!app) return;
    try {
      let fields: Record<string, unknown> = {};
      if (step === 1) fields = { eligibility_admin_notes: eligibilityNotes.trim() || null };
      if (step === 2) {
        fields = {
          offee_technical_score: offeeTechnical ? Number(offeeTechnical) : null,
          offee_open_mindedness_score: offeeOpen ? Number(offeeOpen) : null,
          offee_assessed_at: offeeDate || null,
          offee_notes: offeeNotes.trim() || null,
        };
      }
      if (step === 3) {
        fields = {
          technical_digital_date: techDigitalDate || null,
          technical_digital_notes: techDigitalNotes.trim() || null,
          technical_f2f_date: techF2fDate || null,
          technical_f2f_format: techF2fFormat.trim() || null,
          technical_company_participated: techCompanyParticipated,
          technical_score: techScore ? Number(techScore) : null,
          technical_cognitive_score: techCognitive ? Number(techCognitive) : null,
          technical_assessor_notes: techAssessorNotes.trim() || null,
        };
      }
      if (step === 4) {
        fields = {
          motivation_session_date: motDate || null,
          motivation_format: motFormat.trim() || null,
          motivation_company_participated: motCompanyParticipated,
          motivation_score: motScore ? Number(motScore) : null,
          motivation_session_notes: motNotes.trim() || null,
        };
      }
      await decide.mutateAsync({ applicationId: app.id, step, decision, fields });
      toast({ title: decision === "pass" ? "Passed" : decision === "reject" ? "Rejected" : "Marked for review" });
    } catch (err) {
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleBoard = async () => {
    if (!app) return;
    try {
      await board.mutateAsync({
        applicationId: app.id,
        adminRecommendation: boardRec,
        adminReason: boardReason,
        companyDecision: boardDecision,
      });
      toast({ title: "Board decision saved" });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleMentor = async () => {
    if (!app || !mentorId) return;
    try {
      if (canActivateHold(app)) {
        await activateHold.mutateAsync({ applicationId: app.id, mentorId });
      } else {
        await assignMentor.mutateAsync({
          applicationId: app.id,
          mentorId,
          track: (app.track as Track | null) ?? (app.candidates as { track?: Track })?.track,
        });
      }
      toast({ title: "Mentor assigned — Readiness unlocked" });
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !app) {
    return (
      <div className="space-y-4 max-w-lg py-12">
        <h1 className="text-xl font-medium">Application not found</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "This application could not be loaded."}
        </p>
        <Button variant="outline" asChild>
          <Link to="/admin/selection">Back to Selection pipeline</Link>
        </Button>
      </div>
    );
  }

  const profile = app.candidates?.profiles;
  const step = getSelectionStepFromStatus(app.status, app.selection_step);
  const checks = app.eligibility_auto_checks as EligibilityAutoChecks | null;
  const overdue = isStepOverdue(step, app.selection_step_entered_at);
  const readinessOpen = isReadinessUnlocked(app);
  const positions = app.jobs?.positions_count ?? 2;
  const selectedCount = countSelectedForJob(jobApplications ?? []);
  const maxSelected = maxSelectionsForJob(positions);
  const job = app.jobs;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/selection">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-medium truncate">
            {profile?.full_name ?? app.candidates?.full_name ?? "Candidate"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {app.jobs?.title} · {app.jobs?.companies?.name}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">{selectionStatusLabel(app.status)}</Badge>
            <Badge variant="secondary">Step {step}: {SELECTION_STEPS.find((s) => s.step === step)?.label}</Badge>
            {overdue && <Badge variant="destructive">SLA overdue</Badge>}
            {readinessOpen && <Badge className="bg-success">Readiness unlocked</Badge>}
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/admin/candidates/${app.candidate_id}`}>Full profile</Link>
        </Button>
      </div>

      {/* Step 1 — Eligibility */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 1 — Eligibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {checks && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <AutoCheck label="University" ok={checks.university_ok} detail={checks.university_name} />
              <AutoCheck label="Track" ok={checks.track_ok} detail={checks.track ?? undefined} />
              <AutoCheck label="English/CV" ok={checks.english_ok} />
              <AutoCheck label="Documents" ok={checks.documents_ok} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <p><span className="text-muted-foreground">GPA:</span> {checks?.gpa_or_standing ?? app.candidates?.gpa_or_standing ?? "—"}</p>
            <p><span className="text-muted-foreground">Field:</span> {checks?.field_of_study ?? app.candidates?.field_of_study ?? "—"}</p>
          </div>
          <div className="space-y-2">
            <Label>Admin notes</Label>
            <Textarea value={eligibilityNotes} onChange={(e) => setEligibilityNotes(e.target.value)} rows={2} />
          </div>
          {step === 1 && (
            <StepDecisionButtons
              onDecision={(d) => handleStepDecision(1, d)}
              loading={decide.isPending}
            />
          )}
        </CardContent>
      </Card>

      {/* Step 2 — Offee */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">Step 2 — Offee</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              External tool — export CSV, run Offee outside the platform, then enter results here.
              Live Offee integration is not connected yet.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => downloadCsv(`offee-export-${app.id}.csv`, buildOffeeCsvRows([app]))}
          >
            <Download className="h-3 w-3" />
            CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Technical score</Label>
              <Input type="number" value={offeeTechnical} onChange={(e) => setOffeeTechnical(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Open-mindedness score</Label>
              <Input type="number" value={offeeOpen} onChange={(e) => setOffeeOpen(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Assessment date</Label>
              <Input type="date" value={offeeDate} onChange={(e) => setOffeeDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes (admin only)</Label>
            <Textarea value={offeeNotes} onChange={(e) => setOffeeNotes(e.target.value)} rows={2} />
          </div>
          {step === 2 && (
            <StepDecisionButtons onDecision={(d) => handleStepDecision(2, d)} loading={decide.isPending} />
          )}
        </CardContent>
      </Card>

      {/* Step 3 — Technical */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 3 — Technical & cognitive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Digital assessment date</Label>
              <Input type="date" value={techDigitalDate} onChange={(e) => setTechDigitalDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>F2F date</Label>
              <Input type="date" value={techF2fDate} onChange={(e) => setTechF2fDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>F2F format</Label>
              <Input value={techF2fFormat} onChange={(e) => setTechF2fFormat(e.target.value)} placeholder="In-person / Video" />
            </div>
            <div className="space-y-2">
              <Label>Technical score</Label>
              <Input type="number" value={techScore} onChange={(e) => setTechScore(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cognitive / communication score</Label>
              <Input type="number" value={techCognitive} onChange={(e) => setTechCognitive(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Digital notes</Label>
            <Textarea value={techDigitalNotes} onChange={(e) => setTechDigitalNotes(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Assessor notes</Label>
            <Textarea value={techAssessorNotes} onChange={(e) => setTechAssessorNotes(e.target.value)} rows={2} />
            {techCompanyParticipated && (
              <p className="text-xs text-muted-foreground">
                If you reject after company participation, these notes may be shared with the company as a brief reason.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="tech-company"
              checked={techCompanyParticipated}
              onCheckedChange={(v) => setTechCompanyParticipated(Boolean(v))}
            />
            <Label htmlFor="tech-company">Company participated</Label>
          </div>
          {app.technical_company_feedback && (
            <div className="rounded-lg border p-3 text-sm bg-muted/30">
              <p className="font-medium mb-1">Company feedback</p>
              <p className="text-muted-foreground">{app.technical_company_feedback}</p>
            </div>
          )}
          {step === 3 && (
            <StepDecisionButtons onDecision={(d) => handleStepDecision(3, d)} loading={decide.isPending} />
          )}
        </CardContent>
      </Card>

      {/* Step 4 — Motivation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 4 — Motivation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session date</Label>
              <Input type="date" value={motDate} onChange={(e) => setMotDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Input value={motFormat} onChange={(e) => setMotFormat(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Motivation score</Label>
              <Input type="number" value={motScore} onChange={(e) => setMotScore(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Session notes</Label>
            <Textarea value={motNotes} onChange={(e) => setMotNotes(e.target.value)} rows={2} />
            {motCompanyParticipated && (
              <p className="text-xs text-muted-foreground">
                If you reject after company participation, these notes may be shared with the company as a brief reason.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="mot-company"
              checked={motCompanyParticipated}
              onCheckedChange={(v) => setMotCompanyParticipated(Boolean(v))}
            />
            <Label htmlFor="mot-company">Company participated</Label>
          </div>
          {app.motivation_company_feedback && (
            <div className="rounded-lg border p-3 text-sm bg-muted/30">
              <p className="font-medium mb-1">Company feedback</p>
              <p className="text-muted-foreground">{app.motivation_company_feedback}</p>
            </div>
          )}
          {step === 4 && (
            <StepDecisionButtons onDecision={(d) => handleStepDecision(4, d)} loading={decide.isPending} />
          )}
        </CardContent>
      </Card>

      {/* Step 5 — Board */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Step 5 — Selection board</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-3 text-sm space-y-2 bg-muted/20">
            <p className="font-medium">Role requirement profile</p>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <p><span className="text-foreground">Track:</span> {job?.target_track ?? "—"}</p>
              <p><span className="text-foreground">Level:</span> {job?.experience_level ?? "—"}</p>
              <p><span className="text-foreground">Discipline:</span> {job?.engineering_discipline ?? "—"}</p>
              <p>
                <span className="text-foreground">Capacity:</span>{" "}
                {positions} positions · {selectedCount} selected (max {maxSelected})
              </p>
            </div>
            {job?.core_skills && (
              <p><span className="text-foreground">Core skills:</span> {job.core_skills}</p>
            )}
            {(job?.requirements ?? []).length > 0 && (
              <ul className="list-disc list-inside text-muted-foreground">
                {(job.requirements ?? []).slice(0, 5).map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Admin recommendation</Label>
              <Select value={boardRec} onValueChange={(v) => setBoardRec(v as typeof boardRec)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="not_recommended">Not recommended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Company decision</Label>
              <Select value={boardDecision} onValueChange={(v) => setBoardDecision(v as typeof boardDecision)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="hold">Hold</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Recommendation reason</Label>
            <Textarea value={boardReason} onChange={(e) => setBoardReason(e.target.value)} rows={3} />
          </div>
          {step >= 4 && step <= 5 && !app.board_decided_at && (
            <Button onClick={handleBoard} disabled={board.isPending}>
              Save board decision
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Mentor assignment */}
      {(app.status === "selected_for_readiness" || canActivateHold(app)) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mentor assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isMentorAssignmentOverdue(app.board_decided_at) && !app.assigned_mentor_id && (
              <p className="text-sm text-destructive font-medium">
                Overdue — no mentor assigned within 5 days of board decision.
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Readiness stays locked until a mentor is assigned.
            </p>
            <Select value={mentorId} onValueChange={setMentorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select mentor" />
              </SelectTrigger>
              <SelectContent>
                {(mentors ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} — {m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleMentor} disabled={!mentorId || assignMentor.isPending}>
              {canActivateHold(app) ? "Activate HOLD candidate & assign mentor" : "Assign mentor & unlock Readiness"}
            </Button>
          </CardContent>
        </Card>
      )}

      {app.readiness_unlocked_at && (
        <MentorProgramPanel
          applicationId={app.id}
          track={(app.track as Track | null) ?? (app.candidates as { track?: Track })?.track}
          canEdit
          showObservations
        />
      )}

      {app.motivation_statement && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Application motivation</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{app.motivation_statement}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function AutoCheck({ label, ok, detail }: { label: string; ok: boolean; detail?: string | null }) {
  return (
    <div className={`rounded-lg border p-3 ${ok ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{ok ? "Pass" : "Check"}</p>
      {detail && <p className="text-xs text-muted-foreground mt-1 truncate">{detail}</p>}
    </div>
  );
}

export default AdminSelectionApplication;
