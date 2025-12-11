import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, Calendar, Clock, FileText, CheckCircle, XCircle, Gift } from "lucide-react";

const offers = [
  { 
    id: 1, 
    company: "DesignHub Finland", 
    role: "UI Engineer", 
    location: "Helsinki, FI",
    salary: "€75,000", 
    bonus: "€5,000 signing",
    benefits: ["Health Insurance", "Remote Work", "Stock Options", "25 days PTO"],
    startDate: "2024-04-15",
    expiresIn: 5,
    status: "pending" 
  },
  { 
    id: 2, 
    company: "TechNordic AB", 
    role: "Senior Frontend Developer", 
    location: "Stockholm, SE",
    salary: "€82,000", 
    bonus: "€8,000 signing",
    benefits: ["Health Insurance", "Hybrid Work", "Pension Plan", "30 days PTO"],
    startDate: "2024-05-01",
    expiresIn: 12,
    status: "pending" 
  },
  { 
    id: 3, 
    company: "DataFlow Norway", 
    role: "Full Stack Developer", 
    location: "Oslo, NO",
    salary: "€70,000", 
    bonus: null,
    benefits: ["Health Insurance", "On-site Gym", "20 days PTO"],
    startDate: "2024-04-01",
    expiresIn: 0,
    status: "expired" 
  },
];

const CandidateOffers = () => {
  const pendingOffers = offers.filter(o => o.status === 'pending');
  const expiredOffers = offers.filter(o => o.status === 'expired');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Offers</h1>
        <p className="text-muted-foreground">Review and respond to your offers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-chart-success/10 to-transparent border-chart-success/20">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Offers</CardTitle>
            <Gift className="h-4 w-4 text-chart-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOffers.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€82,000</div>
            <p className="text-xs text-muted-foreground">TechNordic AB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-warning">1</div>
            <p className="text-xs text-muted-foreground">Within 5 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Offers</h2>
          <div className="space-y-4">
            {pendingOffers.map((offer) => (
              <Card key={offer.id} className={offer.expiresIn <= 5 ? "border-chart-warning" : "border-chart-success/50"}>
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-lg bg-chart-success/10 flex items-center justify-center">
                          <Building2 className="h-7 w-7 text-chart-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-xl">{offer.role}</h3>
                          <p className="text-muted-foreground flex items-center gap-1">
                            {offer.company}
                            <span className="mx-2">•</span>
                            <MapPin className="h-3 w-3" />
                            {offer.location}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Salary
                          </p>
                          <p className="font-semibold text-lg">{offer.salary}</p>
                        </div>
                        {offer.bonus && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              Bonus
                            </p>
                            <p className="font-semibold text-lg">{offer.bonus}</p>
                          </div>
                        )}
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start Date
                          </p>
                          <p className="font-semibold">{offer.startDate}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${offer.expiresIn <= 5 ? 'bg-chart-warning/10' : 'bg-muted/50'}`}>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires In
                          </p>
                          <p className={`font-semibold ${offer.expiresIn <= 5 ? 'text-chart-warning' : ''}`}>
                            {offer.expiresIn} days
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Benefits</p>
                        <div className="flex flex-wrap gap-2">
                          {offer.benefits.map((benefit) => (
                            <Badge key={benefit} variant="secondary">{benefit}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 lg:w-48">
                      <Button className="bg-chart-success hover:bg-chart-success/90 gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Accept Offer
                      </Button>
                      <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                        <XCircle className="h-4 w-4" />
                        Decline
                      </Button>
                      <Button variant="ghost" className="gap-2">
                        <FileText className="h-4 w-4" />
                        View Full Offer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {expiredOffers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Expired Offers</h2>
            <div className="space-y-4">
              {expiredOffers.map((offer) => (
                <Card key={offer.id} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium">{offer.role}</h3>
                          <p className="text-sm text-muted-foreground">{offer.company} • {offer.salary}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Expired</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateOffers;
