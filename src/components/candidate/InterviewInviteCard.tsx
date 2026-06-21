import { Calendar, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

type Props = {
  jobTitle: string;
  companyName?: string;
  meetUrl: string;
  scheduledAt: string;
  notes?: string | null;
  messagesPath?: string;
};

export default function InterviewInviteCard({
  jobTitle,
  companyName,
  meetUrl,
  scheduledAt,
  notes,
  messagesPath = "/candidate/messages",
}: Props) {
  const when = new Date(scheduledAt).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <Video className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Interview scheduled</p>
            <p className="text-sm text-muted-foreground mt-1">
              {companyName ? `${companyName} — ` : ""}{jobTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          {when}
        </div>
        {notes && (
          <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">{notes}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href={meetUrl} target="_blank" rel="noopener noreferrer">
              Join Google Meet
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link to={messagesPath}>View in Messages</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
