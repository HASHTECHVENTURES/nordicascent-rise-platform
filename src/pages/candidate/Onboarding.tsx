import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  CheckCircle, 
  Circle, 
  Clock, 
  FileText, 
  Users, 
  MapPin, 
  Calendar,
  ArrowRight,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";

const onboardingSteps = [
  { id: 1, title: "Arrival Confirmation", status: "not_started", description: "Confirm travel dates and arrival", icon: Calendar },
  { id: 2, title: "Airport Pickup", status: "not_started", description: "Arrange transportation from airport", icon: MapPin },
  { id: 3, title: "Housing Setup", status: "not_started", description: "Move into your new accommodation", icon: Building2 },
  { id: 4, title: "Office Introduction", status: "not_started", description: "First day at the office", icon: Users },
  { id: 5, title: "Documentation Complete", status: "not_started", description: "Finalize all paperwork", icon: FileText },
];

const firstWeekSchedule = [
  { day: "Day 1", activity: "Welcome meeting & office tour", time: "09:00-12:00" },
  { day: "Day 2", activity: "Team introductions & project overview", time: "09:00-17:00" },
  { day: "Day 3", activity: "System access & tool setup", time: "09:00-12:00" },
  { day: "Day 4", activity: "First project assignment", time: "09:00-17:00" },
  { day: "Day 5", activity: "Week review & feedback session", time: "14:00-16:00" },
];

const resources = [
  { id: 1, title: "Office Map & Facilities Guide", type: "PDF", category: "Office" },
  { id: 2, title: "Team Directory", type: "Document", category: "Team" },
  { id: 3, title: "IT Setup Instructions", type: "Guide", category: "Technical" },
  { id: 4, title: "Company Handbook", type: "PDF", category: "General" },
  { id: 5, title: "Emergency Contacts", type: "Document", category: "Safety" },
];

const CandidateOnboarding = () => {
  const completedSteps = onboardingSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / onboardingSteps.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">Physical arrival and workplace integration</p>
        </div>
        <Badge variant="secondary">Not Started</Badge>
      </div>

      <Card>
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=400&fit=crop&q=80" 
            alt="Modern office workspace"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Onboarding Progress
          </CardTitle>
          <CardDescription>Track your integration into the Nordic workplace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{completedSteps} of {onboardingSteps.length} steps</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === "completed" ? "bg-success text-success-foreground" :
                    step.status === "current" ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {step.status === "completed" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : step.status === "current" ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium ${
                        step.status === "completed" ? "text-success" :
                        step.status === "current" ? "text-primary" :
                        "text-muted-foreground"
                      }`}>
                        {step.title}
                      </h4>
                      <Badge variant={step.status === "completed" ? "default" : step.status === "current" ? "default" : "secondary"}>
                        {step.status === "completed" ? "Done" : step.status === "current" ? "In Progress" : "Not Started"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="schedule">
            <Calendar className="h-4 w-4 mr-2" />
            First Week Schedule
          </TabsTrigger>
          <TabsTrigger value="resources">
            <FileText className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="checklist">
            <CheckCircle className="h-4 w-4 mr-2" />
            Checklist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <div className="relative h-32 overflow-hidden rounded-t-lg">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=300&fit=crop&q=80" 
                alt="Team collaboration"
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>Your First Week</CardTitle>
              <CardDescription>What to expect during your first week at the office</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {firstWeekSchedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded border border-border">
                    <div className="flex-shrink-0 w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{item.day}</h4>
                        <Badge variant="outline">{item.time}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Resources</CardTitle>
              <CardDescription>Essential documents and guides for your integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 rounded border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">{resource.type} · {resource.category}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Arrival Checklist</CardTitle>
              <CardDescription>Make sure you're ready for your first day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { id: 1, text: "Confirm travel dates and flight details", completed: false },
                  { id: 2, text: "Arrange temporary accommodation if needed", completed: false },
                  { id: 3, text: "Review company handbook and policies", completed: false },
                  { id: 4, text: "Prepare required documents (passport, visa, etc.)", completed: false },
                  { id: 5, text: "Set up local bank account (if applicable)", completed: false },
                  { id: 6, text: "Download company apps and tools", completed: false },
                ].map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded border ${item.completed ? 'bg-success/5 border-success/20' : 'border-border'}`}>
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={item.completed ? "text-success line-through" : ""}>{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium mb-1">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Our relocation team is here to support you throughout your onboarding process. 
                Don't hesitate to reach out if you have any questions.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/candidate/messages">Contact Support</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateOnboarding;
