import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MapPin, FileText, Home, Plane, Building2, CheckCircle, ExternalLink, Info, BookOpen, Globe, Video, Calendar } from "lucide-react";

const visaSteps = [
  { id: 1, title: "Job Offer Confirmation", status: "completed", description: "Receive official job offer letter" },
  { id: 2, title: "Visa Application Submitted", status: "completed", description: "Submit work permit application" },
  { id: 3, title: "Document Verification", status: "current", description: "Immigration authority reviews documents" },
  { id: 4, title: "Visa Interview", status: "not_started", description: "Attend interview at embassy" },
  { id: 5, title: "Visa Approval", status: "not_started", description: "Receive work permit" },
];

const languageCourses = [
  { id: 1, title: "Swedish Basics A1", status: "in_progress", progress: 65, type: "digital", nextSession: null },
  { id: 2, title: "Business Swedish", status: "not_started", progress: 0, type: "digital", nextSession: null },
  { id: 3, title: "Swedish Conversation Practice", status: "scheduled", progress: 0, type: "live", nextSession: "2026-02-05" },
];

const culturalModules = [
  { id: 1, title: "Nordic Work Culture & Values", status: "completed", type: "digital", description: "Understanding flat hierarchies, consensus, and work-life balance" },
  { id: 2, title: "Social Norms & Etiquette", status: "in_progress", type: "digital", description: "Everyday interactions, fika culture, and social expectations" },
  { id: 3, title: "Living in Sweden", status: "scheduled", type: "live", description: "Practical session with relocation team", nextSession: "2026-02-08" },
  { id: 4, title: "Integration Workshop", status: "not_started", type: "live", description: "Group session on building community and networks" },
];

const cityGuides = [
  { id: 1, city: "Stockholm", country: "Sweden", image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop&q=80", flag: "🇸🇪", costOfLiving: "High", avgRent: "€1,500/mo", highlights: ["Tech hub", "Work-life balance", "English-friendly"] },
  { id: 2, city: "Copenhagen", country: "Denmark", image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=600&h=400&fit=crop&q=80", flag: "🇩🇰", costOfLiving: "High", avgRent: "€1,600/mo", highlights: ["Design culture", "Cycling city", "Green living"] },
  { id: 3, city: "Helsinki", country: "Finland", image: "https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?w=600&h=400&fit=crop&q=80", flag: "🇫🇮", costOfLiving: "Medium-High", avgRent: "€1,200/mo", highlights: ["Startup scene", "Nature access", "Education system"] },
  { id: 4, city: "Oslo", country: "Norway", image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?w=600&h=400&fit=crop&q=80", flag: "🇳🇴", costOfLiving: "Very High", avgRent: "€1,800/mo", highlights: ["High salaries", "Outdoor lifestyle", "Public services"] },
];

const resources = [
  { id: 1, title: "Nordic Work Permit Guide", type: "PDF", category: "Visa" },
  { id: 2, title: "Finding Housing in Stockholm", type: "Article", category: "Housing" },
  { id: 3, title: "Opening a Bank Account", type: "Guide", category: "Finance" },
  { id: 4, title: "Healthcare Registration", type: "Checklist", category: "Healthcare" },
  { id: 5, title: "Tax Registration (Skatteverket)", type: "Guide", category: "Finance" },
];

const CandidateRelocation = () => {
  const completedSteps = visaSteps.filter(s => s.status === 'completed').length;
  const progress = (completedSteps / visaSteps.length) * 100;

  const languageProgress = languageCourses.reduce((sum, c) => sum + c.progress, 0) / languageCourses.length;
  const culturalCompleted = culturalModules.filter(m => m.status === 'completed').length;
  const culturalProgress = (culturalCompleted / culturalModules.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relocation Support</h1>
        <p className="text-muted-foreground">Everything you need for your move to the Nordics</p>
      </div>

      <Tabs defaultValue="visa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="visa" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Visa</span>
          </TabsTrigger>
          <TabsTrigger value="housing" className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Housing</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
          <TabsTrigger value="cultural" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Cultural</span>
          </TabsTrigger>
          <TabsTrigger value="cities" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Cities</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Your Visa Application Progress
              </CardTitle>
              <CardDescription>Track your work permit application status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Application Progress</span>
                  <span className="font-medium">{completedSteps} of {visaSteps.length} steps</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="space-y-4">
                {visaSteps.map((step, index) => (
                  <div key={step.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-success text-success-foreground' :
                        step.status === 'current' ? 'bg-primary text-primary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      {index < visaSteps.length - 1 && (
                        <div className={`w-0.5 h-full min-h-8 ${
                          step.status === 'completed' ? 'bg-success' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{step.title}</h3>
                        {step.status === 'current' && (
                          <Badge variant="secondary" className="text-xs">In Progress</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="housing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Housing Assistance
              </CardTitle>
              <CardDescription>Find accommodation in your new city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Temporary Housing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your employer provides 4 weeks of temporary housing while you search for permanent accommodation.
                    </p>
                    <Badge variant="secondary" className="bg-success/10 text-success">Included in Offer</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">Housing Search Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Get assistance from our relocation partners to find long-term housing.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Contact Partner
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 rounded bg-muted/50">
                <h3 className="font-medium mb-2">Popular Housing Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">Blocket.se</Button>
                  <Button variant="outline" size="sm">Hemnet.se</Button>
                  <Button variant="outline" size="sm">Boligportal.dk</Button>
                  <Button variant="outline" size="sm">Finn.no</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Language Courses
              </CardTitle>
              <CardDescription>Learn the local language to enhance your integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Language Progress</span>
                  <span className="font-medium">{Math.round(languageProgress)}%</span>
                </div>
                <Progress value={languageProgress} className="h-2" />
              </div>

              <div className="space-y-4">
                {languageCourses.map((course) => (
                  <div key={course.id} className={`p-4 rounded border ${
                    course.status === 'in_progress' ? 'border-primary/30 bg-primary/5' : 
                    course.status === 'scheduled' ? 'border-warning/30 bg-warning/5' : 
                    'border-border'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {course.type === 'digital' ? (
                          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded bg-warning/10 flex items-center justify-center">
                            <Video className="h-4 w-4 text-warning" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{course.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{course.type === 'digital' ? 'Digital Learning' : 'Live Session'}</Badge>
                            {course.status === 'in_progress' && <Badge className="bg-primary text-primary-foreground text-xs">In Progress</Badge>}
                            {course.status === 'scheduled' && <Badge variant="secondary" className="text-xs">Scheduled</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {course.status === 'in_progress' && (
                          <>
                            <p className="text-sm font-medium">{course.progress}%</p>
                            <Button size="sm" className="mt-2">Continue</Button>
                          </>
                        )}
                        {course.status === 'scheduled' && course.nextSession && (
                          <>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(course.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <Button size="sm" variant="outline" className="mt-2">View Details</Button>
                          </>
                        )}
                        {course.status === 'not_started' && (
                          <Button size="sm" variant="outline">Enroll</Button>
                        )}
                      </div>
                    </div>
                    {course.status === 'in_progress' && (
                      <Progress value={course.progress} className="h-1 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Cultural Preparation
              </CardTitle>
              <CardDescription>Understanding the destination country's work culture and society</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cultural Preparation Progress</span>
                  <span className="font-medium">{Math.round(culturalProgress)}%</span>
                </div>
                <Progress value={culturalProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Digital Learning</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Self-paced modules you can complete anytime</p>
                </div>
                <div className="p-4 rounded border bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-4 w-4 text-warning" />
                    <span className="font-medium text-sm">Live Sessions</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Scheduled sessions with our relocation team</p>
                </div>
              </div>

              <div className="space-y-3">
                {culturalModules.map((module) => (
                  <div key={module.id} className={`p-4 rounded border ${
                    module.status === 'completed' ? 'bg-success/5 border-success/20' :
                    module.status === 'in_progress' ? 'border-primary/30' :
                    module.status === 'scheduled' ? 'border-warning/30' :
                    'border-border'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {module.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-success" />
                        ) : module.type === 'digital' ? (
                          <BookOpen className="h-5 w-5 text-primary" />
                        ) : (
                          <Video className="h-5 w-5 text-warning" />
                        )}
                        <div>
                          <h3 className={`font-medium ${module.status === 'completed' ? 'text-muted-foreground' : ''}`}>{module.title}</h3>
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{module.type === 'digital' ? 'Digital' : 'Live'}</Badge>
                        {module.status === 'completed' && <Badge className="bg-success text-success-foreground">Completed</Badge>}
                        {module.status === 'in_progress' && <Button size="sm">Continue</Button>}
                        {module.status === 'scheduled' && module.nextSession && (
                          <Button size="sm" variant="outline">
                            {new Date(module.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Button>
                        )}
                        {module.status === 'not_started' && <Button size="sm" variant="outline">Start</Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityGuides.map((city) => (
              <Card key={city.id} className="hover:border-primary/50 transition-colors overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={city.image} 
                    alt={`${city.city}, ${city.country}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 text-3xl">{city.flag}</div>
                </div>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{city.city}</h3>
                      <p className="text-sm text-muted-foreground">{city.country}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cost of Living</span>
                        <Badge variant="outline">{city.costOfLiving}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Avg. Rent (1BR)</span>
                        <span className="font-medium">{city.avgRent}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {city.highlights.map((h) => (
                        <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <MapPin className="h-4 w-4" />
                    View City Guide
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relocation Resources</CardTitle>
              <CardDescription>Guides and documents to help with your move</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{resource.title}</h3>
                        <p className="text-sm text-muted-foreground">{resource.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{resource.category}</Badge>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
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

export default CandidateRelocation;
