import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, UserCheck, Building2, CheckCircle } from "lucide-react";

const activityLog = [
  { id: 1, action: "Marked Readiness complete", target: "Emma Lindqvist", type: "candidate", time: "2025-03-11 10:32", user: "Admin" },
  { id: 2, action: "Verified company", target: "StartupHub Finland", type: "company", time: "2025-03-11 09:15", user: "Admin" },
  { id: 3, action: "Sent reminder", target: "Lars Andersen", type: "candidate", time: "2025-03-10 16:45", user: "Admin" },
  { id: 4, action: "Completed task on behalf of company", target: "TechNordic AB", type: "company", time: "2025-03-10 14:20", user: "Admin" },
  { id: 5, action: "Updated candidate status", target: "Sofia Virtanen", type: "candidate", time: "2025-03-10 11:00", user: "Admin" },
];

const AdminActivity = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Activity log</h1>
      <p className="text-muted-foreground">Who did what and when — for transparency and debugging</p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLog.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-3 rounded-lg border bg-card"
            >
              {item.type === "candidate" ? (
                <UserCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              ) : (
                <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.action}</p>
                <p className="text-sm text-muted-foreground">
                  {item.target} · {item.time}
                </p>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">{item.user}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminActivity;
