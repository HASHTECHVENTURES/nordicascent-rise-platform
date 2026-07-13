import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight } from "lucide-react";
import AdminStageTasks from "./StageTasks";
import { useAdminRelocationApplications } from "@/hooks/useRelocation";
import { useRelocationCheckpoints } from "@/hooks/useRelocation";
import { useActivationRecord } from "@/hooks/useActivation";
import { resolveProfile } from "@/lib/resolveProfile";
import { relocationCheckpointProgress } from "@/lib/relocationModule";
import type { SelectionApplication } from "@/lib/selectionModule";
import type { Track } from "@/lib/track";
import { TRACK_META } from "@/lib/track";

function RelocationAppRow({ app }: { app: SelectionApplication }) {
  const profile = resolveProfile(app.candidates?.profiles);
  const track =
    (app.track as Track | null) ??
    ((app.candidates as { track?: Track } | null)?.track ?? "entry");
  const { data: checkpoints } = useRelocationCheckpoints(app.id);
  const { data: record } = useActivationRecord(app.id);
  const progress = relocationCheckpointProgress(checkpoints ?? []);

  return (
    <Link
      to={`/admin/relocation/${app.id}`}
      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="font-medium truncate">{profile?.full_name ?? "Candidate"}</p>
        <p className="text-xs text-muted-foreground">
          {app.jobs?.title} · {TRACK_META[track].label}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {record?.relocation_completed_at ? (
          <Badge className="bg-success text-success-foreground text-xs">Complete</Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            {progress.done}/{progress.total}
          </Badge>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

export default function AdminRelocation() {
  const { data: apps, isLoading } = useAdminRelocationApplications();

  const list = apps ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Relocation</h1>
        <p className="text-muted-foreground">
          Module 5 — track visa, housing, travel, and settling-in checkpoints per candidate.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Candidates unlock relocation after pre-arrival employment is complete. Six sequential
          checkpoints gate progress to onboarding.
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidates in relocation</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No candidates in relocation yet. They appear here after pre-arrival is complete.
            </p>
          ) : (
            <div className="space-y-2">
              {list.map((app) => (
                <RelocationAppRow key={app.id} app={app} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminStageTasks
        fixedStageId="relocation"
        title="Relocation guides"
        description="Manage relocation cards with images and step-by-step content for candidates"
      />
    </div>
  );
}
