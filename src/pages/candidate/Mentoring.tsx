import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMyReadinessAttempts, useReadinessTests } from "@/hooks/useReadiness";
import { useMyApplications, useMentoringSessions } from "@/hooks/useData";
import { allTestsSubmitted } from "@/lib/readiness";
import { canAccessMentoring } from "@/lib/candidateJourney";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Video, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import MentorAssignedBanner from "@/components/mentor/MentorAssignedBanner";
import { useMyMentorProgramContext } from "@/hooks/useMentorProgram";

const CandidateMentoring = () => {
  const { profile, candidate } = useAuth();
  const { data: tests } = useReadinessTests();
  const { data: attempts } = useMyReadinessAttempts();
  const { data: applications } = useMyApplications();
  const { data: sessions, isLoading } = useMentoringSessions();
  const mentorCtx = useMyMentorProgramContext();

  const submitted = tests && attempts ? allTestsSubmitted(tests, attempts) : false;
  const mentoringOpen = canAccessMentoring(profile, candidate, submitted, applications ?? []);

  if (!mentoringOpen) {
    return (
      <div className="space-y-6 max-w-lg">
        <h1 className="text-2xl font-medium">Mentoring</h1>
        <Card>
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm text-muted-foreground">Complete Readiness first.</p>
            <Button size="sm" asChild>
              <Link to="/candidate/readiness">Go to Readiness</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const list = sessions ?? [];
  const upcoming = list.filter((s) => s.status === "scheduled" && new Date(s.scheduled_at) >= new Date());
  const past = list.filter((s) => s.status === "completed" || new Date(s.scheduled_at) < new Date());
  const next = upcoming[0];
  const legacyMentor = next?.mentor as { full_name: string | null; avatar_url: string | null } | null;
  const mentorName = mentorCtx.mentor?.name ?? legacyMentor?.full_name;
  const mentorAvatar = legacyMentor?.avatar_url;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">Mentoring</h1>

      {mentorCtx.mentor ? (
        <MentorAssignedBanner
          mentor={mentorCtx.mentor}
          company={mentorCtx.company}
          meetings={mentorCtx.meetings}
          track={mentorCtx.track}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Your mentor will appear here once assigned.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Mentor contact</CardTitle></CardHeader>
          <CardContent>
            {mentorName ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={mentorAvatar ?? undefined} />
                  <AvatarFallback>{mentorName.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{mentorName}</h3>
                  {mentorCtx.mentor?.role_title && (
                    <p className="text-sm text-muted-foreground">{mentorCtx.mentor.role_title}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No mentor assigned yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Upcoming</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 && (
              <p className="text-sm text-muted-foreground">No sessions scheduled yet.</p>
            )}
            {upcoming.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg gap-3">
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(s.scheduled_at), "PPp")}
                  </p>
                </div>
                {s.meeting_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={s.meeting_url} target="_blank" rel="noopener noreferrer">
                      <Video className="h-4 w-4 mr-2" />
                      Join
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {past.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Past sessions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {past.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(s.scheduled_at), "PPp")}</p>
                </div>
                <Badge variant="secondary">{s.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidateMentoring;
