import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Clock, Users, BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { trainings, employees } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const categories = ["All", "Leadership", "Compliance", "Management", "Soft Skills", "Security", "Business"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

export default function Training() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredTrainings = trainings.filter((training) => {
    const matchesSearch = training.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || training.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || training.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleAssignTraining = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Training Assigned", description: "The training has been assigned to the selected employees." });
    setIsAssignDialogOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Training</h1><p className="text-muted-foreground">Manage and assign training modules to your team.</p></div>
        <div className="flex gap-3">
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Users className="mr-2 h-4 w-4" />Assign Training</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Assign Training</DialogTitle><DialogDescription>Select employees and training modules to assign.</DialogDescription></DialogHeader>
              <form onSubmit={handleAssignTraining} className="space-y-4 mt-4">
                <div className="space-y-2"><Label>Select Training</Label><Select><SelectTrigger><SelectValue placeholder="Choose training module" /></SelectTrigger><SelectContent>{trainings.map((t) => (<SelectItem key={t.id} value={t.id.toString()}>{t.title}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Select Employees</Label><Select><SelectTrigger><SelectValue placeholder="Choose employees" /></SelectTrigger><SelectContent><SelectItem value="all">All Employees</SelectItem>{employees.map((e) => (<SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>))}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" required /></div>
                <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button><Button type="submit" className="nordic-gradient">Assign Training</Button></div>
              </form>
            </DialogContent>
          </Dialog>
          <Button className="nordic-gradient"><Plus className="mr-2 h-4 w-4" />Create Training</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ icon: BookOpen, label: "Total Modules", value: trainings.length, color: "bg-primary/10 text-primary" }, { icon: GraduationCap, label: "Completed", value: "156", color: "bg-success/10 text-success" }, { icon: Clock, label: "In Progress", value: "48", color: "bg-warning/10 text-warning" }, { icon: Users, label: "Avg. Completion", value: "87%", color: "bg-accent text-accent-foreground" }].map((stat) => (
          <Card key={stat.label}><CardContent className="pt-6"><div className="flex items-center gap-3"><div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList><TabsTrigger value="catalog">Training Catalog</TabsTrigger><TabsTrigger value="my-training">My Training</TabsTrigger><TabsTrigger value="assignments">Assignments</TabsTrigger></TabsList>

        <TabsContent value="catalog" className="space-y-6">
          <Card><CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search trainings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}><SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger><SelectContent>{categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}><SelectTrigger className="w-full md:w-40"><SelectValue /></SelectTrigger><SelectContent>{difficulties.map((diff) => (<SelectItem key={diff} value={diff}>{diff}</SelectItem>))}</SelectContent></Select>
            </div>
          </CardContent></Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training, i) => (
              <Card key={training.id} className="group hover:border-primary/50 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <CardHeader>
                  <div className="flex items-start justify-between"><Badge variant="secondary">{training.category}</Badge><Badge variant="outline">{training.difficulty}</Badge></div>
                  <CardTitle className="text-lg mt-3">{training.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{training.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-4 w-4" />{training.duration}</span><span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{training.modules} modules</span></div>
                  <div className="space-y-1"><div className="flex justify-between text-sm"><span>Avg. Completion</span><span>{training.completion}%</span></div><Progress value={training.completion} className="h-2" /></div>
                  <div className="flex items-center justify-between pt-2"><span className="text-sm text-muted-foreground">{training.enrolled} enrolled</span><Button size="sm" asChild><Link to={`/training/${training.id}`}>View Details<ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredTrainings.length === 0 && <div className="text-center py-12"><p className="text-muted-foreground">No trainings found matching your criteria.</p></div>}
        </TabsContent>

        <TabsContent value="my-training" className="space-y-6">
          <div className="grid gap-4">
            <h3 className="font-semibold">Current Trainings</h3>
            {trainings.slice(0, 2).map((training) => (
              <Card key={training.id}><CardContent className="pt-6">
                <div className="flex items-center justify-between"><div className="space-y-1"><h4 className="font-medium">{training.title}</h4><p className="text-sm text-muted-foreground">{training.category} • Due in 5 days</p></div><div className="text-right"><p className="text-2xl font-bold">{training.completion}%</p><Progress value={training.completion} className="h-2 w-32 mt-1" /></div></div>
                <Button size="sm" className="mt-4">Continue Training</Button>
              </CardContent></Card>
            ))}
            <h3 className="font-semibold mt-6">Completed Trainings</h3>
            {trainings.slice(2, 4).map((training) => (
              <Card key={training.id} className="opacity-75"><CardContent className="pt-6">
                <div className="flex items-center justify-between"><div className="space-y-1"><h4 className="font-medium">{training.title}</h4><p className="text-sm text-muted-foreground">Completed on Nov 15, 2024</p></div><Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge></div>
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <Card><CardHeader><CardTitle>Recent Assignments</CardTitle></CardHeader><CardContent>
            <div className="space-y-4">
              {[{ training: "Data Privacy & GDPR", employees: "All Employees", due: "Dec 15, 2024", status: "active" }, { training: "Leadership Fundamentals", employees: "Managers", due: "Dec 20, 2024", status: "active" }, { training: "Cybersecurity Essentials", employees: "Engineering", due: "Jan 10, 2025", status: "scheduled" }].map((assignment, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div><h4 className="font-medium">{assignment.training}</h4><p className="text-sm text-muted-foreground">Assigned to: {assignment.employees} • Due: {assignment.due}</p></div>
                  <Badge variant={assignment.status === "active" ? "default" : "secondary"}>{assignment.status === "active" ? "Active" : "Scheduled"}</Badge>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
