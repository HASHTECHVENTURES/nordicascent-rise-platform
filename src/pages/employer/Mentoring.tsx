import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Users, MessageSquare, Calendar, CheckCircle, Clock, ArrowRight, Heart, UserPlus } from "lucide-react";

const companyMentor = {
  name: "Erik Johansson",
  role: "Senior Engineering Manager",
  avatar: "https://i.pravatar.cc/150?img=12",
  email: "erik.johansson@techcorp.se",
  assignedCandidates: 3,
};

const mentees = [
  { 
    id: 1, 
    name: "Rahul Sharma", 
    avatar: "https://i.pravatar.cc/150?img=1", 
    stage: "Readiness", 
    progress: 65,
    nextSession: "2026-02-03",
    status: "active"
  },
  { 
    id: 2, 
    name: "Priya Patel", 
    avatar: "https://i.pravatar.cc/150?img=5", 
    stage: "Internship", 
    progress: 45,
    nextSession: "2026-02-05",
    status: "active"
  },
  { 
    id: 3, 
    name: "Amit Kumar", 
    avatar: "https://i.pravatar.cc/150?img=3", 
    stage: "Follow-up", 
    progress: 80,
    nextSession: null,
    status: "completed"
  },
];

const upcomingSessions = [
  { id: 1, candidate: "Rahul Sharma", title: "Weekly Check-in", date: "2026-02-03", time: "14:00 CET" },
  { id: 2, candidate: "Priya Patel", title: "Career Planning", date: "2026-02-05", time: "10:00 CET" },
];

const EmployerMentoring = () => {
  const activeMentees = mentees.filter(m => m.status === 'active').length;
  const completedMentees = mentees.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Mentoring</h1>
          <p className="text-muted-foreground">Manage your company's mentoring program for candidates</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Mentor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-medium">{mentees.length}</p>
                <p className="text-sm text-muted-foreground">Total Mentees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-success/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-medium">{activeMentees}</p>
                <p className="text-sm text-muted-foreground">Active Mentoring</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-secondary/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-medium">{completedMentees}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-warning/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-medium">{upcomingSessions.length}</p>
                <p className="text-sm text-muted-foreground">Upcoming Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Mentor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Company Mentor / Point of Contact</CardTitle>
          <CardDescription>The assigned mentor responsible for all candidates in your company</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded border bg-muted/30">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={companyMentor.avatar} />
                <AvatarFallback>EJ</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{companyMentor.name}</h3>
                <p className="text-sm text-muted-foreground">{companyMentor.role}</p>
                <p className="text-sm text-primary">{companyMentor.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-medium">{companyMentor.assignedCandidates}</p>
              <p className="text-sm text-muted-foreground">Assigned Candidates</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">Change Mentor</Button>
            <Button variant="outline" size="sm">View Schedule</Button>
          </div>
        </CardContent>
      </Card>

      {/* Mentees */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Candidate Mentees</CardTitle>
          <CardDescription>Candidates currently in the mentoring program</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mentees.map((mentee) => (
            <div key={mentee.id} className="flex items-center justify-between p-4 rounded border">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentee.avatar} />
                  <AvatarFallback>{mentee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{mentee.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{mentee.stage}</Badge>
                    {mentee.status === 'completed' && (
                      <Badge className="bg-success text-success-foreground">Completed</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium">{mentee.progress}%</p>
                  <p className="text-xs text-muted-foreground">Progress</p>
                </div>
                <Progress value={mentee.progress} className="w-24 h-2" />
                <div className="text-right min-w-[120px]">
                  {mentee.nextSession ? (
                    <>
                      <p className="text-sm font-medium">
                        {new Date(mentee.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-muted-foreground">Next Session</p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sessions scheduled</p>
                  )}
                </div>
                <Button size="sm" variant="outline">View Details</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Mentoring Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 rounded border">
              <div>
                <p className="font-medium">{session.title}</p>
                <p className="text-sm text-muted-foreground">
                  with {session.candidate} · {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {session.time}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">Reschedule</Button>
                <Button size="sm">View Details</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mentoring Info */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg font-medium">About the Mentoring Program</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Each company assigns one internal mentor or point of contact who guides candidates through their journey. 
            Mentoring spans from the Readiness phase through Internship and into Follow-up, ensuring candidates receive 
            consistent support during their transition to Nordic work life.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded bg-background">
              <p className="font-medium text-sm">Readiness</p>
              <p className="text-xs text-muted-foreground">Cultural orientation & expectations</p>
            </div>
            <div className="p-3 rounded bg-background">
              <p className="font-medium text-sm">Internship</p>
              <p className="text-xs text-muted-foreground">Hands-on guidance & integration</p>
            </div>
            <div className="p-3 rounded bg-background">
              <p className="font-medium text-sm">Follow-up</p>
              <p className="text-xs text-muted-foreground">Long-term retention & growth</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerMentoring;
