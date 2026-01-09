import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Users, Plus, Pencil, Trash2, Upload } from "lucide-react";

const benefits = ["Health Insurance", "Remote Work Options", "Stock Options", "25 Days PTO", "Learning Budget", "Gym Membership"];
const locations = [
  { id: 1, city: "Stockholm", country: "Sweden", address: "Kungsgatan 12", type: "Headquarters" },
  { id: 2, city: "Copenhagen", country: "Denmark", address: "Nørrebrogade 45", type: "Office" },
];

const EmployerCompanyProfile = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground">Manage your company information</p>
      </div>
      <Button className="gap-2 bg-employer-accent hover:bg-employer-accent/90">Save Changes</Button>
    </div>

    <Tabs defaultValue="info" className="space-y-6">
      <TabsList>
        <TabsTrigger value="info" className="gap-2"><Building2 className="h-4 w-4" />Company Info</TabsTrigger>
        <TabsTrigger value="culture" className="gap-2"><Users className="h-4 w-4" />Culture & Benefits</TabsTrigger>
        <TabsTrigger value="locations" className="gap-2"><MapPin className="h-4 w-4" />Locations</TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded bg-employer-accent/10 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-employer-accent" />
              </div>
              <Button variant="outline" className="gap-2"><Upload className="h-4 w-4" />Upload Logo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Company Name</Label><Input defaultValue="TechNordic AB" /></div>
              <div className="space-y-2"><Label>Industry</Label><Input defaultValue="Technology / Software" /></div>
              <div className="space-y-2"><Label>Company Size</Label><Input defaultValue="50-200 employees" /></div>
              <div className="space-y-2"><Label>Founded</Label><Input defaultValue="2018" /></div>
              <div className="space-y-2"><Label>Website</Label><Input defaultValue="https://technordic.com" /></div>
              <div className="space-y-2"><Label>LinkedIn</Label><Input defaultValue="linkedin.com/company/technordic" /></div>
            </div>
            <div className="space-y-2"><Label>About</Label><Textarea rows={4} defaultValue="TechNordic is a leading software company building innovative solutions for the Nordic market..." /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="culture">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Benefits</CardTitle><Button size="sm" className="gap-2 bg-employer-accent hover:bg-employer-accent/90"><Plus className="h-4 w-4" />Add Benefit</Button></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {benefits.map((b) => (<Badge key={b} variant="secondary" className="text-sm py-1 px-3 gap-2">{b}<button className="hover:text-destructive">×</button></Badge>))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Company Culture</CardTitle></CardHeader>
            <CardContent><Textarea rows={6} defaultValue="At TechNordic, we believe in work-life balance, continuous learning, and building great products together. Our team is diverse, inclusive, and always pushing boundaries..." /></CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="locations">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Office Locations</CardTitle><Button size="sm" className="gap-2 bg-employer-accent hover:bg-employer-accent/90"><Plus className="h-4 w-4" />Add Location</Button></CardHeader>
          <CardContent className="space-y-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 rounded border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center"><MapPin className="h-5 w-5 text-muted-foreground" /></div>
                  <div>
                    <h3 className="font-medium">{loc.city}, {loc.country}</h3>
                    <p className="text-sm text-muted-foreground">{loc.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{loc.type}</Badge>
                  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

export default EmployerCompanyProfile;
