import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Megaphone, UserCheck, Building2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAnnouncements, useCreateAnnouncement } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const AdminNotifications = () => {
  const [audience, setAudience] = useState<"candidates" | "companies" | "all">("candidates");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const createAnnouncement = useCreateAnnouncement();
  const { data: announcements, isLoading } = useAnnouncements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    try {
      await createAnnouncement.mutateAsync({ title: subject, body, audience });
      toast({ title: "Announcement sent", description: "In-app notifications were created for the selected audience." });
      setSubject("");
      setBody("");
    } catch (err) {
      toast({
        title: "Failed to send",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">Send in-app notifications to candidates, companies, or everyone</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            New announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Send to</Label>
              <RadioGroup
                value={audience}
                onValueChange={(v) => setAudience(v as "candidates" | "companies" | "all")}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="candidates" id="candidates" />
                  <label htmlFor="candidates" className="flex items-center gap-2 cursor-pointer">
                    <UserCheck className="h-4 w-4" /> All candidates
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="companies" id="companies" />
                  <label htmlFor="companies" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="h-4 w-4" /> All companies
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <label htmlFor="all" className="cursor-pointer">Everyone</label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. New feature: Profile export"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Write your announcement..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="resize-none"
                required
              />
            </div>
            <Button type="submit" className="gap-2" disabled={createAnnouncement.isPending}>
              {createAnnouncement.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />}
              Send announcement
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (announcements ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements yet.</p>
          ) : (
            <div className="space-y-4">
              {(announcements ?? []).map((a) => (
                <div key={a.id} className="p-4 rounded border">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{a.title}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{a.body}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
