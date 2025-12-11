import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, MoreHorizontal, Eye, Ban, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const users = [
  { id: 1, name: "Emma Lindqvist", email: "emma@email.com", role: "candidate", status: "active", joined: "2024-01-15" },
  { id: 2, name: "Johan Eriksson", email: "johan@technordic.com", role: "employer", status: "active", joined: "2024-02-20" },
  { id: 3, name: "Maria Hansen", email: "maria@nordic.dk", role: "employer", status: "pending", joined: "2024-03-10" },
];

const AdminUsers = () => (
  <div className="space-y-6">
    <div><h1 className="text-3xl font-bold tracking-tight">User Management</h1><p className="text-muted-foreground">Manage platform users</p></div>
    <Card>
      <CardHeader>
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search users..." className="pl-9" /></div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center gap-4">
                <Avatar><AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                <div><h3 className="font-medium">{user.name}</h3><p className="text-sm text-muted-foreground">{user.email}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{user.role}</Badge>
                <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>{user.status}</Badge>
                <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end"><DropdownMenuItem><Eye className="h-4 w-4 mr-2" />View</DropdownMenuItem><DropdownMenuItem className="text-destructive"><Ban className="h-4 w-4 mr-2" />Suspend</DropdownMenuItem></DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AdminUsers;
