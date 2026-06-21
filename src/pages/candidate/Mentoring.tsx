import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Video, Loader2, ExternalLink } from "lucide-react";
import { useMentoringSessions } from "@/hooks/useData";
import { format } from "date-fns";

const CandidateMentoring = () => {
  const { data: sessions, isLoading } = useMentoringSessions();
  const list = sessions ?? [];
  const upcoming = list.filter((s) => s.status === "scheduled" && new Date(s.scheduled_at) >= new Date());
  const past = list.filter((s) => s.status === "completed" || new Date(s.scheduled_at) < new Date());
  const next = upcoming[0];
  const mentor = next?.mentor as { full_name: string | null; avatar_url: string | null } | null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Mentoring</h1>
        <p className="text-muted-foreground">Your mentoring sessions from Readiness through Onboarding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-lg">Your Mentor</CardTitle></CardHeader>
          <CardContent>
            {mentor ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={mentor.avatar_url ?? undefined} />
                  <AvatarFallback>{(mentor.full_name ?? "?").slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{mentor.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Assigned mentor</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No mentor assigned yet. Sessions will appear here once scheduled.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Upcoming Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">No upcoming sessions.</p>}
            {upcoming.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 border rounded-lg gap-3">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(s.scheduled_at), "PPp")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge><Video className="h-3 w-3 mr-1 inline" />{s.status}</Badge>
                  {s.meeting_url && (
                    <Button size="sm" asChild>
                      <a href={s.meeting_url} target="_blank" rel="noopener noreferrer">
                        Join
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {past.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Past Sessions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {past.map((s) => (
              <div key={s.id} className="p-4 border rounded-lg">
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(s.scheduled_at), "PP")}</p>
                {s.notes && <p className="text-sm mt-2">{s.notes}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidateMentoring;
