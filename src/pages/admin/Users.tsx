import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MoreHorizontal, Eye, Ban, Loader2, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAdminUsers, useUpdateUserAccountStatus } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const { data: users, isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserAccountStatus();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (users ?? []).filter(
      (u) =>
        !q ||
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false) ||
        u.role.includes(q),
    );
  }, [users, search]);

  const toggleSuspend = async (id: string, current: string) => {
    const next = current === "suspended" ? "active" : "suspended";
    try {
      await updateStatus.mutateAsync({ id, account_status: next });
      toast({ title: next === "suspended" ? "User suspended" : "User reactivated" });
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
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
      <div><h1 className="text-3xl font-bold tracking-tight">User Management</h1><p className="text-muted-foreground">Manage platform users</p></div>
      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Avatar><AvatarFallback>{(user.full_name ?? "?").split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="font-medium">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{user.role}</Badge>
                  <Badge variant={user.account_status === "suspended" ? "destructive" : "secondary"}>
                    {user.account_status ?? "active"}
                  </Badge>
                  <p className="text-xs text-muted-foreground">Joined {user.created_at.split("T")[0]}</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={user.role === "candidate" ? `/admin/candidates` : user.role === "employer" ? `/admin/employers` : `/admin/users`}>
                          <Eye className="h-4 w-4 mr-2" />View portal
                        </Link>
                      </DropdownMenuItem>
                      {user.account_status === "suspended" ? (
                        <DropdownMenuItem onClick={() => toggleSuspend(user.id, user.account_status)}>
                          <CheckCircle className="h-4 w-4 mr-2" />Reactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-destructive" onClick={() => toggleSuspend(user.id, user.account_status ?? "active")}>
                          <Ban className="h-4 w-4 mr-2" />Suspend
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No users match your search.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
