import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useIssues, useResolveIssue } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const AdminIssues = () => {
  const { data: issues, isLoading } = useIssues();
  const resolveIssue = useResolveIssue();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const list = issues ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
        <p className="text-muted-foreground">Platform issues requiring attention</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{list.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{list.filter((i) => i.status === "open").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{list.filter((i) => i.status === "in_progress").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-success">{list.filter((i) => i.status === "resolved").length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" />All issues</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No issues reported. Great!</p>
          )}
          {list.map((issue) => {
            const candidate = issue.candidates as { profiles: { full_name: string | null } | null } | null;
            return (
              <div key={issue.id} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{issue.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {candidate?.profiles?.full_name ?? "Platform"} · {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={issue.priority === "high" || issue.priority === "critical" ? "destructive" : "secondary"}>{issue.priority}</Badge>
                  <Badge>{issue.status}</Badge>
                  {issue.status !== "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resolveIssue.isPending}
                      onClick={async () => {
                        try {
                          await resolveIssue.mutateAsync(issue.id);
                          toast({ title: "Issue resolved" });
                        } catch (err) {
                          toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
                        }
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIssues;
