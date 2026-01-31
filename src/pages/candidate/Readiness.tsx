import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, ArrowRight, AlertTriangle, BookOpen, Code, Users, Heart, Globe, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const technicalModules = [
  { id: 1, name: "Technical Assessment Module 1", description: "Core programming fundamentals", completed: true },
  { id: 2, name: "Technical Assessment Module 2", description: "System design principles", completed: true },
  { id: 3, name: "Technical Assessment Module 3", description: "Advanced problem solving", completed: false },
];

const socialModules = [
  { id: 1, name: "Communication Skills", description: "Professional communication and collaboration", completed: true },
  { id: 2, name: "Team Dynamics", description: "Working effectively in diverse teams", completed: false },
  { id: 3, name: "Conflict Resolution", description: "Handling workplace challenges", completed: false },
];

const culturalModules = [
  { id: 1, name: "Nordic Work Culture", description: "Understanding flat hierarchies and work-life balance", completed: true },
  { id: 2, name: "Social Norms & Etiquette", description: "Everyday interactions and expectations", completed: false },
  { id: 3, name: "Diversity & Inclusion", description: "Thriving in multicultural environments", completed: false },
];

const risks = [
  { id: 1, text: "Technical assessment deadline in 5 days", level: "warning" },
];

const CandidateReadiness = () => {
  const allModules = [...technicalModules, ...socialModules, ...culturalModules];
  const completedModules = allModules.filter(m => m.completed).length;
  const readiness = Math.round((completedModules / allModules.length) * 100);

  const technicalProgress = Math.round((technicalModules.filter(m => m.completed).length / technicalModules.length) * 100);
  const socialProgress = Math.round((socialModules.filter(m => m.completed).length / socialModules.length) * 100);
  const culturalProgress = Math.round((culturalModules.filter(m => m.completed).length / culturalModules.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Readiness</h1>
          <p className="text-muted-foreground">Technical, social, and cultural validation phase</p>
        </div>
        <Badge className="bg-primary text-primary-foreground">Active</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Overall Readiness</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Total Progress</span>
            <span className="text-sm font-medium">{readiness}%</span>
          </div>
          <Progress value={readiness} className="h-2" />
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center p-3 rounded bg-muted/50">
              <Code className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{technicalProgress}%</p>
              <p className="text-xs text-muted-foreground">Technical</p>
            </div>
            <div className="text-center p-3 rounded bg-muted/50">
              <Users className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{socialProgress}%</p>
              <p className="text-xs text-muted-foreground">Social</p>
            </div>
            <div className="text-center p-3 rounded bg-muted/50">
              <Globe className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{culturalProgress}%</p>
              <p className="text-xs text-muted-foreground">Cultural</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {risks.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Open Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {risks.map((risk) => (
              <div key={risk.id} className="flex items-center gap-3 p-3 rounded bg-warning/10">
                <span className="text-sm">{risk.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Mentoring Begins Here
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Your mentoring journey starts during the Readiness phase and continues through Internship and Follow-up. 
            Your assigned mentor will guide you through cultural adaptation and professional development.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link to="/candidate/mentoring">View Mentoring Details</Link>
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="technical" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="technical" className="gap-2">
            <Code className="h-4 w-4" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="cultural" className="gap-2">
            <Globe className="h-4 w-4" />
            Cultural
          </TabsTrigger>
        </TabsList>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Technical Skills Validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {technicalModules.map((module) => (
                <div key={module.id} className={`flex items-center justify-between p-4 rounded border ${module.completed ? 'bg-success/5 border-success/20' : 'border-border'}`}>
                  <div className="flex items-center gap-3">
                    {module.completed ? <CheckCircle className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <p className={`font-medium ${module.completed ? 'text-muted-foreground' : ''}`}>{module.name}</p>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  {!module.completed && (
                    <Button size="sm">Start</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Social Readiness Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {socialModules.map((module) => (
                <div key={module.id} className={`flex items-center justify-between p-4 rounded border ${module.completed ? 'bg-success/5 border-success/20' : 'border-border'}`}>
                  <div className="flex items-center gap-3">
                    {module.completed ? <CheckCircle className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <p className={`font-medium ${module.completed ? 'text-muted-foreground' : ''}`}>{module.name}</p>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  {!module.completed && (
                    <Button size="sm">Start</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cultural">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Cultural Readiness Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {culturalModules.map((module) => (
                <div key={module.id} className={`flex items-center justify-between p-4 rounded border ${module.completed ? 'bg-success/5 border-success/20' : 'border-border'}`}>
                  <div className="flex items-center gap-3">
                    {module.completed ? <CheckCircle className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                    <div>
                      <p className={`font-medium ${module.completed ? 'text-muted-foreground' : ''}`}>{module.name}</p>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  {!module.completed && (
                    <Button size="sm">Start</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Stage Completion & Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Upon completion of all Readiness modules, your technical baseline, social skills, and cultural readiness will be assessed. 
            <strong> Final selection for Internship (1:1 digital engagement) happens at the end of this stage.</strong>
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>Approval Criteria:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>All technical assessment modules completed</li>
              <li>Social readiness and communication skills validated</li>
              <li>Cultural awareness demonstrated</li>
              <li>Company match confirmed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link to="/candidate/selection">Back to Selection</Link>
        </Button>
        <Button disabled={readiness < 100}>
          {readiness === 100 ? "Request Approval for Internship" : "Complete All Modules to Proceed"} 
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CandidateReadiness;
