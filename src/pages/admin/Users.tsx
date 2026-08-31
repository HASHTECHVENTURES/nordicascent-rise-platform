import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Ban, Loader2, CheckCircle, Shield } from "lucide-react";
import { useAdminUsers, useUpdateUserAccountStatus, useUpdateAdminTier } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminTier, type AdminTier } from "@/lib/adminAccess";

const AdminUsers = () => {
  const { data: users, isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserAccountStatus();
  const updateTier = useUpdateAdminTier();
  const { toast } = useToast();
  const { profile, isMasterAdmin } = useAuth();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (users ?? []).filter(
      (u) =>
        !q ||
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false),
    );
  }, [users, search]);

  const toggleSuspend = async (id: string, current: string) => {
    const next = current === "suspended" ? "active" : "suspended";
    try {
      await updateStatus.mutateAsync({ id, account_status: next });
      toast({ title: next === "suspended" ? "Admin suspended" : "Admin reactivated" });
    } catch (err) {
      toast({ title: "Failed", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const toggleTier = async (id: string, current: AdminTier) => {
    const next: AdminTier = current === "master" ? "regular" : "master";
    try {
      await updateTier.mutateAsync({ id, admin_tier: next });
      toast({ title: next === "master" ? "Promoted to Master admin" : "Changed to Regular admin" });
    } catch (err) {
      toast({
        title: "Tier update failed",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
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
      <div>
        <h1 className="text-2xl font-medium">Portal admins</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Nordic Ascent admin accounts only. Master admins can access Settings and delete data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search admins..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((user) => {
            const tier = getAdminTier(user) ?? "regular";
            const isSelf = user.id === profile?.id;
            return (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback><Shield className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={tier === "master" ? "default" : "outline"}>
                    {tier === "master" ? "Master admin" : "Regular admin"}
                  </Badge>
                  <Badge variant={user.account_status === "suspended" ? "destructive" : "secondary"}>
                    {user.account_status ?? "active"}
                  </Badge>
                  {isMasterAdmin && !isSelf && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateTier.isPending}
                      onClick={() => toggleTier(user.id, tier)}
                    >
                      {tier === "master" ? "Make regular" : "Make master"}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isSelf || updateStatus.isPending}
                    onClick={() => toggleSuspend(user.id, user.account_status ?? "active")}
                  >
                    {user.account_status === "suspended" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Reactivate
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4 mr-1" />
                        Suspend
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
