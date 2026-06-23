import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Building2, Eye, Download, Loader2, Users } from "lucide-react";
import {
  useAdminEmployers,
  useAdminEmployerUsers,
  useDeleteCompany,
  useDeleteEmployerUser,
} from "@/hooks/useData";
import AdminDeleteButton from "@/components/admin/AdminDeleteButton";
import { useToast } from "@/hooks/use-toast";

const AdminEmployers = () => {
  const { data: employers, isLoading: companiesLoading } = useAdminEmployers();
  const { data: employerUsers, isLoading: usersLoading } = useAdminEmployerUsers();
  const deleteCompany = useDeleteCompany();
  const deleteEmployerUser = useDeleteEmployerUser();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const companies = useMemo(() => {
    const q = search.toLowerCase();
    return (employers ?? []).filter(
      (e) => !q || e.name.toLowerCase().includes(q) || (e.location ?? "").toLowerCase().includes(q),
    );
  }, [employers, search]);

  const users = useMemo(() => {
    const q = userSearch.toLowerCase();
    return (employerUsers ?? []).filter(
      (u) =>
        !q ||
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.email?.toLowerCase().includes(q) ?? false),
    );
  }, [employerUsers, userSearch]);

  if (companiesLoading || usersLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Companies</h1>
          <p className="text-sm text-muted-foreground mt-1">Company accounts and employer logins</p>
        </div>
      </div>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies" className="gap-2">
            <Building2 className="h-4 w-4" />
            Companies ({companies.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Company users ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-6 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search companies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => {
              const headers = ["Name", "Industry", "Location", "Status"];
              const rows = companies.map((e) => [e.name, e.industry ?? "", e.location ?? "", e.status]);
              const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = "companies.csv"; a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 space-y-3">
              {companies.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No companies registered.</p>
              )}
              {companies.map((emp) => {
                const contacts = (emp.employers ?? []) as Array<{
                  profiles: { full_name: string | null; email: string | null } | null;
                }>;
                const contactEmail = contacts[0]?.profiles?.email;
                return (
                  <div key={emp.id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{emp.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {emp.location ?? "—"} · {contactEmail ?? "No contact"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{emp.status}</Badge>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/admin/employers/${emp.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <AdminDeleteButton
                        label="Delete"
                        title={`Delete ${emp.name}?`}
                        description="Permanently removes this company, all jobs, applications, and employer login accounts. This cannot be undone."
                        isPending={deleteCompany.isPending}
                        onConfirm={async () => {
                          try {
                            await deleteCompany.mutateAsync(emp.id);
                            toast({ title: "Company deleted" });
                          } catch (err) {
                            toast({
                              title: "Delete failed",
                              description: err instanceof Error ? err.message : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search company users..." className="pl-9" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employer login accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No company users found.</p>
              )}
              {users.map((user) => {
                const employer = (user.employers as Array<{
                  title: string | null;
                  companies: { name: string } | null;
                }> | null)?.[0];
                const companyName = employer?.companies?.name ?? "—";
                return (
                  <div key={user.id} className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback>{(user.full_name ?? user.email ?? "?").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.full_name ?? "Employer user"}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{companyName}{employer?.title ? ` · ${employer.title}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Employer</Badge>
                      <AdminDeleteButton
                        label="Delete"
                        title={`Delete ${user.full_name ?? user.email}?`}
                        description="Removes this employer login account. The company record stays unless you delete the whole company."
                        isPending={deleteEmployerUser.isPending}
                        onConfirm={async () => {
                          try {
                            await deleteEmployerUser.mutateAsync(user.id);
                            toast({ title: "Company user deleted" });
                          } catch (err) {
                            toast({
                              title: "Delete failed",
                              description: err instanceof Error ? err.message : "Try again",
                              variant: "destructive",
                            });
                          }
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminEmployers;
