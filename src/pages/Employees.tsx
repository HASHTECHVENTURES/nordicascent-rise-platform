import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, UserPlus, Mail, MoreHorizontal, Eye, Edit, Trash2, Download } from "lucide-react";
import { employees, departments } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function Employees() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || emp.email.toLowerCase().includes(searchQuery.toLowerCase()) || emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || emp.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Employee Added", description: "New employee has been added successfully." });
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Employees</h1><p className="text-muted-foreground">Manage your team members and their information.</p></div>
        <div className="flex gap-3">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild><Button className="nordic-gradient"><UserPlus className="mr-2 h-4 w-4" />Add Employee</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Add New Employee</DialogTitle><DialogDescription>Enter the details for the new team member.</DialogDescription></DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" required /></div>
                  <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" required /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required /></div>
                <div className="space-y-2"><Label htmlFor="role">Role</Label><Input id="role" required /></div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger><SelectContent>{departments.map((dept) => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent></Select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" className="nordic-gradient">Add Employee</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total Employees</p><p className="text-3xl font-bold mt-1">{employees.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Active</p><p className="text-3xl font-bold mt-1 text-success">{employees.filter(e => e.status === "active").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">On Leave</p><p className="text-3xl font-bold mt-1 text-warning">{employees.filter(e => e.status === "on-leave").length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Departments</p><p className="text-3xl font-bold mt-1">{new Set(employees.map(e => e.department)).size}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by name, email, or role..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}><SelectTrigger className="w-full md:w-48"><SelectValue placeholder="All Departments" /></SelectTrigger><SelectContent><SelectItem value="all">All Departments</SelectItem>{departments.map((dept) => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}</SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Trainings</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell><div className="flex items-center gap-3"><Avatar><AvatarFallback className="bg-primary/10 text-primary">{employee.avatar}</AvatarFallback></Avatar><div><p className="font-medium">{employee.name}</p><p className="text-sm text-muted-foreground">{employee.email}</p></div></div></TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell><Badge variant={employee.status === "active" ? "default" : "secondary"}>{employee.status === "active" ? "Active" : "On Leave"}</Badge></TableCell>
                  <TableCell>{employee.completedTrainings} completed</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild><Link to={`/employees/${employee.id}`}><Eye className="mr-2 h-4 w-4" />View Profile</Link></DropdownMenuItem>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Send Email</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredEmployees.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No employees found matching your criteria.</p></div>}
        </CardContent>
      </Card>
    </div>
  );
}
