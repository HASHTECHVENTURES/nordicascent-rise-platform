import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Rocket } from "lucide-react";
import type { Track } from "@/lib/track";

type PipelineProps = {
  variant: "pipeline-unlocked";
  continueHref?: string;
  continueLabel?: string;
};

type ActivationProps = {
  variant: "activation-unlocked";
  track: Track;
};

type Props = PipelineProps | ActivationProps;

export default function JourneyUnlockedBanner(props: Props) {
  if (props.variant === "activation-unlocked") {
    const { track } = props;
    return (
      <Card className="border-nordic-orange/40 bg-nordic-orange/5">
        <CardContent className="pt-6 flex items-start gap-3">
          <Rocket className="h-5 w-5 text-nordic-orange shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium">Readiness complete: Activation is open</p>
            <p className="text-sm text-muted-foreground">
              {track === "entry"
                ? "Your digital internship and pre-arrival steps are ready. Mentor meetings 4-6 continue in parallel."
                : "Your pre-arrival employment steps are ready. Continue in Activation before relocation."}
            </p>
            <Button size="sm" asChild>
              <Link to="/candidate/activation">
                Continue to Activation
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { continueHref, continueLabel = "Continue journey" } = props;
  return (
    <Card className="border-success/30 bg-success/5">
      <CardContent className="pt-6 flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">You&apos;re in the programme</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your candidate journey has started. Track your progress below.
          </p>
          {continueHref && (
            <Button size="sm" className="mt-3" asChild>
              <Link to={continueHref}>
                {continueLabel}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
