import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Clock } from "lucide-react";
import {
  useFollowupTouchpoints,
  useFollowupMeetingLogs,
  useFollowupMeetingSummaries,
  useFollowupQuestionnaires,
  useFollowupAddons,
  useFollowupAdhoc,
  useEnsureFollowupInitialized,
  useCreateAddonRequest,
  useLogAdhocSupport,
  useSetAtRiskRetention,
} from "@/hooks/useFollowup";
import { useActivationRecord } from "@/hooks/useActivation";
import MeetingLogForm from "@/components/followup/MeetingLogForm";
import QuestionnaireForm from "@/components/followup/QuestionnaireForm";
import {
  ADDON_LABELS,
  isFollowupUnlocked,
  isTouchpointOverdue,
  rollupStatusLabel,
  type FollowupAddonRequest,
  type FollowupRollupStatus,
} from "@/lib/followupModule";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

export type FollowupViewerRole = "candidate" | "company" | "admin";

type Props = {
  applicationId: string;
  applicationStatus?: string | null;
  role: FollowupViewerRole;
  canEdit?: boolean;
  embedded?: boolean;
};

export default function FollowupTrackerPanel({
  applicationId,
  applicationStatus,
  role,
  canEdit = false,
  embedded = false,
}: Props) {
  const { toast } = useToast();
  const { data: record, isLoading: recordLoading } = useActivationRecord(applicationId);
  const { data: touchpoints, isLoading: tpLoading } = useFollowupTouchpoints(applicationId);
  const { data: meetings } = useFollowupMeetingLogs(applicationId);
  const { data: summaries } = useFollowupMeetingSummaries(applicationId);
  const { data: questionnaires } = useFollowupQuestionnaires(applicationId);
  const { data: addons } = useFollowupAddons(applicationId);
  const { data: adhoc } = useFollowupAdhoc(applicationId);
  const ensureInit = useEnsureFollowupInitialized(applicationId);
  const createAddon = useCreateAddonRequest();
  const logAdhoc = useLogAdhocSupport();
  const setRisk = useSetAtRiskRetention();

  const [addonKey, setAddonKey] = useState<FollowupAddonRequest["addon_key"]>("extended_followup");
  const [addonNotes, setAddonNotes] = useState("");
  const [adhocSubject, setAdhocSubject] = useState("");
  const [adhocBody, setAdhocBody] = useState("");
  const [adhocUrgency, setAdhocUrgency] = useState<"urgent" | "standard">("standard");

  const unlocked = isFollowupUnlocked({
    arrivalDate: record?.arrival_date,
    followupStatus: record?.followup_status,
    applicationStatus,
  });
  const done = Boolean(record?.followup_completed_at);
  const rollup = (record?.followup_status ?? null) as FollowupRollupStatus | null;
  const list = touchpoints ?? [];

  useEffect(() => {
    if (!applicationId || !unlocked || tpLoading) return;
    if (list.length === 0 && !ensureInit.isPending && record?.arrival_date) {
      ensureInit.mutate(record.arrival_date);
    }
  }, [applicationId, unlocked, list.length, tpLoading, ensureInit, record?.arrival_date]);

  if (!unlocked) {
    return (
      <p className="text-sm text-muted-foreground">
        Follow-up opens when arrival is confirmed (Module 5).
      </p>
    );
  }

  if (recordLoading || tpLoading || ensureInit.isPending) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const header = (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <h3 className="text-base font-medium">
          {role === "candidate"
            ? "Your follow-up schedule"
            : role === "company"
              ? "Follow-up schedule"
              : "Follow-up coordination (6 months)"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {role === "admin"
            ? "Separate candidate and company meetings. Overdue ≠ Flag."
            : "Touchpoints at 1, 2, 3, and 6 months after arrival. Candidate and company meet separately."}
        </p>
      </div>
      {role === "admin" ? (
        done || rollup === "followup_complete" ? (
          <Badge className="bg-success text-success-foreground">Complete</Badge>
        ) : (
          <Badge variant={rollup === "at_risk_retention" || rollup === "followup_flag" ? "destructive" : "outline"}>
            {rollupStatusLabel(rollup)}
          </Badge>
        )
      ) : done ? (
        <Badge className="bg-success text-success-foreground">Period complete</Badge>
      ) : (
        <Badge variant="outline">In progress</Badge>
      )}
    </div>
  );

  const body = (
    <div className="space-y-6">
      {record?.arrival_date && (
        <p className="text-sm text-muted-foreground">
          Arrival anchor:{" "}
          <span className="text-foreground font-medium">{record.arrival_date}</span>
        </p>
      )}

      {role === "admin" && (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Switch
            checked={Boolean(record?.at_risk_retention)}
            onCheckedChange={async (v) => {
              try {
                await setRisk.mutateAsync({ applicationId, value: v });
                toast({ title: v ? "AT_RISK_RETENTION set" : "Retention risk cleared" });
              } catch (err) {
                toast({
                  title: "Update failed",
                  description: err instanceof Error ? err.message : "Try again",
                  variant: "destructive",
                });
              }
            }}
          />
          <div>
            <p className="text-sm font-medium">AT_RISK_RETENTION</p>
            <p className="text-xs text-muted-foreground">
              Sticky even after follow-up closes
              {record?.at_risk_retention_at
                ? ` · set ${String(record.at_risk_retention_at).slice(0, 10)}`
                : ""}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {list.map((tp) => {
          const partySummaries = (summaries ?? []).filter((s) => s.touchpoint_id === tp.id);
          const candLogged = partySummaries.find((s) => s.party === "candidate")?.is_logged;
          const coLogged = partySummaries.find((s) => s.party === "company")?.is_logged;
          const bothLogged = Boolean(candLogged && coLogged);
          const overdue = isTouchpointOverdue(tp, bothLogged);
          const candLog = (meetings ?? []).find(
            (m) => m.touchpoint_id === tp.id && m.party === "candidate"
          );
          const coLog = (meetings ?? []).find(
            (m) => m.touchpoint_id === tp.id && m.party === "company"
          );
          const qs = (questionnaires ?? []).filter((q) => q.month_number === tp.month_number);

          return (
            <div key={tp.id} className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{tp.title}</p>
                  {tp.focus && (
                    <p className="text-xs text-muted-foreground mt-0.5">{tp.focus}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Target {tp.target_due_date} · Window ends {tp.window_end}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {overdue && role === "admin" && (
                    <Badge variant="outline" className="gap-1 text-amber-700 border-amber-300">
                      <Clock className="h-3 w-3" />
                      Overdue
                    </Badge>
                  )}
                  {role === "admin" && candLog?.state === "flag" && candLog.logged_at && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Candidate flag
                    </Badge>
                  )}
                  {role === "admin" && coLog?.state === "flag" && coLog.logged_at && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Company flag
                    </Badge>
                  )}
                  {role !== "admin" && (
                    <>
                      <Badge variant="outline" className="text-xs">
                        Your meeting: {role === "candidate" ? (candLogged ? "Done" : "Pending") : coLogged ? "Done" : "Pending"}
                      </Badge>
                    </>
                  )}
                </div>
              </div>

              {role === "admin" && candLog && coLog && (
                <div className="grid gap-3 md:grid-cols-2">
                  <MeetingLogForm
                    log={candLog}
                    applicationId={applicationId}
                    monthNumber={tp.month_number}
                    party="candidate"
                    canEdit={canEdit && !done}
                  />
                  <MeetingLogForm
                    log={coLog}
                    applicationId={applicationId}
                    monthNumber={tp.month_number}
                    party="company"
                    canEdit={canEdit && !done}
                  />
                </div>
              )}

              {(tp.month_number === 3 || tp.month_number === 6) && (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-sm font-medium">Questionnaire</p>
                  {qs
                    .filter((q) => {
                      if (role === "admin") return true;
                      if (role === "candidate") return q.party === "candidate";
                      return q.party === "company";
                    })
                    .map((q) => (
                      <div key={q.id} className="rounded-md border p-3 space-y-2">
                        {role === "admin" && (
                          <p className="text-xs text-muted-foreground capitalize">
                            {q.party} · {q.status}
                          </p>
                        )}
                        <QuestionnaireForm
                          questionnaire={q}
                          applicationId={applicationId}
                          readOnly={role === "admin" || done}
                        />
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ad-hoc */}
      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <p className="text-sm font-medium">Ad-hoc support</p>
          <p className="text-xs text-muted-foreground">
            Between touchpoints — urgent same day, standard 48h. Also use{" "}
            <Link to={role === "admin" ? "/admin/messages" : role === "company" ? "/employer/messages" : "/candidate/messages"} className="underline">
              Messages
            </Link>
            .
          </p>
        </div>
        {!done && (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="Subject"
                value={adhocSubject}
                onChange={(e) => setAdhocSubject(e.target.value)}
              />
              <Select
                value={adhocUrgency}
                onValueChange={(v) => setAdhocUrgency(v as "urgent" | "standard")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (48h)</SelectItem>
                  <SelectItem value="urgent">Urgent (same day)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Describe the issue…"
              value={adhocBody}
              onChange={(e) => setAdhocBody(e.target.value)}
              rows={2}
            />
            <Button
              size="sm"
              disabled={logAdhoc.isPending || !adhocSubject.trim() || !adhocBody.trim()}
              onClick={async () => {
                try {
                  await logAdhoc.mutateAsync({
                    applicationId,
                    urgency: adhocUrgency,
                    subject: adhocSubject,
                    body: adhocBody,
                    opened_by_role: role,
                  });
                  setAdhocSubject("");
                  setAdhocBody("");
                  toast({ title: "Support request logged" });
                } catch (err) {
                  toast({
                    title: "Could not log request",
                    description: err instanceof Error ? err.message : "Try again",
                    variant: "destructive",
                  });
                }
              }}
            >
              Submit request
            </Button>
          </div>
        )}
        {(adhoc ?? []).length > 0 && (
          <div className="space-y-1">
            {(adhoc ?? []).slice(0, 5).map((a: { id: string; subject?: string; urgency?: string; created_at?: string }) => (
              <p key={a.id} className="text-xs text-muted-foreground">
                {a.created_at?.slice(0, 10)} · {a.urgency} · {a.subject}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Add-ons — company + admin */}
      {(role === "company" || role === "admin") && (
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">Add-on services</p>
          {role === "company" && !done && (
            <div className="space-y-2">
              <Select
                value={addonKey}
                onValueChange={(v) => setAddonKey(v as FollowupAddonRequest["addon_key"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(ADDON_LABELS) as FollowupAddonRequest["addon_key"][]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {ADDON_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Notes (optional)"
                value={addonNotes}
                onChange={(e) => setAddonNotes(e.target.value)}
                rows={2}
              />
              <Button
                size="sm"
                disabled={createAddon.isPending}
                onClick={async () => {
                  try {
                    await createAddon.mutateAsync({
                      applicationId,
                      addon_key: addonKey,
                      notes: addonNotes,
                    });
                    setAddonNotes("");
                    toast({ title: "Add-on requested" });
                  } catch (err) {
                    toast({
                      title: "Request failed",
                      description: err instanceof Error ? err.message : "Try again",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Request add-on
              </Button>
            </div>
          )}
          {(addons ?? []).map((a) => (
            <p key={a.id} className="text-xs text-muted-foreground">
              {ADDON_LABELS[a.addon_key]} · {a.status}
            </p>
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
