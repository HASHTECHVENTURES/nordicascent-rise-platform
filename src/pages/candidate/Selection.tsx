import { useEffect } from "react";
import { useMyApplications } from "@/hooks/useData";
import { useJobsAccessLock } from "@/hooks/useJobsAccessLock";
import CandidateApplications from "@/pages/candidate/Applications";
import CandidateJobs from "@/pages/candidate/Jobs";
import SelectionStageContent from "@/components/candidate/SelectionStageContent";
import { hasUnlockedPipeline } from "@/lib/applicationJourney";

/**
 * Selection = My Journey hub for job roles + applications (including Offee).
 * Browse/apply and status tracking live here — not as separate sidebar items.
 */
export default function CandidateSelection() {
  const { jobsOpen } = useJobsAccessLock();
  const { data: applications } = useMyApplications();
  const apps = applications ?? [];
  const unlocked = hasUnlockedPipeline(apps);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Selection</h1>
        <p className="text-muted-foreground mt-1">
          Apply to open roles and follow your selection journey — including Offee — in one place.
        </p>
      </div>

      <section id="applications" className="scroll-mt-6">
        <CandidateApplications embedded />
      </section>

      {jobsOpen && (
        <section id="roles" className="scroll-mt-6">
          <CandidateJobs embedded />
        </section>
      )}

      {unlocked && <SelectionStageContent embedded />}
    </div>
  );
}
