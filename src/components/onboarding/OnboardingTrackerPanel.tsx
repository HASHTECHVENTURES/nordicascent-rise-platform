import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import {
  useOnboardingSteps,
  useOnboardingChecklist,
  useEnsureOnboardingInitialized,
  useRefreshOnboardingTimeline,
  useUpdateOnboardingStep,
  useUpdateOnboardingChecklistItem,
  useOnboardingCms,
} from "@/hooks/useModuleOnboarding";
import { useActivationRecord } from "@/hooks/useActivation";
import {
  ONBOARDING_STEP_DEFS,
  candidateStepStatusLabel,
  checklistProgress,
  coordinatorStepStatusLabel,
  flagClockLabel,
  isOnboardingUnlocked,
  onboardingStepProgress,
  responsibleLabel,
  rollupStatusLabel,
  type OnboardingChecklistItem,
  type OnboardingRollupStatus,
  type OnboardingStep,
  type OnboardingStepState,
} from "@/lib/onboardingModule";
import { useToast } from "@/hooks/use-toast";

export type OnboardingViewerRole = "candidate" | "company" | "admin";

type Props = {
  applicationId: string;
  applicationStatus?: string | null;
  familyRelocating?: boolean;
  role: OnboardingViewerRole;
  canEdit?: boolean;
  embedded?: boolean;
};

function StateBadge({ state, role }: { state: OnboardingStepState; role: OnboardingViewerRole }) {
  if (role === "candidate") {
    return state === "done" ? (
      <Badge className="bg-success text-success-foreground shrink-0 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        {candidateStepStatusLabel(state)}
      </Badge>
    ) : state === "flag" ? (
      <Badge variant="outline" className="shrink-0">
        {candidateStepStatusLabel(state)}
      </Badge>
    ) : (
      <Badge variant="outline" className="shrink-0">
        {candidateStepStatusLabel(state)}
      </Badge>
    );
  }
  if (state === "done") {
    return (
      <Badge className="bg-success text-success-foreground shrink-0 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </Badge>
    );
  }
  if (state === "flag") {
    return (
      <Badge variant="destructive" className="shrink-0 gap-1">
        <AlertTriangle className="h-3 w-3" />
        Flag
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="shrink-0">
      In progress
    </Badge>
  );
}

function StepEditor({
  step,
  applicationId,
  role,
}: {
  step: OnboardingStep;
  applicationId: string;
  role: OnboardingViewerRole;
}) {
  const { toast } = useToast();
  const update = useUpdateOnboardingStep();
  const def = ONBOARDING_STEP_DEFS.find((d) => d.step_number === step.step_number);
  const [state, setState] = useState<OnboardingStepState>(step.state);
  const [eventDate, setEventDate] = useState(step.event_date ?? "");
  const [eventTime, setEventTime] = useState(step.event_time ?? "");
  const [notes, setNotes] = useState(step.notes ?? "");
  const [contact, setContact] = useState(step.contact_name ?? "");

  const adminEdit = role === "admin";
  const companyEdit = role === "company" && step.step_number === 6;
  const candidateEdit =
    role === "candidate" && step.responsible === "candidate" && step.step_number !== 1;

  if (def && "systemDriven" in def && def.systemDriven && !adminEdit) return null;
  if (def && "ongoing" in def && def.ongoing && !adminEdit) return null;
  if (!adminEdit && !companyEdit && !candidateEdit) return null;
  if (step.state === "done" && !adminEdit) return null;

  return (
    <div className="space-y-3 border-t pt-3 mt-2">
      {adminEdit && (
        <div className="space-y-1.5">
          <Label>State</Label>
          <Select value={state} onValueChange={(v) => setState(v as OnboardingStepState)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="flag">Flag</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>
      {def && "timeField" in def && def.timeField && (
        <div className="space-y-1.5">
          <Label>Time</Label>
          <Input
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
          />
        </div>
      )}
      {def && "contactField" in def && def.contactField && (
        <div className="space-y-1.5">
          <Label>{("contactLabel" in def && def.contactLabel) || "Contact"}</Label>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
      )}
      {(adminEdit || candidateEdit) && (
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
      )}
      <Button
        size="sm"
        disabled={update.isPending}
        onClick={async () => {
          try {
            await update.mutateAsync({
              stepId: step.id,
              applicationId,
              state: adminEdit ? state : "done",
              event_date: eventDate || null,
              event_time: eventTime || null,
              notes: adminEdit || candidateEdit ? notes : null,
              contact_name: def && "contactField" in def && def.contactField ? contact : undefined,
            });
            toast({ title: `Step ${step.step_number} updated` });
          } catch (err) {
            toast({
              title: "Could not update step",
              description: err instanceof Error ? err.message : "Try again",
              variant: "destructive",
            });
          }
        }}
      >
        {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
      </Button>
    </div>
  );
}

function ChecklistEditor({
  item,
  applicationId,
  role,
}: {
  item: OnboardingChecklistItem;
  applicationId: string;
  role: OnboardingViewerRole;
}) {
  const { toast } = useToast();
  const update = useUpdateOnboardingChecklistItem();
  const [state, setState] = useState<OnboardingStepState>(item.state);
  const [eventDate, setEventDate] = useState(item.event_date ?? "");
  const [notes, setNotes] = useState(item.notes ?? "");

  const adminEdit = role === "admin";
  const companyEdit = role === "company" && item.who_confirms === "company";
  const candidateEdit = role === "candidate" && item.who_confirms === "candidate";

  if (!adminEdit && !companyEdit && !candidateEdit) return null;
  if (item.state === "done" && !adminEdit) return null;

  return (
    <div className="space-y-2 border-t pt-2 mt-2">
      {adminEdit && (
        <Select value={state} onValueChange={(v) => setState(v as OnboardingStepState)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="flag">Flag</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      )}
      <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      {(adminEdit || candidateEdit) && (
        <Textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      )}
      <Button
        size="sm"
        disabled={update.isPending}
        onClick={async () => {
          try {
            await update.mutateAsync({
              itemId: item.id,
              applicationId,
              state: adminEdit ? state : "done",
              event_date: eventDate || null,
              notes: adminEdit || candidateEdit ? notes : null,
            });
            toast({ title: "Checklist item updated" });
          } catch (err) {
            toast({
              title: "Could not update",
              description: err instanceof Error ? err.message : "Try again",
              variant: "destructive",
            });
          }
        }}
      >
        {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
      </Button>
    </div>
  );
}

export default function OnboardingTrackerPanel({
  applicationId,
  applicationStatus,
  familyRelocating = false,
  role,
  canEdit = false,
  embedded = false,
}: Props) {
  const { data: activationRecord, isLoading: recordLoading } = useActivationRecord(applicationId);
  const { data: steps, isLoading: stepsLoading } = useOnboardingSteps(applicationId);
  const { data: checklist, isLoading: listLoading } = useOnboardingChecklist(applicationId);
  const { data: cms } = useOnboardingCms();
  const ensureInit = useEnsureOnboardingInitialized(applicationId);
  const refreshTimeline = useRefreshOnboardingTimeline(applicationId);

  const list = steps ?? [];
  const items = checklist ?? [];
  const unlocked = isOnboardingUnlocked({
    onboardingStatus: activationRecord?.onboarding_status,
    applicationStatus: applicationStatus ?? null,
    arrivalDate: activationRecord?.arrival_date,
  });
  const done = Boolean(activationRecord?.onboarding_completed_at);
  const rollup = (activationRecord?.onboarding_status ?? null) as OnboardingRollupStatus | null;
  const progress = onboardingStepProgress(list);
  const checkProgress = checklistProgress(items, familyRelocating);

  useEffect(() => {
    if (!applicationId || !unlocked || stepsLoading) return;
    if (list.length === 0 && !ensureInit.isPending) {
      ensureInit.mutate(activationRecord?.arrival_date ?? activationRecord?.planned_arrival_date);
    }
  }, [
    applicationId,
    unlocked,
    list.length,
    stepsLoading,
    ensureInit,
    activationRecord?.arrival_date,
    activationRecord?.planned_arrival_date,
  ]);

  useEffect(() => {
    if (!applicationId || !unlocked || list.length === 0) return;
    refreshTimeline.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, unlocked, list.length]);

  if (!unlocked) {
    return (
      <p className="text-sm text-muted-foreground">
        Onboarding opens when arrival is confirmed in Relocation (Module 5).
      </p>
    );
  }

  if (recordLoading || stepsLoading || listLoading || ensureInit.isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const visibleItems = items.filter((i) => {
    if (i.family_only && !familyRelocating) return false;
    if (role === "company") {
      return i.who_confirms === "company";
    }
    if (role === "candidate") {
      // Candidate sees their items + high-level partner/company as read-only progress
      return true;
    }
    return true;
  });

  const visibleSteps = list.filter((s) => {
    if (role === "company") return s.step_number === 6 || s.step_number === 9;
    return true;
  });

  const header = (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <h3 className="text-base font-medium">
          {role === "candidate" ? "Your onboarding progress" : "Onboarding coordination (9 steps)"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {role === "candidate"
            ? "First four weeks after arrival — checklist and contacts below."
            : role === "company"
              ? "Confirm workplace onboarding and building/system access."
              : "Track steps, checklist, and 24-hour follow-up on flags."}
        </p>
      </div>
      {done || rollup === "onboarding_complete" ? (
        <Badge className="bg-success text-success-foreground">Complete</Badge>
      ) : role === "candidate" ? (
        <Badge variant="outline">
          {progress.done}/{progress.total} steps
        </Badge>
      ) : (
        <Badge variant="outline">{rollupStatusLabel(rollup)}</Badge>
      )}
    </div>
  );

  const meta =
    role !== "company" ? (
      <div className="text-sm text-muted-foreground space-y-1">
        {activationRecord?.arrival_date && (
          <p>
            Arrival date:{" "}
            <span className="text-foreground font-medium">{activationRecord.arrival_date}</span>
          </p>
        )}
        <p>
          Checklist: {checkProgress.done}/{checkProgress.total} complete
        </p>
      </div>
    ) : (
      <div className="text-sm text-muted-foreground">
        {activationRecord?.arrival_date && (
          <p>
            Arrival:{" "}
            <span className="text-foreground font-medium">{activationRecord.arrival_date}</span>
          </p>
        )}
      </div>
    );

  const contactCard =
    role === "candidate" && cms?.contact_directory ? (
      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm font-medium mb-2">Who to contact</p>
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
          {cms.contact_directory.replace(/^Who to contact\n?/i, "")}
        </pre>
      </div>
    ) : null;

  const body = (
    <div className="space-y-4">
      {meta}
      {contactCard}

      <div className="space-y-3">
        {visibleSteps.map((step) => {
          const def = ONBOARDING_STEP_DEFS.find((d) => d.step_number === step.step_number);
          const cmsKey = `step_${step.step_number}` as keyof NonNullable<typeof cms>;
          const candidateCopy = cms?.[cmsKey];
          const showClock = role === "admin" && step.state === "flag" && step.flagged_at;

          return (
            <div key={step.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">
                    #{step.step_number}: {step.title}
                  </p>
                  {role === "candidate" && typeof candidateCopy === "string" ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{candidateCopy}</p>
                  ) : (
                    def?.hint && (
                      <p className="text-xs text-muted-foreground mt-0.5">{def.hint}</p>
                    )
                  )}
                  {role === "admin" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {responsibleLabel(step.responsible)}
                      {step.target_due_date ? ` · Due ${step.target_due_date}` : ""}
                    </p>
                  )}
                </div>
                <StateBadge state={step.state} role={role} />
              </div>

              {showClock && (
                <p className="text-xs flex items-center gap-1 text-destructive">
                  <Clock className="h-3 w-3" />
                  {flagClockLabel(step.flagged_at)}
                </p>
              )}

              {step.state === "done" && (
                <div className="text-sm bg-muted/50 rounded-md p-3 space-y-1">
                  {step.event_date && (
                    <p>
                      <span className="text-muted-foreground">Date:</span> {step.event_date}
                      {step.event_time ? ` ${step.event_time}` : ""}
                    </p>
                  )}
                  {step.contact_name && role === "admin" && (
                    <p>
                      <span className="text-muted-foreground">Contact:</span> {step.contact_name}
                    </p>
                  )}
                  {step.notes && role === "admin" && (
                    <p>
                      <span className="text-muted-foreground">Notes:</span> {step.notes}
                    </p>
                  )}
                </div>
              )}

              {canEdit && !done && (
                <StepEditor step={step} applicationId={applicationId} role={role} />
              )}

              {role === "admin" && step.state !== "done" && (
                <p className="text-xs text-muted-foreground">
                  {coordinatorStepStatusLabel(step.state)}
                </p>
              )}

              {step.step_number === 5 && role !== "company" && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium">Practical checklist</p>
                  {visibleItems.map((item) => {
                    if (role === "candidate" && item.who_confirms === "partner") {
                      // Show partner items as read-only status for candidate
                    }
                    const hidePersonalFromCompany = false;
                    if (hidePersonalFromCompany) return null;
                    const itemClock =
                      role === "admin" && item.state === "flag" && item.flagged_at;

                    return (
                      <div key={item.id} className="rounded-md border bg-background p-3 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm">{item.title}</p>
                            {role === "admin" && (
                              <p className="text-xs text-muted-foreground">
                                Confirms: {item.who_confirms}
                                {item.target_due_date ? ` · Due ${item.target_due_date}` : ""}
                              </p>
                            )}
                          </div>
                          <StateBadge state={item.state} role={role} />
                        </div>
                        {itemClock && (
                          <p className="text-xs flex items-center gap-1 text-destructive">
                            <Clock className="h-3 w-3" />
                            {flagClockLabel(item.flagged_at)}
                          </p>
                        )}
                        {canEdit && !done && (
                          <ChecklistEditor
                            item={item}
                            applicationId={applicationId}
                            role={role}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {role === "company" && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Workplace access checklist</p>
          {items
            .filter((i) => i.who_confirms === "company")
            .map((item) => (
              <div key={item.id} className="rounded-md border p-3 space-y-1">
                <div className="flex justify-between gap-2">
                  <p className="text-sm">{item.title}</p>
                  <StateBadge state={item.state} role={role} />
                </div>
                {canEdit && !done && (
                  <ChecklistEditor item={item} applicationId={applicationId} role={role} />
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="space-y-4">
        {header}
        {body}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">{header}</CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}
