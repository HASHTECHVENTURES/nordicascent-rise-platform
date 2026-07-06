import { useTrack } from "@/lib/track";
import StageTasksPanel from "@/components/candidate/StageTasksPanel";

export default function CandidateActivation() {
  const [track] = useTrack();
  const isEntry = track === "entry";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Activation</h1>
        <p className="text-muted-foreground mt-1">
          {isEntry
            ? "Internship first, then pre-arrival employment — both part of activation."
            : "Pre-arrival and employment activation before you start full-time."}
        </p>
      </div>

      {isEntry && (
        <StageTasksPanel
          stageId="internship"
          embedded
          sectionTitle="Step 1 — Internship"
          nestedInActivation
        />
      )}

      <StageTasksPanel
        stageId="activation"
        embedded={isEntry}
        sectionTitle={isEntry ? "Step 2 — Pre-arrival employment" : undefined}
        title={isEntry ? undefined : "Activation"}
        description={
          isEntry
            ? undefined
            : "Work permit and pre-employment steps before you start full-time"
        }
      />
    </div>
  );
}
