import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, UserCheck, Loader2, Send } from "lucide-react";
import {
  useSupportTickets,
  useSupportTicketMessages,
  useReplySupportTicket,
  useCloseSupportTicket,
} from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";

const AdminSupport = () => {
  const { data: tickets, isLoading } = useSupportTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const replyTicket = useReplySupportTicket();
  const closeTicket = useCloseSupportTicket();

  const list = tickets ?? [];
  const selected = list.find((t) => t.id === selectedId) ?? list[0];
  const { data: messages } = useSupportTicketMessages(selected?.id);

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    await replyTicket.mutateAsync({ ticketId: selected.id, body: reply.trim() });
    setReply("");
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Support Inbox</h1>
        <p className="text-muted-foreground">Support tickets from candidates and companies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Tickets</CardTitle>
            <p className="text-xs text-muted-foreground">{list.filter((t) => t.status === "open").length} open</p>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {list.length === 0 && <p className="p-4 text-sm text-muted-foreground">No support tickets yet.</p>}
            {list.map((item) => {
              const profile = item.profiles as { full_name: string | null; email: string | null } | null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-4 hover:bg-muted/50 ${selected?.id === item.id ? "bg-muted" : ""}`}
                >
                  <p className="font-medium text-sm truncate">{profile?.full_name ?? profile?.email ?? "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.subject}</p>
                  {item.status === "open" && <Badge variant="secondary" className="mt-1 text-xs">Open</Badge>}
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            {selected ? (
              <>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {(selected.profiles as { full_name: string | null })?.full_name ?? "User"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{selected.subject}</p>
                <div className="flex gap-2 items-center">
                  <Badge>{selected.status}</Badge>
                  <Badge variant="outline">{selected.priority}</Badge>
                  {selected.status === "open" && (
                    <Button size="sm" variant="outline" onClick={() => closeTicket.mutate(selected.id)}>
                      Close ticket
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <CardTitle className="text-base">Select a ticket</CardTitle>
            )}
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {selected ? (
              <>
                <ScrollArea className="flex-1 max-h-80 mb-4">
                  <div className="space-y-3">
                    {(messages ?? []).map((msg) => {
                      const sender = msg.profiles as { full_name: string | null } | null;
                      return (
                        <div key={msg.id} className="p-3 rounded border bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">
                            {sender?.full_name ?? "User"} · {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                {selected.status === "open" && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Reply to ticket..."
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
              <p className="text-muted-foreground text-sm">No ticket selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSupport;
