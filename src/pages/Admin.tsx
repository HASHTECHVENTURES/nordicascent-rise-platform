import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, Building, Lock, FileText, Search, Plus, Edit, Trash2, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { employees, departments } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const roles = [{ name: "Super Admin", permissions: "Full access to all features", users: 2 }, { name: "Admin", permissions: "Manage users, settings, and reports", users: 3 }, { name: "HR", permissions: "Manage employees, trainings, and leave", users: 5 }, { name: "Manager", permissions: "View team data, approve requests", users: 12 }, { name: "Employee", permissions: "Basic access to self-service features", users: 134 }];
const permissionMatrix = [{ feature: "User Management", superAdmin: true, admin: true, hr: true, manager: false, employee: false }, { feature: "Training Management", superAdmin: true, admin: true, hr: true, manager: true, employee: false }, { feature: "Report Generation", superAdmin: true, admin: true, hr: true, manager: true, employee: false }, { feature: "Leave Approval", superAdmin: true, admin: true, hr: true, manager: true, employee: false }, { feature: "System Settings", superAdmin: true, admin: true, hr: false, manager: false, employee: false }, { feature: "Security Settings", superAdmin: true, admin: false, hr: false, manager: false, employee: false }, { feature: "View Own Profile", superAdmin: true, admin: true, hr: true, manager: true, employee: true }, { feature: "Edit Own Profile", superAdmin: true, admin: true, hr: true, manager: true, employee: true }];
const auditLogs = [{ id: 1, action: "User Created", user: "Astrid Nilsson", target: "Oscar Berg", time: "2 hours ago", type: "create" }, { id: 2, action: "Role Changed", user: "Admin", target: "Erik Lindqvist → Manager", time: "5 hours ago", type: "update" }, { id: 3, action: "Training Assigned", user: "HR System", target: "All Employees", time: "1 day ago", type: "assign" }, { id: 4, action: "Settings Updated", user: "Super Admin", target: "Security Settings", time: "2 days ago", type: "update" }, { id: 5, action: "User Deactivated", user: "Astrid Nilsson", target: "Former Employee", time: "3 days ago", type: "delete" }];

export default function Admin() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const handleSaveSettings = () => { toast({ title: "Settings Saved", description: "Your changes have been saved successfully." }); };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Administration</h1><p className="text-muted-foreground">Manage users, roles, and system settings.</p></div>
        <Button className="nordic-gradient"><Plus className="mr-2 h-4 w-4" />Add User</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ icon: Users, label: "Total Users", value: "156", color: "bg-primary/10 text-primary" }, { icon: Shield, label: "Roles", value: "5", color: "bg-success/10 text-success" }, { icon: Building, label: "Departments", value: departments.length.toString(), color: "bg-warning/10 text-warning" }, { icon: Lock, label: "Security", value: "Active", color: "bg-accent text-accent-foreground", valueColor: "text-success" }].map((stat) => (
          <Card key={stat.label}><CardContent className="pt-6 flex items-center gap-3"><div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className={`text-2xl font-bold ${stat.valueColor || ""}`}>{stat.value}</p></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList><TabsTrigger value="users">User Management</TabsTrigger><TabsTrigger value="roles">Roles & Permissions</TabsTrigger><TabsTrigger value="departments">Departments</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger><TabsTrigger value="logs">Audit Logs</TabsTrigger></TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card><CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
              <Select defaultValue="all"><SelectTrigger className="w-40"><SelectValue placeholder="Role" /></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem>{roles.map((role) => (<SelectItem key={role.name} value={role.name.toLowerCase()}>{role.name}</SelectItem>))}</SelectContent></Select>
            </div>
          </CardHeader><CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Last Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {employees.slice(0, 5).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar><AvatarFallback className="bg-primary/10 text-primary">{user.avatar}</AvatarFallback></Avatar><div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div></div></TableCell>
                    <TableCell><Badge variant="secondary">{user.role.includes("Manager") ? "Manager" : "Employee"}</Badge></TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell><Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">2 hours ago</TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Roles</CardTitle></CardHeader><CardContent className="space-y-4">
              {roles.map((role) => (<div key={role.name} className="flex items-center justify-between p-4 rounded-lg border border-border"><div><h4 className="font-medium">{role.name}</h4><p className="text-sm text-muted-foreground">{role.permissions}</p></div><div className="flex items-center gap-3"><Badge variant="secondary">{role.users} users</Badge><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></div></div>))}
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Permission Matrix</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Feature</TableHead><TableHead className="text-center">Super Admin</TableHead><TableHead className="text-center">Admin</TableHead><TableHead className="text-center">HR</TableHead><TableHead className="text-center">Manager</TableHead><TableHead className="text-center">Employee</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {permissionMatrix.map((row) => (<TableRow key={row.feature}><TableCell className="font-medium">{row.feature}</TableCell><TableCell className="text-center">{row.superAdmin ? <CheckCircle className="h-4 w-4 text-success mx-auto" /> : "-"}</TableCell><TableCell className="text-center">{row.admin ? <CheckCircle className="h-4 w-4 text-success mx-auto" /> : "-"}</TableCell><TableCell className="text-center">{row.hr ? <CheckCircle className="h-4 w-4 text-success mx-auto" /> : "-"}</TableCell><TableCell className="text-center">{row.manager ? <CheckCircle className="h-4 w-4 text-success mx-auto" /> : "-"}</TableCell><TableCell className="text-center">{row.employee ? <CheckCircle className="h-4 w-4 text-success mx-auto" /> : "-"}</TableCell></TableRow>))}
                  </TableBody>
                </Table>
              </div>
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Department Structure</CardTitle><Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Department</Button></CardHeader><CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (<div key={dept} className="p-4 rounded-lg border border-border"><div className="flex items-center justify-between"><h4 className="font-medium">{dept}</h4><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button></div><p className="text-sm text-muted-foreground mt-1">{employees.filter(e => e.department === dept).length} employees</p></div>))}
            </div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card><CardHeader><CardTitle>Security Settings</CardTitle></CardHeader><CardContent className="space-y-6">
              {[{ label: "Two-Factor Authentication", description: "Require 2FA for all admin users", enabled: true }, { label: "Session Timeout", description: "Auto-logout after 30 minutes of inactivity", enabled: true }, { label: "Password Complexity", description: "Enforce strong password requirements", enabled: true }, { label: "IP Whitelisting", description: "Restrict access to specific IP addresses", enabled: false }, { label: "Audit Logging", description: "Log all user actions for compliance", enabled: true }].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between"><div><Label htmlFor={setting.label} className="font-medium">{setting.label}</Label><p className="text-sm text-muted-foreground">{setting.description}</p></div><Switch id={setting.label} defaultChecked={setting.enabled} /></div>
              ))}
              <Button onClick={handleSaveSettings} className="w-full nordic-gradient mt-4">Save Security Settings</Button>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Security Status</CardTitle></CardHeader><CardContent className="space-y-4">
              {[{ label: "SSL Certificate", status: "valid", message: "Expires in 320 days" }, { label: "Database Encryption", status: "valid", message: "AES-256 enabled" }, { label: "API Security", status: "valid", message: "Rate limiting active" }, { label: "Backup Status", status: "warning", message: "Last backup 6 hours ago" }].map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">{item.status === "valid" ? <CheckCircle className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-warning" />}<div className="flex-1"><p className="font-medium">{item.label}</p><p className="text-sm text-muted-foreground">{item.message}</p></div></div>
              ))}
            </CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Audit Logs</CardTitle><Button variant="outline" size="sm">Export Logs</Button></CardHeader><CardContent>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-4 rounded-lg border border-border">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${log.type === "create" ? "bg-success/10" : log.type === "update" ? "bg-primary/10" : log.type === "delete" ? "bg-destructive/10" : "bg-warning/10"}`}>
                    {log.type === "create" ? <Plus className="h-5 w-5 text-success" /> : log.type === "update" ? <Edit className="h-5 w-5 text-primary" /> : log.type === "delete" ? <Trash2 className="h-5 w-5 text-destructive" /> : <Info className="h-5 w-5 text-warning" />}
                  </div>
                  <div className="flex-1"><p className="font-medium">{log.action}</p><p className="text-sm text-muted-foreground">By {log.user} • {log.target}</p></div>
                  <span className="text-sm text-muted-foreground">{log.time}</span>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
