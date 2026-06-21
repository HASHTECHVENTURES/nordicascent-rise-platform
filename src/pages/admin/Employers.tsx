import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Building2, MoreHorizontal, Eye, CheckCircle, Ban, Download, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useAdminEmployers, useRemoveCompany } from "@/hooks/useData";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminEmployers = () => {
  const { data: employers, isLoading } = useAdminEmployers();
  const removeCompany = useRemoveCompany();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const list = useMemo(() => {
    const q = search.toLowerCase();
    return (employers ?? []).filter(
      (e) => !q || e.name.toLowerCase().includes(q) || (e.location ?? "").toLowerCase().includes(q),
    );
  }, [employers, search]);

  const handleRemove = async (id: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from the platform? All their jobs will be closed.`)) return;
    try {
      await removeCompany.mutateAsync(id);
      toast({ title: "Company removed", description: "Their jobs no longer appear for candidates." });
    } catch (err) {
      toast({
        title: "Could not remove company",
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-muted-foreground">See and fix company issues</p>
        </div>
        <Button variant="outline" className="gap-2 w-fit" onClick={() => {
          const headers = ["Name", "Industry", "Location", "Status", "Joined"];
          const rows = list.map((e) => [e.name, e.industry ?? "", e.location ?? "", e.status, e.created_at.split("T")[0]]);
          const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a"); a.href = url; a.download = "companies-export.csv"; a.click();
          URL.revokeObjectURL(url);
        }}>
          <Download className="h-4 w-4" />Export companies
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{list.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-success">{list.filter((e) => e.status === "verified").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-warning">{list.filter((e) => e.status === "pending").length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Suspended</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{list.filter((e) => e.status === "suspended").length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search companies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {list.length === 0 && <p className="text-center text-muted-foreground py-8">No companies registered yet.</p>}
            {list.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-employer-accent/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-employer-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{emp.name}</h3>
                      {emp.status === "verified" && <CheckCircle className="h-4 w-4 text-chart-success" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{emp.location ?? "—"} · {emp.industry ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={emp.status === "verified" ? "default" : "secondary"}>{emp.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild><Link to={`/admin/employers/${emp.id}`}><Eye className="h-4 w-4 mr-2" />View & fix</Link></DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        disabled={removeCompany.isPending}
                        onClick={() => handleRemove(emp.id, emp.name)}
                      >
                        <Ban className="h-4 w-4 mr-2" />Remove company
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEmployers;
