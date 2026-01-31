import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, MessageSquare, Video, Clock, CheckCircle, ArrowRight, Heart, Users } from "lucide-react";

const mentor = {
  name: "Erik Johansson",
  role: "Senior Engineering Manager",
  company: "TechCorp Nordic",
  avatar: "https://i.pravatar.cc/150?img=12",
  email: "erik.johansson@techcorp.se",
  experience: "15+ years in Nordic tech industry",
  specialties: ["Career Development", "Cultural Integration", "Technical Leadership"],
};

const upcomingSessions = [
  { id: 1, title: "Weekly Check-in", date: "2026-02-03", time: "14:00 CET", type: "video", status: "scheduled" },
  { id: 2, title: "Career Planning Discussion", date: "2026-02-10", time: "15:00 CET", type: "video", status: "scheduled" },
];

const pastSessions = [
  { id: 1, title: "Introduction & Goal Setting", date: "2026-01-20", notes: "Discussed career goals and expectations for the mentoring program." },
  { id: 2, title: "Nordic Work Culture Overview", date: "2026-01-27", notes: "Covered key aspects of flat hierarchy and work-life balance in Nordic companies." },
];

const milestones = [
  { id: 1, title: "Initial Meeting", completed: true },
  { id: 2, title: "Goal Setting", completed: true },
  { id: 3, title: "Cultural Orientation", completed: true },
  { id: 4, title: "Mid-Program Review", completed: false },
  { id: 5, title: "Career Planning", completed: false },
  { id: 6, title: "Program Completion", completed: false },
];

const CandidateMentoring = () => {
  const completedMilestones = milestones.filter(m => m.completed).length;
  const progress = Math.round((completedMilestones / milestones.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">Mentoring</h1>
        <p className="text-muted-foreground">Your dedicated mentor guides you from Readiness through Follow-up</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mentor Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Your Mentor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mentor.avatar} />
                <AvatarFallback className="text-lg">EJ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground">{mentor.role}</p>
                <p className="text-sm text-primary">{mentor.company}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t space-y-3">
              <p className="text-sm text-muted-foreground">{mentor.experience}</p>
              <div className="flex flex-wrap gap-2">
                {mentor.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">{specialty}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1 gap-2" size="sm">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" className="flex-1 gap-2" size="sm">
                <Video className="h-4 w-4" />
                Schedule Call
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Program Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Mentoring Program Progress</CardTitle>
            <CardDescription>Track your journey through the mentoring milestones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Overall Progress</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {milestones.map((milestone) => (
                <div 
                  key={milestone.id} 
                  className={`flex items-center gap-2 p-3 rounded border ${
                    milestone.completed ? 'bg-success/5 border-success/20' : 'border-border'
                  }`}
                >
                  {milestone.completed ? (
                    <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                  )}
                  <span className={`text-sm ${milestone.completed ? 'text-muted-foreground' : ''}`}>
                    {milestone.title}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded border">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{session.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {session.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">Scheduled</Badge>
                  <Button size="sm">Join Call</Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming sessions scheduled</p>
          )}
          <Button variant="outline" className="w-full">
            Schedule New Session
          </Button>
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Past Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pastSessions.map((session) => (
            <div key={session.id} className="p-4 rounded border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{session.title}</p>
                <span className="text-sm text-muted-foreground">
                  {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{session.notes}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mentoring Info */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            About Your Mentoring Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Mentoring at Nordic Ascent is a continuous journey that begins during the Readiness phase and extends through your Internship and Follow-up periods. Your mentor is your dedicated point of contact, helping you navigate cultural adaptation, professional development, and career growth in the Nordics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded bg-background">
              <p className="font-medium text-sm">Readiness Phase</p>
              <p className="text-xs text-muted-foreground">Cultural orientation & goal setting</p>
            </div>
            <div className="p-3 rounded bg-background">
              <p className="font-medium text-sm">Internship Phase</p>
              <p className="text-xs text-muted-foreground">Regular check-ins & career guidance</p>
            </div>
            <div className="p-3 rounded bg-background">
              <p className="font-medium text-sm">Follow-up Phase</p>
              <p className="text-xs text-muted-foreground">Long-term support & networking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidateMentoring;
