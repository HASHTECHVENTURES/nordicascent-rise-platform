import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, Globe, Users, Plus, Pencil, Trash2, Upload, Leaf } from "lucide-react";
import { useState } from "react";

const benefits = ["Health Insurance", "Remote Work Options", "Stock Options", "25 Days PTO", "Learning Budget", "Gym Membership"];
const locations = [
  { id: 1, city: "Stockholm", country: "Sweden", address: "Kungsgatan 12", type: "Headquarters" },
  { id: 2, city: "Copenhagen", country: "Denmark", address: "Nørrebrogade 45", type: "Office" },
];

const sdgGoals = [
  { id: 1, name: "No Poverty", color: "#E5243B" },
  { id: 2, name: "Zero Hunger", color: "#DDA63A" },
  { id: 3, name: "Good Health and Well-being", color: "#4C9F38" },
  { id: 4, name: "Quality Education", color: "#C5192D" },
  { id: 5, name: "Gender Equality", color: "#FF3A21" },
  { id: 6, name: "Clean Water and Sanitation", color: "#26BDE2" },
  { id: 7, name: "Affordable and Clean Energy", color: "#FCC30B" },
  { id: 8, name: "Decent Work and Economic Growth", color: "#A21942" },
  { id: 9, name: "Industry, Innovation and Infrastructure", color: "#FD6925" },
  { id: 10, name: "Reduced Inequalities", color: "#DD1367" },
  { id: 11, name: "Sustainable Cities and Communities", color: "#FD9D24" },
  { id: 12, name: "Responsible Consumption and Production", color: "#BF8B2E" },
  { id: 13, name: "Climate Action", color: "#3F7E44" },
  { id: 14, name: "Life Below Water", color: "#0A97D9" },
  { id: 15, name: "Life on Land", color: "#56C02B" },
  { id: 16, name: "Peace, Justice and Strong Institutions", color: "#00689D" },
  { id: 17, name: "Partnerships for the Goals", color: "#19486A" },
];

const EmployerCompanyProfile = () => {
  const [selectedSdgs, setSelectedSdgs] = useState<number[]>([8, 10, 4]);

  const toggleSdg = (id: number) => {
    setSelectedSdgs(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
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
          <TabsTrigger value="sustainability" className="gap-2"><Leaf className="h-4 w-4" />Sustainability</TabsTrigger>
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

        <TabsContent value="sustainability">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-success" />
                  Sustainable Development Goals (SDGs)
                </CardTitle>
                <p className="text-sm text-muted-foreground">Select the UN SDGs your company contributes to</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sdgGoals.map((goal) => {
                    const isSelected = selectedSdgs.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        onClick={() => toggleSdg(goal.id)}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/30'}
                        `}
                      >
                        <div
                          className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: goal.color }}
                        >
                          {goal.id}
                        </div>
                        <span className="text-sm font-medium leading-tight">{goal.name}</span>
                        {isSelected && (
                          <Checkbox checked className="ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sustainability Commitment</CardTitle>
                <p className="text-sm text-muted-foreground">Describe how your company works on sustainability</p>
              </CardHeader>
              <CardContent>
                <Textarea
                  rows={6}
                  placeholder="Describe your company's sustainability initiatives, environmental policies, social responsibility programs, and how you contribute to the selected SDGs..."
                  defaultValue="At TechNordic, sustainability is at the core of our operations. We are committed to reducing our carbon footprint through remote-first work policies, energy-efficient data centers, and sustainable procurement practices. We actively promote diversity and inclusion, invest in quality education through our internship programs, and ensure decent work conditions across our supply chain."
                />
              </CardContent>
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
};

export default EmployerCompanyProfile;
