import { cn } from "@/lib/utils";
import { mentorMeetingCountForTrack } from "@/lib/mentorProgram";
import type { MentorProgramMeeting } from "@/lib/mentorProgram";
import type { Track } from "@/lib/track";

type Props = {
  meetings: MentorProgramMeeting[];
  track?: Track | null;
  compact?: boolean;
};

export default function MentorMeetingDots({ meetings, track, compact }: Props) {
  const total = mentorMeetingCountForTrack(track);
  const applicable = meetings.filter((m) => m.status !== "not_applicable").slice(0, total);

  if (!applicable.length) return null;

  return (
    <div className={cn("flex items-center gap-2", compact ? "gap-1.5" : "gap-2")}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const m = applicable.find((x) => x.meeting_number === n);
        const done = m?.status === "completed";
        const active = m?.status === "available";
        return (
          <div key={n} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "rounded-full border-2 transition-colors",
                compact ? "h-2.5 w-2.5" : "h-3 w-3",
                done && "bg-success border-success",
                active && !done && "bg-primary border-primary",
                !done && !active && "bg-muted border-muted-foreground/30"
              )}
              title={`Meeting ${n}${done ? " — done" : active ? " — current" : " — upcoming"}`}
            />
            {!compact && (
              <span className="text-[10px] text-muted-foreground">{n}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
