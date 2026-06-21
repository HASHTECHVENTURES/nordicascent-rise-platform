import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useMyTaskProgress } from "@/hooks/useData";
import { syncEligibleTasks } from "@/lib/syncProfileTasks";
import { completePreparationIfReady } from "@/lib/pipelineProgress";

/**
 * Auto-marks preparation tasks complete when profile/CV/skills requirements are met.
 */
export function useSyncEligibleTasks() {
  const qc = useQueryClient();
  const { profile, candidate, refreshProfile } = useAuth();
  const { data: taskProgress } = useMyTaskProgress();
  const syncing = useRef(false);

  useEffect(() => {
    if (!candidate?.id || !profile || syncing.current) return;

    const run = async () => {
      syncing.current = true;
      try {
        const changed = await syncEligibleTasks(candidate.id, profile, candidate);
        const stageCompleted = await completePreparationIfReady(candidate.id);
        if (changed || stageCompleted) {
          await refreshProfile();
          qc.invalidateQueries({ queryKey: ["task-progress"] });
          qc.invalidateQueries({ queryKey: ["stage-progress"] });
        }
      } finally {
        syncing.current = false;
      }
    };

    void run();
  }, [candidate, profile, taskProgress, qc, refreshProfile]);
}
