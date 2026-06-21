import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, UserCheck, Building2, Loader2 } from "lucide-react";
import { useActivityLog } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";

const AdminActivity = () => {
  const { data: activityLog, isLoading } = useActivityLog();

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
        <h1 className="text-3xl font-bold tracking-tight">Activity log</h1>
        <p className="text-muted-foreground">Who did what and when — for transparency and debugging</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(activityLog ?? []).length === 0 && (
              <p className="text-muted-foreground text-center py-8">No activity logged yet.</p>
            )}
            {(activityLog ?? []).map((item) => {
              const actor = item.profiles as { full_name: string | null } | null;
              return (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
                  {item.entity_type === "candidate" ? (
                    <UserCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  ) : (
                    <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.action.replace(/_/g, " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.entity_type} · {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">{actor?.full_name ?? "System"}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivity;
