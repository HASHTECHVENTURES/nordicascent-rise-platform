import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Loader2, Search, Shield } from "lucide-react";
import { useActivityLog } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";

const AdminSecurity = () => {
  const { data: activityLog, isLoading } = useActivityLog();
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    const q = search.toLowerCase();
    return (activityLog ?? []).filter((log) => {
      const actor = log.profiles as { full_name: string | null } | null;
      return (
        log.action.toLowerCase().includes(q) ||
        (actor?.full_name?.toLowerCase().includes(q) ?? false) ||
        log.entity_type.toLowerCase().includes(q)
      );
    });
  }, [activityLog, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-muted-foreground">Audit activity from the platform database</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Shield className="h-5 w-5" />
            Auth & access
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>Admin accounts are invite-only. Password policy and 2FA are managed in Supabase → Authentication.</p>
          <p>Row Level Security is enabled on platform tables.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Audit log</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity logged yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const actor = log.profiles as { full_name: string | null } | null;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action.replace(/_/g, " ")}</TableCell>
                      <TableCell>{actor?.full_name ?? "System"}</TableCell>
                      <TableCell>{log.entity_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
