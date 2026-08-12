import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useMentorMeetingThemes,
  useUpdateMentorMeetingTheme,
} from "@/hooks/useMentorProgram";
import { MENTOR_MEETING_TITLES } from "@/lib/mentorProgram";
import { PageSpinner } from "@/components/ui/PageSpinner";

type ThemeDraft = {
  meeting_number: number;
  title: string;
  theme_body: string;
  phase: string;
};

export default function MentorCmsPanel() {
  const { toast } = useToast();
  const { data: themes, isLoading } = useMentorMeetingThemes();
  const updateTheme = useUpdateMentorMeetingTheme();
  const [drafts, setDrafts] = useState<ThemeDraft[]>([]);
  const [savingNumber, setSavingNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!themes) return;
    setDrafts(
      themes.map((t) => ({
        meeting_number: t.meeting_number,
        title: t.title,
        theme_body: t.theme_body,
        phase: t.phase,
      }))
    );
  }, [themes]);

  if (isLoading) return <PageSpinner size="section" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentor meeting agendas (CMS)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Shared agenda source for candidates (agenda only) and mentors (agenda + observation form).
          One observation form is reused across all six meetings.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {drafts.map((draft) => (
          <div key={draft.meeting_number} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                Meeting {draft.meeting_number} · {draft.phase}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setDrafts((prev) =>
                    prev.map((d) =>
                      d.meeting_number === draft.meeting_number
                        ? {
                            ...d,
                            title: MENTOR_MEETING_TITLES[d.meeting_number] ?? d.title,
                          }
                        : d
                    )
                  )
                }
              >
                Reset title
              </Button>
            </div>
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) =>
                  setDrafts((prev) =>
                    prev.map((d) =>
                      d.meeting_number === draft.meeting_number
                        ? { ...d, title: e.target.value }
                        : d
                    )
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Agenda (one bullet per line)</Label>
              <Textarea
                rows={5}
                value={draft.theme_body}
                onChange={(e) =>
                  setDrafts((prev) =>
                    prev.map((d) =>
                      d.meeting_number === draft.meeting_number
                        ? { ...d, theme_body: e.target.value }
                        : d
                    )
                  )
                }
              />
            </div>
            <Button
              size="sm"
              disabled={updateTheme.isPending && savingNumber === draft.meeting_number}
              onClick={async () => {
                setSavingNumber(draft.meeting_number);
                try {
                  await updateTheme.mutateAsync({
                    meeting_number: draft.meeting_number,
                    title: draft.title,
                    theme_body: draft.theme_body,
                  });
                  toast({ title: `Meeting ${draft.meeting_number} agenda saved` });
                } catch (err) {
                  toast({
                    title: "Save failed",
                    description: err instanceof Error ? err.message : "Try again",
                    variant: "destructive",
                  });
                } finally {
                  setSavingNumber(null);
                }
              }}
            >
              {updateTheme.isPending && savingNumber === draft.meeting_number ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save meeting {draft.meeting_number}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
