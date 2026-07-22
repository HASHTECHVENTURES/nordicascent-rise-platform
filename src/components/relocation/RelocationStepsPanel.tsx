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
import { Switch } from "@/components/ui/switch";
import { Loader2, CheckCircle2, AlertTriangle, Ban } from "lucide-react";
import {
  useRelocationSteps,
  useEnsureRelocationInitialized,
  useUpdateRelocationStep,
  useRefreshRelocationTimeline,
  useUpdatePlannedArrival,
  useUpdateFamilyRelocating,
  useRelocationCms,
} from "@/hooks/useRelocation";
import { useActivationRecord } from "@/hooks/useActivation";
import {
  RELOCATION_STEP_DEFS,
  candidateStepStatusLabel,
  coordinatorStepStatusLabel,
  isRelocationUnlocked,
  ownerLayerLabel,
  relocationStepProgress,
  rollupStatusLabel,
  type RelocationRollupStatus,
  type RelocationStep,
  type RelocationStepState,
} from "@/lib/relocationModule";
import { useToast } from "@/hooks/use-toast";
import { openStoredDocument } from "@/lib/documentAccess";

export type RelocationViewerRole = "candidate" | "company" | "admin";

type Props = {
  applicationId: string;
  applicationStatus?: string | null;
  candidateId?: string | null;
  familyRelocating?: boolean;
  familyMemberCount?: number | null;
  role: RelocationViewerRole;
  /** Admin/coordinator can edit step states */
  canEdit?: boolean;
  embedded?: boolean;
};

function StepStateBadge({
  state,
  role,
}: {
  state: RelocationStepState;
  role: RelocationViewerRole;
}) {
  if (role === "candidate") {
    return state === "done" ? (
      <Badge className="bg-success text-success-foreground shrink-0 gap-1">
        <CheckCircle2 className="h-3 w-3" />
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
  if (state === "at_risk") {
    return (
      <Badge variant="destructive" className="shrink-0 gap-1">
        <AlertTriangle className="h-3 w-3" />
        At risk
      </Badge>
    );
  }
  if (state === "blocked") {
    return (
      <Badge variant="secondary" className="shrink-0 gap-1">
        <Ban className="h-3 w-3" />
        Blocked
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="shrink-0">
      On track
    </Badge>
  );
}

function StepEditor({
  step,
  applicationId,
  role,
  onSaved,
}: {
  step: RelocationStep;
  applicationId: string;
  role: RelocationViewerRole;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const update = useUpdateRelocationStep();
  const def = RELOCATION_STEP_DEFS.find((d) => d.step_number === step.step_number);
  const [state, setState] = useState<RelocationStepState>(step.state);
  const [eventDate, setEventDate] = useState(step.event_date ?? "");
  const [notes, setNotes] = useState(step.notes ?? "");
  const [address, setAddress] = useState(step.address ?? "");
  const [contact, setContact] = useState(step.contact_name ?? "");
  const [file, setFile] = useState<File | null>(null);

  const companyCanEdit =
    role === "company" && (step.step_number === 9 || step.step_number === 1);
  const adminEdit = role === "admin";
  if (!adminEdit && !companyCanEdit) return null;
  if (step.state === "done" && !adminEdit) return null;

  return (
    <div className="space-y-3 border-t pt-3 mt-2">
      {adminEdit && (
        <div className="space-y-1.5">
          <Label>State</Label>
          <Select value={state} onValueChange={(v) => setState(v as RelocationStepState)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on_track">On track</SelectItem>
              <SelectItem value="at_risk">At risk</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>
      {def && "addressField" in def && def.addressField && (
        <div className="space-y-1.5">
          <Label>Address</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      )}
      {def && "contactField" in def && def.contactField && (
        <div className="space-y-1.5">
          <Label>{("contactLabel" in def && def.contactLabel) || "Contact"}</Label>
          <Input value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>
      )}
      {(adminEdit || role === "company") && (
        <div className="space-y-1.5">
          <Label>
            {def && "notesLabel" in def && def.notesLabel ? def.notesLabel : "Notes"}
          </Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
      )}
      {def && "allowsUpload" in def && def.allowsUpload && adminEdit && (
        <div className="space-y-1.5">
          <Label>{("uploadLabel" in def && def.uploadLabel) || "Upload"}</Label>
          <Input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
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
              notes,
              address: def && "addressField" in def && def.addressField ? address : undefined,
              contact_name:
                def && "contactField" in def && def.contactField ? contact : undefined,
              file,
              stepNumber: step.step_number,
            });
            toast({ title: `Step ${step.step_number} updated` });
            onSaved();
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

export default function RelocationStepsPanel({
  applicationId,
  applicationStatus,
  candidateId,
  familyRelocating: familyProp,
  familyMemberCount: familyCountProp,
  role,
  canEdit = false,
  embedded = false,
}: Props) {
  const { toast } = useToast();
  const { data: activationRecord, isLoading: recordLoading } = useActivationRecord(applicationId);
  const { data: steps, isLoading: stepsLoading } = useRelocationSteps(applicationId);
  const { data: cms } = useRelocationCms();
  const ensureInit = useEnsureRelocationInitialized(applicationId);
  const refreshTimeline = useRefreshRelocationTimeline(applicationId);
  const updateArrival = useUpdatePlannedArrival();
  const updateFamily = useUpdateFamilyRelocating();

  const [arrivalDraft, setArrivalDraft] = useState("");
  const [familyOn, setFamilyOn] = useState(false);
  const [familyCount, setFamilyCount] = useState("");

  const list = steps ?? [];
  const familyRelocating = familyProp ?? familyOn;
  const unlocked = isRelocationUnlocked({
    finalClearanceDate: activationRecord?.final_clearance_date,
    applicationStatus: applicationStatus ?? null,
    activationStatus: activationRecord?.status,
  });
  const relocationDone = Boolean(activationRecord?.relocation_completed_at);
  const rollup = (activationRecord?.relocation_status ?? null) as RelocationRollupStatus | null;
  const progress = relocationStepProgress(list, familyRelocating);

  useEffect(() => {
    setArrivalDraft(activationRecord?.planned_arrival_date ?? "");
  }, [activationRecord?.planned_arrival_date]);

  useEffect(() => {
    if (familyProp !== undefined) setFamilyOn(familyProp);
    if (familyCountProp != null) setFamilyCount(String(familyCountProp));
  }, [familyProp, familyCountProp]);

  useEffect(() => {
    if (!applicationId || !unlocked || stepsLoading) return;
    if (list.length === 0 && !ensureInit.isPending) {
      ensureInit.mutate({
        finalClearanceDate:
          activationRecord?.final_clearance_date ?? new Date().toISOString().slice(0, 10),
      });
    }
  }, [
    applicationId,
    unlocked,
    list.length,
    stepsLoading,
    ensureInit,
    activationRecord?.final_clearance_date,
  ]);

  useEffect(() => {
    if (!applicationId || !unlocked || list.length === 0) return;
    refreshTimeline.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId, unlocked, list.length]);

  if (!unlocked) {
    return (
      <p className="text-sm text-muted-foreground">
        Relocation coordination starts when Final Clearance is Clear.
      </p>
    );
  }

  if (recordLoading || stepsLoading || ensureInit.isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const visibleSteps = list.filter((s) => familyRelocating || s.step_number !== 7);

  const header = (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <h3 className="text-base font-medium">
          {role === "candidate" ? "Your relocation progress" : "Relocation coordination (10 steps)"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {role === "candidate"
            ? "Partners handle the work — Nordic Ascent tracks progress toward your arrival."
            : role === "company"
              ? "High-level progress and planned arrival. Toolkit available at final prep."
              : "Parallel coordination tracker — partners execute; you update status."}
        </p>
      </div>
      {relocationDone || rollup === "arrived" ? (
        <Badge className="bg-success text-success-foreground">Arrived</Badge>
      ) : role === "candidate" ? (
        <Badge variant="outline">
          {progress.done}/{progress.total} complete
        </Badge>
      ) : (
        <Badge variant="outline">{rollupStatusLabel(rollup)}</Badge>
      )}
    </div>
  );

  const adminMeta =
    role === "admin" && canEdit ? (
      <div className="rounded-lg border p-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Final clearance date</Label>
            <Input type="date" value={activationRecord?.final_clearance_date ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Planned arrival date</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={arrivalDraft}
                onChange={(e) => setArrivalDraft(e.target.value)}
              />
              <Button
                size="sm"
                variant="outline"
                disabled={updateArrival.isPending}
                onClick={async () => {
                  try {
                    await updateArrival.mutateAsync({
                      applicationId,
                      plannedArrivalDate: arrivalDraft || null,
                    });
                    toast({ title: "Planned arrival updated" });
                  } catch (err) {
                    toast({
                      title: "Update failed",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Updates target windows for housing, buddy, and final prep.
            </p>
          </div>
        </div>
        {candidateId && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={familyOn}
                onCheckedChange={async (checked) => {
                  setFamilyOn(checked);
                  try {
                    await updateFamily.mutateAsync({
                      candidateId,
                      familyRelocating: checked,
                      familyMemberCount: checked ? Number(familyCount) || null : null,
                      applicationId,
                    });
                  } catch (err) {
                    toast({
                      title: "Could not update family flag",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              />
              <Label>Family relocating</Label>
            </div>
            {familyOn && (
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Members</Label>
                <Input
                  className="w-20"
                  type="number"
                  min={1}
                  value={familyCount}
                  onChange={(e) => setFamilyCount(e.target.value)}
                  onBlur={async () => {
                    try {
                      await updateFamily.mutateAsync({
                        candidateId,
                        familyRelocating: true,
                        familyMemberCount: Number(familyCount) || null,
                        applicationId,
                      });
                    } catch {
                      /* toast on switch path */
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    ) : null;

  const companyMeta =
    role === "company" ? (
      <div className="text-sm text-muted-foreground space-y-1">
        {activationRecord?.planned_arrival_date && (
          <p>
            Planned arrival:{" "}
            <span className="text-foreground font-medium">
              {activationRecord.planned_arrival_date}
            </span>
          </p>
        )}
        <p>
          Progress: {progress.done}/{progress.total} steps complete
        </p>
      </div>
    ) : null;

  const candidateMeta =
    role === "candidate" && activationRecord?.planned_arrival_date ? (
      <p className="text-sm text-muted-foreground">
        Planned arrival:{" "}
        <span className="text-foreground font-medium">
          {activationRecord.planned_arrival_date}
        </span>
      </p>
    ) : null;

  const body = (
    <div className="space-y-4">
      {adminMeta}
      {companyMeta}
      {candidateMeta}

      <div className="space-y-3">
        {visibleSteps.map((step) => {
          const def = RELOCATION_STEP_DEFS.find((d) => d.step_number === step.step_number);
          const cmsKey = `step_${step.step_number}` as keyof NonNullable<typeof cms>;
          const candidateCopy = cms?.[cmsKey];
          const showInternalNotes = role === "admin";
          const showCompanyToolkit =
            role === "company" &&
            step.step_number === 9 &&
            (step.state === "done" || list.find((s) => s.step_number === 9));
          const hideFamilyDetailFromCompany = role === "company" && step.step_number === 7;

          if (hideFamilyDetailFromCompany) return null;

          return (
            <div key={step.id} className="rounded-lg border p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm">
                    #{step.step_number}: {step.title}
                  </p>
                  {role === "candidate" && candidateCopy ? (
                    <p className="text-xs text-muted-foreground mt-0.5">{candidateCopy}</p>
                  ) : (
                    def?.hint && (
                      <p className="text-xs text-muted-foreground mt-0.5">{def.hint}</p>
                    )
                  )}
                  {role === "admin" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Owner: {ownerLayerLabel(step.owner_layer)}
                      {step.target_due_date ? ` · Target: ${step.target_due_date}` : ""}
                    </p>
                  )}
                </div>
                <StepStateBadge state={step.state} role={role} />
              </div>

              {step.state === "done" && (
                <div className="text-sm bg-muted/50 rounded-md p-3 space-y-1">
                  {step.event_date && (
                    <p>
                      <span className="text-muted-foreground">Date:</span> {step.event_date}
                    </p>
                  )}
                  {step.address && role !== "company" && (
                    <p>
                      <span className="text-muted-foreground">Address:</span> {step.address}
                    </p>
                  )}
                  {step.contact_name && role === "admin" && (
                    <p>
                      <span className="text-muted-foreground">Contact:</span> {step.contact_name}
                    </p>
                  )}
                  {step.notes && showInternalNotes && (
                    <p>
                      <span className="text-muted-foreground">Notes:</span> {step.notes}
                    </p>
                  )}
                  {step.upload_path && role === "admin" && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm"
                      onClick={async () => {
                        try {
                          await openStoredDocument(step.upload_path!);
                        } catch {
                          toast({ title: "Could not open file", variant: "destructive" });
                        }
                      }}
                    >
                      View upload
                    </Button>
                  )}
                </div>
              )}

              {showCompanyToolkit && step.step_number === 9 && (
                <p className="text-xs text-muted-foreground">
                  Employer onboarding toolkit is prepared as part of final prep.
                </p>
              )}

              {canEdit && (role === "admin" || role === "company") && !relocationDone && (
                <StepEditor
                  step={step}
                  applicationId={applicationId}
                  role={role}
                  onSaved={() => undefined}
                />
              )}

              {role === "admin" && step.state !== "done" && step.target_due_date && (
                <p className="text-xs text-muted-foreground">
                  Status: {coordinatorStepStatusLabel(step.state)}
                </p>
              )}
            </div>
          );
        })}
      </div>
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
