import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, DollarSign, Calendar, Clock, FileText, Send, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const offers = [
  { id: 1, candidate: "Anna Svensson", role: "Product Manager", salary: "€72,000", bonus: "€5,000", startDate: "2024-04-15", sentDate: "2024-03-10", expiresIn: 7, status: "pending" },
  { id: 2, candidate: "Erik Hansen", role: "Frontend Developer", salary: "€65,000", bonus: "€3,000", startDate: "2024-05-01", sentDate: "2024-03-08", expiresIn: 5, status: "pending" },
  { id: 3, candidate: "Sofia Virtanen", role: "UX Designer", salary: "€58,000", bonus: null, startDate: "2024-04-01", sentDate: "2024-03-01", expiresIn: 0, status: "accepted" },
  { id: 4, candidate: "Lars Andersen", role: "Backend Engineer", salary: "€70,000", bonus: "€4,000", startDate: "2024-04-15", sentDate: "2024-02-20", expiresIn: 0, status: "declined" },
];

const EmployerOffers = () => {
  const pending = offers.filter(o => o.status === 'pending');
  const accepted = offers.filter(o => o.status === 'accepted');
  const declined = offers.filter(o => o.status === 'declined');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
          <p className="text-muted-foreground">Manage job offers to candidates</p>
        </div>
        <Button className="gap-2 bg-employer-accent hover:bg-employer-accent/90"><Plus className="h-4 w-4" />Create Offer</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-employer-accent/10 to-transparent border-employer-accent/20"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-warning">{pending.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Accepted</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-chart-success">{accepted.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Declined</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-destructive">{declined.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Acceptance Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">75%</div></CardContent></Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Offers</h2>
          <div className="space-y-4">
            {pending.map((offer) => (
              <Card key={offer.id} className={offer.expiresIn <= 5 ? "border-chart-warning" : ""}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12"><AvatarFallback className="bg-employer-accent/10 text-employer-accent">{offer.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="font-semibold">{offer.candidate}</h3>
                        <p className="text-sm text-muted-foreground">{offer.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><p className="text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Salary</p><p className="font-medium">{offer.salary}</p></div>
                        <div><p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Start</p><p className="font-medium">{offer.startDate}</p></div>
                        <div><p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Expires</p><p className={`font-medium ${offer.expiresIn <= 5 ? 'text-chart-warning' : ''}`}>{offer.expiresIn} days</p></div>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                      <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><FileText className="h-4 w-4 mr-2" />View Offer</DropdownMenuItem>
                          <DropdownMenuItem><Send className="h-4 w-4 mr-2" />Resend</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Withdraw</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Accepted</h2>
            {accepted.map((offer) => (
              <Card key={offer.id} className="border-chart-success/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-chart-success" />
                      <div><h3 className="font-medium">{offer.candidate}</h3><p className="text-sm text-muted-foreground">{offer.role} • {offer.salary}</p></div>
                    </div>
                    <Badge className="bg-chart-success">Accepted</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Declined</h2>
            {declined.map((offer) => (
              <Card key={offer.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <XCircle className="h-5 w-5 text-destructive" />
                      <div><h3 className="font-medium">{offer.candidate}</h3><p className="text-sm text-muted-foreground">{offer.role} • {offer.salary}</p></div>
                    </div>
                    <Badge variant="destructive">Declined</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerOffers;
