import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { InternshipEvaluation } from "@/lib/activationModule";

export const INTERNSHIP_EVALUATION_FIELDS = [
  {
    key: "technical_execution" as const,
    label: "Technical execution",
    hint: "Performance on deliverables.",
    rows: 3,
  },
  {
    key: "communication" as const,
    label: "Communication",
    hint: "How well they worked in the team.",
    rows: 3,
  },
  {
    key: "collaboration_team_fit" as const,
    label: "Collaboration and team fit",
    hint: "Initiative, feedback, working style.",
    rows: 3,
  },
  {
    key: "overall_assessment" as const,
    label: "Overall assessment",
    hint: "Would you want this person full-time?",
    rows: 3,
  },
  {
    key: "concerns_risks" as const,
    label: "Concerns or risks",
    hint: "Anything giving pause?",
    rows: 3,
  },
] as const;

type FormState = {
  technical_execution: string;
  communication: string;
  collaboration_team_fit: string;
  overall_assessment: string;
  concerns_risks: string;
  event_date: string;
};

const emptyForm = (): FormState => ({
  technical_execution: "",
  communication: "",
  collaboration_team_fit: "",
  overall_assessment: "",
  concerns_risks: "",
  event_date: new Date().toISOString().slice(0, 10),
});

type Props = {
  canEdit?: boolean;
  evaluation?: InternshipEvaluation | null;
  isPending?: boolean;
  onSubmit?: (data: FormState) => void | Promise<void>;
};

export function InternshipEvaluationReadOnly({ evaluation }: { evaluation: InternshipEvaluation }) {
  return (
    <div className="text-sm bg-muted/50 rounded-md p-3 space-y-2">
      <p className="text-xs text-muted-foreground">
        Company internship evaluation — not shared with the university or candidate.
      </p>
      {INTERNSHIP_EVALUATION_FIELDS.map((f) => (
        <p key={f.key}>
          <span className="text-muted-foreground">{f.label}:</span>{" "}
          {evaluation[f.key]}
        </p>
      ))}
      <p className="text-xs text-muted-foreground pt-1">
        Submitted {new Date(evaluation.submitted_at).toLocaleDateString()}
      </p>
    </div>
  );
}

export default function InternshipEvaluationForm({
  canEdit = true,
  evaluation,
  isPending = false,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(() => {
    if (evaluation) {
      return {
        technical_execution: evaluation.technical_execution,
        communication: evaluation.communication,
        collaboration_team_fit: evaluation.collaboration_team_fit,
        overall_assessment: evaluation.overall_assessment,
        concerns_risks: evaluation.concerns_risks,
        event_date: evaluation.submitted_at.slice(0, 10),
      };
    }
    return emptyForm();
  });

  if (!canEdit && evaluation) {
    return <InternshipEvaluationReadOnly evaluation={evaluation} />;
  }

  if (!canEdit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFilled = INTERNSHIP_EVALUATION_FIELDS.every((f) => form[f.key].trim());
    if (!allFilled || !form.event_date) return;
    await onSubmit?.(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t">
      <div>
        <p className="text-sm font-medium">Internship evaluation</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          For Final Clearance only — separate from any academic evaluation sent to a university.
        </p>
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor="eval-date">Submission date</Label>
        <Input
          id="eval-date"
          type="date"
          value={form.event_date}
          onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
          required
        />
      </div>

      {INTERNSHIP_EVALUATION_FIELDS.map((field) => (
        <div key={field.key} className="space-y-1.5">
          <Label htmlFor={field.key}>{field.label}</Label>
          <p className="text-xs text-muted-foreground">{field.hint}</p>
          <Textarea
            id={field.key}
            rows={field.rows}
            value={form[field.key]}
            onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
            required
          />
        </div>
      ))}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit evaluation"}
      </Button>
    </form>
  );
}
