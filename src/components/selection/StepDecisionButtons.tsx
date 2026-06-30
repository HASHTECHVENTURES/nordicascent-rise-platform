import { Button } from "@/components/ui/button";
import type { StepDecision } from "@/lib/selectionModule";

type Props = {
  onDecision: (decision: StepDecision) => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function StepDecisionButtons({ onDecision, loading, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        disabled={disabled || loading}
        onClick={() => onDecision("pass")}
      >
        Pass
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={disabled || loading}
        onClick={() => onDecision("reject")}
      >
        Reject
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || loading}
        onClick={() => onDecision("review")}
      >
        Review
      </Button>
    </div>
  );
}
