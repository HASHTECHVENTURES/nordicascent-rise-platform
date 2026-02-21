import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Calendar, 
  Award,
  MessageSquare,
  BookOpen,
  Target,
  ArrowRight,
  Star,
  Languages,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";

const milestones = [
  { id: 1, title: "3 Months", status: "completed", description: "Initial integration review", date: "2024-04-15" },
  { id: 2, title: "6 Months", status: "completed", description: "Performance evaluation", date: "2024-07-15" },
  { id: 3, title: "12 Months", status: "current", description: "Annual review & career planning", date: "2025-01-15" },
  { id: 4, title: "18 Months", status: "not_started", description: "Long-term integration check", date: "2025-07-15" },
  { id: 5, title: "24 Months", status: "not_started", description: "Career advancement review", date: "2026-01-15" },
];

const achievements = [
  { id: 1, title: "Successfully completed first project", date: "2024-05-20", type: "project" },
  { id: 2, title: "Received positive team feedback", date: "2024-06-10", type: "feedback" },
  { id: 3, title: "Completed advanced training course", date: "2024-08-05", type: "learning" },
  { id: 4, title: "Led sprint retrospective", date: "2024-09-12", type: "leadership" },
];

const careerGoals = [
  { id: 1, goal: "Lead a major project", targetDate: "2025-06-30", progress: 40, status: "in-progress" },
  { id: 2, goal: "Obtain senior engineer certification", targetDate: "2025-12-31", progress: 25, status: "in-progress" },
  { id: 3, goal: "Contribute to open source project", targetDate: "2025-03-31", progress: 60, status: "in-progress" },
];

const supportResources = [
  { id: 1, title: "Career Development Guide", type: "PDF", category: "Career" },
  { id: 2, title: "Performance Review Template", type: "Document", category: "Reviews" },
  { id: 3, title: "Networking Events Calendar", type: "Calendar", category: "Networking" },
  { id: 4, title: "Skill Development Roadmap", type: "Guide", category: "Learning" },
];

const CandidateFollowup = () => {
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const progress = (completedMilestones / milestones.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Follow-up & Support</h1>
          <p className="text-muted-foreground">Long-term support and career development</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-warning/20 text-warning border border-warning/30">Add-on Service</Badge>
          <Badge className="bg-success text-success-foreground">Active</Badge>
        </div>
      </div>

      {/* Add-on Service Banner */}
      <Card className="border-warning/40 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">This is an add-on service</p>
            <p className="text-sm text-muted-foreground">
              Follow-up support is available as an optional, paid service after onboarding is complete. 
              Note: mentoring from your company mentor concludes at the end of the Onboarding stage.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Language Course Section */}
      <Card className="border-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Languages className="h-5 w-5 text-secondary" />
            Norwegian Language Course — A2 Level
          </CardTitle>
          <CardDescription>Continue your language development after arriving in the Nordics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Course Progress</span>
              <span className="text-sm font-medium">30%</span>
            </div>
            <Progress value={30} className="h-2" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded bg-muted/30 text-center">
                <p className="font-medium text-sm">A1 Completed</p>
                <p className="text-xs text-muted-foreground">Before arrival</p>
              </div>
              <div className="p-3 rounded bg-secondary/10 border border-secondary/20 text-center">
                <p className="font-medium text-sm text-secondary">A2 In Progress</p>
                <p className="text-xs text-muted-foreground">Current level</p>
              </div>
              <div className="p-3 rounded bg-muted/30 text-center">
                <p className="font-medium text-sm text-muted-foreground">B1 Planned</p>
                <p className="text-xs text-muted-foreground">Next milestone</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <img 
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&h=400&fit=crop&q=80" 
            alt="Career growth and development"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Long-term Journey Progress
          </CardTitle>
          <CardDescription>Track your milestones and achievements over time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{completedMilestones} of {milestones.length} milestones</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  milestone.status === "completed" ? "bg-success text-success-foreground" :
                  milestone.status === "current" ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {milestone.status === "completed" ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Calendar className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      milestone.status === "completed" ? "text-success" :
                      milestone.status === "current" ? "text-primary" :
                      "text-muted-foreground"
                    }`}>
                      {milestone.title}
                    </h4>
                    <Badge variant={milestone.status === "completed" ? "default" : milestone.status === "current" ? "default" : "secondary"}>
                      {milestone.status === "completed" ? "Completed" : milestone.status === "current" ? "Upcoming" : "Scheduled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                  {milestone.date && (
                    <p className="text-xs text-muted-foreground mt-1">Scheduled: {new Date(milestone.date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            Career Goals
          </TabsTrigger>
          <TabsTrigger value="support">
            <MessageSquare className="h-4 w-4 mr-2" />
            Support
          </TabsTrigger>
          <TabsTrigger value="resources">
            <BookOpen className="h-4 w-4 mr-2" />
            Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Achievements</CardTitle>
              <CardDescription>Milestones and accomplishments in your Nordic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, idx) => {
                  const images = [
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop&q=80"
                  ];
                  return (
                    <div key={achievement.id} className="rounded border border-border bg-card overflow-hidden transition-colors hover:border-primary/50">
                      <div className="h-32 overflow-hidden">
                        <img src={images[idx % images.length]} alt={achievement.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Star className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{achievement.title}</p>
                              <p className="text-xs text-muted-foreground">{new Date(achievement.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2">{achievement.type}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Career Goals</CardTitle>
              <CardDescription>Track your professional development objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {careerGoals.map((goal) => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{goal.goal}</h4>
                      <p className="text-sm text-muted-foreground">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={goal.status === "in-progress" ? "default" : "secondary"}>
                      {goal.progress}%
                    </Badge>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                <Target className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ongoing Support</CardTitle>
              <CardDescription>We're here to help you succeed long-term</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded border border-border">
                  <MessageSquare className="h-8 w-8 mb-3 text-primary" />
                  <h4 className="font-medium mb-2">Regular Check-ins</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Scheduled monthly meetings to discuss your progress and address any concerns.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/candidate/messages">Schedule Meeting</Link>
                  </Button>
                </div>
                <div className="p-4 rounded border border-border">
                  <TrendingUp className="h-8 w-8 mb-3 text-primary" />
                  <h4 className="font-medium mb-2">Career Guidance</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get advice on career advancement and professional development opportunities.
                  </p>
                  <Button variant="outline" size="sm">Learn More</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Development Resources</CardTitle>
              <CardDescription>Tools and guides for your continued growth</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportResources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 rounded border border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
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
      </Tabs>
    </div>
  );
};

export default CandidateFollowup;
