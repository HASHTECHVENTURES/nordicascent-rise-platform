import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Loader2 } from "lucide-react";
import { useStageTasks } from "@/hooks/useData";
import { useMyOnboardingContext } from "@/hooks/useModuleOnboarding";
import OnboardingTrackerPanel from "@/components/onboarding/OnboardingTrackerPanel";
import { stageTaskPath } from "@/lib/stageRoutes";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop";
const HERO_FALLBACK_CLASS =
  "bg-gradient-to-br from-emerald-800 via-emerald-700 to-primary/70";

function SafeImage({
  src,
  alt,
  className,
  fallbackClassName = HERO_FALLBACK_CLASS,
}: {
  src?: string | null;
  alt: string;
  className: string;
  fallbackClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`${className} ${fallbackClassName}`} role="img" aria-label={alt} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default function OnboardingStageContent() {
  const stageId = "onboarding";
  const { data: ctx, isLoading: ctxLoading } = useMyOnboardingContext();
  const { data: tasks, isLoading: tasksLoading } = useStageTasks(stageId);

  const taskList = tasks ?? [];
  const onboardingDone =
    Boolean(ctx?.onboardingCompletedAt) || ctx?.onboardingStatus === "onboarding_complete";

  if (ctxLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        <SafeImage
          src={taskList[0]?.image_url ?? HERO_IMAGE}
          alt="Onboarding at your Nordic workplace"
          className="h-48 sm:h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5" />
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">
              Onboarding
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium">Your first weeks in Norway</h1>
          <p className="text-white/85 text-sm mt-1 max-w-xl">
            From arrival through workplace integration — Nordic Ascent coordinates; you confirm the
            practical checklist.
          </p>
          {ctx?.companyName && ctx?.jobTitle && (
            <p className="text-white/75 text-sm mt-2">
              {ctx.companyName} · {ctx.jobTitle}
            </p>
          )}
        </div>
      </div>

      {ctx?.applicationId ? (
        <OnboardingTrackerPanel
          applicationId={ctx.applicationId}
          applicationStatus={ctx.applicationStatus}
          familyRelocating={ctx.familyRelocating}
          role="candidate"
          canEdit={!onboardingDone}
          embedded
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground text-center">
            Onboarding opens once your arrival is confirmed in Relocation.
          </CardContent>
        </Card>
      )}

      {onboardingDone && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">Onboarding complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                Continue to Follow-up for ongoing support.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to="/candidate/followup">
                Continue to Follow-up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {taskList.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Onboarding guides</h2>
            <p className="text-sm text-muted-foreground">Optional reference material.</p>
          </div>
          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {taskList.map((task) => (
                <Card key={task.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                    {task.description && (
                      <p className="text-sm text-muted-foreground font-normal">{task.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={stageTaskPath(stageId, task.id)}>Read guide</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
