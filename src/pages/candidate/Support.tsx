import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import {
  useCreateSupportTicket,
  useMySupportTickets,
  useSupportTicketMessages,
  useReplySupportTicket,
} from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function CandidateSupport() {
  const { profile } = useAuth();
  const { data: tickets, isLoading } = useMySupportTickets();
  const createTicket = useCreateSupportTicket();
  const replyTicket = useReplySupportTicket();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const list = tickets ?? [];
  const selected = list.find((t) => t.id === selectedId) ?? list[0];
  const { data: messages } = useSupportTicketMessages(selected?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTicket.mutateAsync({ subject, body });
      toast({ title: "Support ticket created" });
      setSubject("");
      setBody("");
    } catch (err) {
      toast({
        title: "Failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    try {
      await replyTicket.mutateAsync({ ticketId: selected.id, body: reply.trim() });
      setReply("");
    } catch (err) {
      toast({ title: "Failed to send", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support</h1>
        <p className="text-muted-foreground">Get help from the Nordic Ascent team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">New ticket</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} required />
              </div>
              <Button type="submit" disabled={createTicket.isPending} className="w-full">
                {createTicket.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit ticket"}
              </Button>
            </form>
          </CardContent>
          <CardHeader className="border-t"><CardTitle className="text-base">Your tickets</CardTitle></CardHeader>
          <CardContent className="p-0 divide-y">
            {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto my-4" />}
            {list.length === 0 && !isLoading && <p className="p-4 text-sm text-muted-foreground">No tickets yet.</p>}
            {list.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-4 hover:bg-muted/50 ${selected?.id === t.id ? "bg-muted" : ""}`}
              >
                <p className="font-medium text-sm truncate">{t.subject}</p>
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</p>
                <Badge variant="outline" className="mt-1 text-xs">{t.status}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col min-h-[24rem]">
          <CardHeader>
            {selected ? (
              <>
                <CardTitle className="text-base">{selected.subject}</CardTitle>
                <Badge variant="outline">{selected.status}</Badge>
              </>
            ) : (
              <CardTitle className="text-base">Select a ticket</CardTitle>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {selected ? (
              <>
                <ScrollArea className="flex-1 max-h-80 mb-4 pr-2">
                  <div className="space-y-3">
                    {(messages ?? []).map((msg) => {
                      const isMe = msg.sender_id === profile?.id;
                      const sender = msg.profiles as { full_name: string | null } | null;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] rounded-lg p-3 text-sm ${isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            <p className="whitespace-pre-wrap">{msg.body}</p>
                            <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                              {sender?.full_name ?? "Support"} · {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                {selected.status !== "closed" && (
                  <div className="flex gap-2 border-t pt-4">
                    <Input
                      placeholder="Reply..."
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    />
                    <Button onClick={handleReply} disabled={replyTicket.isPending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Open a ticket to see the conversation.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
