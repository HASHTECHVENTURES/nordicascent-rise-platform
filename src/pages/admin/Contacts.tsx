import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail } from "lucide-react";
import {
  useContactSubmissions,
  useUpdateContactSubmission,
} from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";

export default function AdminContacts() {
  const { data: contacts, isLoading } = useContactSubmissions();
  const updateContact = useUpdateContactSubmission();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = contacts ?? [];
  const selected = list.find((c) => c.id === selectedId) ?? list[0];

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
        <h1 className="text-3xl font-bold tracking-tight">Contact Inbox</h1>
        <p className="text-muted-foreground">Messages from the public contact form</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Submissions</CardTitle>
            <p className="text-xs text-muted-foreground">{list.filter((c) => c.status === "new").length} unread</p>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {list.length === 0 && <p className="p-4 text-sm text-muted-foreground">No submissions yet.</p>}
            {list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-4 hover:bg-muted/50 ${selected?.id === c.id ? "bg-muted" : ""}`}
              >
                <p className="font-medium text-sm truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                {c.status === "new" && <Badge className="mt-1 text-xs">New</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            {selected ? (
              <>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" />
                  {selected.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{selected.email}</p>
              </>
            ) : (
              <CardTitle className="text-base">Select a submission</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                {selected.company && (
                  <p className="text-sm"><span className="text-muted-foreground">Topic: </span>{selected.company}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{selected.message}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
                </p>
                <div className="flex gap-2">
                  {selected.status === "new" && (
                    <Button
                      size="sm"
                      disabled={updateContact.isPending}
                      onClick={() => updateContact.mutate({ id: selected.id, status: "read" })}
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={updateContact.isPending}
                    onClick={() => updateContact.mutate({ id: selected.id, status: "archived" })}
                  >
                    Archive
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No submission selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
