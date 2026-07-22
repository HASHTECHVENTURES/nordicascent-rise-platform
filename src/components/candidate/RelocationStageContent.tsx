import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import { useStageTasks } from "@/hooks/useData";
import { useMyRelocationContext } from "@/hooks/useRelocation";
import RelocationStepsPanel from "@/components/relocation/RelocationStepsPanel";
import { stageTaskPath } from "@/lib/stageRoutes";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1513622470522-26c3c8a084bc?w=1600&auto=format&fit=crop";
const HERO_FALLBACK_CLASS =
  "bg-gradient-to-br from-slate-700 via-slate-600 to-primary/70";

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

export default function RelocationStageContent() {
  const stageId = "relocation";
  const { data: ctx, isLoading: ctxLoading } = useMyRelocationContext();
  const { data: tasks, isLoading: tasksLoading, isError, refetch } = useStageTasks(stageId);

  const taskList = tasks ?? [];
  const relocationDone = Boolean(ctx?.relocationCompletedAt) || ctx?.relocationStatus === "arrived";

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
          alt="Relocation to the Nordics"
          className="h-48 sm:h-56 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5" />
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">
              Relocation
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium">Your move to the Nordics</h1>
          <p className="text-white/85 text-sm mt-1 max-w-xl">
            Nordic Ascent coordinates your relocation with partners. Follow progress below and use
            the guides for practical next steps.
          </p>
          {ctx?.companyName && ctx?.jobTitle && (
            <p className="text-white/75 text-sm mt-2">
              {ctx.companyName} · {ctx.jobTitle}
            </p>
          )}
        </div>
      </div>

      {ctx?.applicationId &&
      (ctx.finalClearanceDate ||
        ctx.applicationStatus === "relocation" ||
        ctx.applicationStatus === "pre_arrival" ||
        ctx.applicationStatus === "onboarding" ||
        ctx.applicationStatus === "followup" ||
        ctx.applicationStatus === "journey_complete") ? (
        <RelocationStepsPanel
          applicationId={ctx.applicationId}
          applicationStatus={ctx.applicationStatus}
          familyRelocating={ctx.familyRelocating}
          familyMemberCount={ctx.familyMemberCount}
          role="candidate"
          embedded
        />
      ) : (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground text-center">
            Relocation progress appears once Final Clearance is Clear.
          </CardContent>
        </Card>
      )}

      {relocationDone && (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">You have arrived</p>
              <p className="text-sm text-muted-foreground mt-1">
                Continue to Onboarding for your next steps.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to="/candidate/onboarding">
                Continue to Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Relocation guides</h2>
          <p className="text-sm text-muted-foreground">
            Reference material from Nordic Ascent — progress above tracks official coordination.
          </p>
        </div>

        {tasksLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="py-10 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Could not load relocation guides. Please refresh or try again.
              </p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : taskList.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Relocation guides are being prepared. Check back soon or contact Nordic Ascent in
              Messages.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {taskList.map((task) => (
              <Card key={task.id} className="overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative h-40 w-full overflow-hidden">
                  <SafeImage
                    src={task.image_url}
                    alt={task.title}
                    className="h-full w-full object-cover"
                    fallbackClassName="bg-gradient-to-br from-muted to-muted-foreground/20"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium leading-snug">{task.title}</CardTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground font-normal">{task.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <Button size="sm" variant="outline" asChild className="gap-1">
                    <Link to={stageTaskPath(stageId, task.id)}>
                      Read guide
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
