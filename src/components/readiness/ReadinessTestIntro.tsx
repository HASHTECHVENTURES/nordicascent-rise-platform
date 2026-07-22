import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { getReadinessLevelSubtitle, hasStrictTimer } from "@/lib/readiness";
import type { ReadinessTest } from "@/hooks/useReadiness";
import { useReadinessCms } from "@/hooks/useReadiness";

type Props = {
  test: ReadinessTest;
  onNext: () => void;
  starting?: boolean;
};

export default function ReadinessTestIntro({ test, onNext, starting }: Props) {
  const strictTimer = hasStrictTimer(test);
  const { data: cms, isLoading } = useReadinessCms();

  if (isLoading || !cms) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/candidate/readiness">Back to Readiness</Link>
      </Button>

      <div>
        <p className="text-sm font-medium text-primary">Before you begin</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">{test.title}</h1>
        {test.subtitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {getReadinessLevelSubtitle(test.level, test.subtitle)}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Read this first
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm leading-relaxed text-muted-foreground space-y-4 whitespace-pre-wrap">
            {cms.pre_test_note.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
          {strictTimer ? (
            <p className="text-sm font-medium text-foreground border-t pt-4 whitespace-pre-wrap">
              {cms.timer_hard_note}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground border-t pt-4 whitespace-pre-wrap">
              {cms.timer_soft_note}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pb-8">
        <Button size="lg" className="gap-2 min-w-[140px]" onClick={onNext} disabled={starting}>
          {starting ? "Starting…" : "Next"}
          {!starting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
