import { Loader2 } from "lucide-react";
import { useTrack } from "@/lib/track";
import InternshipCheckpointsPanel from "@/components/activation/InternshipCheckpointsPanel";
import InternshipCompletionDiploma from "@/components/activation/InternshipCompletionDiploma";
import PreInternshipGatePanel from "@/components/activation/PreInternshipGatePanel";
import PreArrivalCheckpointsPanel from "@/components/activation/PreArrivalCheckpointsPanel";
import CandidateVisitNotice from "@/components/activation/CandidateVisitNotice";
import MentorAssignedBanner from "@/components/mentor/MentorAssignedBanner";
import { useMyActivationContext, useActivationRecord } from "@/hooks/useActivation";
import { useMyMentorProgramContext } from "@/hooks/useMentorProgram";

export default function CandidateActivation() {
  const [track] = useTrack();
  const isEntry = track === "entry";
  const { data: ctx, isLoading } = useMyActivationContext();
  const { data: activationRecord } = useActivationRecord(ctx?.applicationId);
  const mentorCtx = useMyMentorProgramContext();
  const preArrivalUnlocked = activationRecord?.status === "cleared";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Activation</h1>
        <p className="text-muted-foreground mt-1">
          {isEntry
            ? "Internship and Pre Arrival Employment — mentor meetings 4–6 run in parallel."
            : "Pre-arrival and employment activation before you start full-time."}
        </p>
        {ctx?.companyName && ctx?.jobTitle && (
          <p className="text-sm text-muted-foreground mt-2">
            {ctx.companyName} · {ctx.jobTitle}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {mentorCtx.mentor && (
        <MentorAssignedBanner
          mentor={mentorCtx.mentor}
          company={mentorCtx.company}
          meetings={mentorCtx.meetings}
          track={mentorCtx.track}
        />
      )}

      {isEntry && ctx?.applicationId && (
        <>
          <PreInternshipGatePanel
            applicationId={ctx.applicationId}
            companyName={ctx.companyName}
            jobTitle={ctx.jobTitle}
            canCandidate
          />
          <InternshipCheckpointsPanel
            applicationId={ctx.applicationId}
            canEdit={false}
            showStatus={false}
            showEvaluation={false}
          />
          <InternshipCompletionDiploma
            applicationId={ctx.applicationId}
            companyName={ctx.companyName}
            jobTitle={ctx.jobTitle}
            canDownload
          />
        </>
      )}

      {isEntry && !isLoading && !ctx?.applicationId && (
        <p className="text-sm text-muted-foreground">
          Internship checkpoints appear once your company and admin have unlocked activation.
        </p>
      )}

      {ctx?.applicationId && <CandidateVisitNotice applicationId={ctx.applicationId} />}

      {ctx?.applicationId && (
        <PreArrivalCheckpointsPanel
          applicationId={ctx.applicationId}
          canConfirmCandidate={preArrivalUnlocked}
          embedded={isEntry}
        />
      )}
    </div>
  );
}
