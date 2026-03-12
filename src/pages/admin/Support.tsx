import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Building2, UserCheck } from "lucide-react";
import { useState } from "react";

const inboxItems = [
  { id: 1, from: "Rahul Sharma", type: "candidate", subject: "Cannot upload CV", message: "I get an error when uploading my CV in the Preparation step.", date: "2025-03-10", unread: true },
  { id: 2, from: "Nordic Innovations", type: "company", subject: "Verification documents", message: "We have submitted our verification documents. Please confirm receipt.", date: "2025-03-09", unread: true },
  { id: 3, from: "Emma Lindqvist", type: "candidate", subject: "Readiness module access", message: "Technical Assessment Module 2 is not opening. Can you check?", date: "2025-03-08", unread: false },
];

const AdminSupport = () => {
  const [selected, setSelected] = useState<typeof inboxItems[0] | null>(inboxItems[0]);
  const [reply, setReply] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Inbox</h1>
        <p className="text-muted-foreground">See and reply to contact and help messages from candidates and companies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Messages</CardTitle>
            <p className="text-xs text-muted-foreground">{inboxItems.filter((i) => i.unread).length} unread</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {inboxItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${selected?.id === item.id ? "bg-muted" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {item.type === "candidate" ? (
                      <UserCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <Building2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{item.from}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subject}</p>
                      {item.unread && (
                        <Badge variant="secondary" className="mt-1 text-xs">New</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            {selected ? (
              <>
                <CardTitle className="text-base flex items-center gap-2">
                  {selected.type === "candidate" ? <UserCheck className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                  {selected.from}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{selected.subject}</p>
                <p className="text-xs text-muted-foreground">{selected.date}</p>
              </>
            ) : (
              <CardTitle className="text-base">Select a message</CardTitle>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {selected && (
              <>
                <div className="p-4 rounded-lg bg-muted/50 text-sm">
                  {selected.message}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Reply</label>
                  <Textarea
                    placeholder="Type your reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <Button className="mt-2 gap-2">
                    <Mail className="h-4 w-4" />
                    Send reply
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSupport;
