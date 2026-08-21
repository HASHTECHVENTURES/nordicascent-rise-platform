import { Card, CardContent } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import MentorMeetingDots from "@/components/mentor/MentorMeetingDots";
import type { MentorProgramMeeting } from "@/lib/mentorProgram";
import type { Track } from "@/lib/track";

type MentorInfo = {
  name: string;
  role_title?: string | null;
};

type CompanyInfo = {
  name: string;
};

type Props = {
  mentor: MentorInfo | null | undefined;
  company?: CompanyInfo | null;
  meetings?: MentorProgramMeeting[];
  track?: Track | null;
  showProgress?: boolean;
};

export default function MentorAssignedBanner({
  mentor,
  company,
  meetings,
  track,
  showProgress = true,
}: Props) {
  if (!mentor) return null;

  const role = mentor.role_title?.trim();
  const companyName = company?.name?.trim();

  return (
    <Card className="border-2 border-nordic-orange bg-nordic-orange/15 shadow-sm">
      <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-nordic-orange text-white">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-nordic-orange">Your mentor</p>
            <p className="text-sm mt-1 text-foreground">
              Your mentor is <strong>{mentor.name}</strong>
              {role ? `, ${role}` : ""}
              {companyName ? ` at ${companyName}` : ""}.
            </p>
          </div>
        </div>
        {showProgress && meetings && meetings.length > 0 && (
          <div className="text-right space-y-1">
            <p className="text-xs text-muted-foreground">Mentor meetings</p>
            <MentorMeetingDots meetings={meetings} track={track} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
