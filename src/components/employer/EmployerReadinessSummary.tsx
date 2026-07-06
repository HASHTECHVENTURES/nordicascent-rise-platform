import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { useEmployerReadinessEvaluation } from "@/hooks/useReadiness";
import { READINESS_SIGNAL_LABELS } from "@/data/readinessModuleSeed";

type Props = {
  candidateId: string;
};

function signalBadge(signal: string | null) {
  if (!signal) return <Badge variant="secondary">Pending review</Badge>;
  const label = READINESS_SIGNAL_LABELS[signal as keyof typeof READINESS_SIGNAL_LABELS] ?? signal;
  const cls =
    signal === "strong"
      ? "bg-success text-success-foreground"
      : signal === "acceptable"
        ? "bg-primary/90 text-primary-foreground"
        : "bg-destructive/90 text-destructive-foreground";
  return <Badge className={cls}>{label}</Badge>;
}

function goNoGoLabel(evaluation: {
  red_flag: boolean;
  cultural_signal: string | null;
  technical_signal: string | null;
  approved_for_activation: boolean;
}) {
  if (evaluation.red_flag) return { label: "No-Go", variant: "destructive" as const };
  if (!evaluation.cultural_signal || !evaluation.technical_signal) {
    return { label: "Awaiting admin review", variant: "secondary" as const };
  }
  const weak =
    evaluation.cultural_signal === "weak" || evaluation.technical_signal === "weak";
  if (weak) return { label: "No-Go", variant: "destructive" as const };
  if (evaluation.approved_for_activation) {
    return { label: "Go — approved for activation", variant: "default" as const };
  }
  return { label: "Review complete — pending approval", variant: "outline" as const };
}

export default function EmployerReadinessSummary({ candidateId }: Props) {
  const { data: evaluation, isLoading, isError } = useEmployerReadinessEvaluation(candidateId);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Readiness summary is not available yet.
        </CardContent>
      </Card>
    );
  }

  if (!evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Readiness — Go / No-Go</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The candidate is in Readiness. Curated signals will appear here after admin review.
          </p>
        </CardContent>
      </Card>
    );
  }

  const decision = goNoGoLabel(evaluation);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Readiness — Go / No-Go</CardTitle>
        <p className="text-sm text-muted-foreground">
          Curated signals from the Readiness programme. Test answers and internal notes are not
          shown.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Recommendation</span>
          <Badge variant={decision.variant}>{decision.label}</Badge>
        </div>

        {evaluation.red_flag && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p>Admin flagged a serious concern for this candidate during Readiness review.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cultural & Social</p>
            {signalBadge(evaluation.cultural_signal)}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Technical</p>
            {signalBadge(evaluation.technical_signal)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
