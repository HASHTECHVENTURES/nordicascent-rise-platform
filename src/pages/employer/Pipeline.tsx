import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, MoreHorizontal, GripVertical } from "lucide-react";

const stages = [
  { id: "new", name: "New", color: "bg-blue-500", candidates: [
    { id: 1, name: "Emma Lindqvist", role: "Frontend Developer", match: 95, appliedDays: 2 },
    { id: 2, name: "Magnus Olsen", role: "Backend Engineer", match: 78, appliedDays: 1 },
  ]},
  { id: "screening", name: "Screening", color: "bg-yellow-500", candidates: [
    { id: 3, name: "Lars Andersen", role: "Product Manager", match: 88, appliedDays: 5 },
  ]},
  { id: "interview", name: "Interview", color: "bg-purple-500", candidates: [
    { id: 4, name: "Sofia Virtanen", role: "UX Designer", match: 82, appliedDays: 8 },
    { id: 5, name: "Erik Hansen", role: "Frontend Developer", match: 85, appliedDays: 10 },
  ]},
  { id: "offer", name: "Offer", color: "bg-green-500", candidates: [
    { id: 6, name: "Anna Svensson", role: "Product Manager", match: 91, appliedDays: 14 },
  ]},
  { id: "hired", name: "Hired", color: "bg-emerald-600", candidates: [] },
  { id: "rejected", name: "Rejected", color: "bg-red-500", candidates: [] },
];

const EmployerPipeline = () => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hiring Pipeline</h1>
        <p className="text-muted-foreground">Manage candidates through your hiring process</p>
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by job" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Jobs</SelectItem>
          <SelectItem value="frontend">Senior Frontend Developer</SelectItem>
          <SelectItem value="pm">Product Manager</SelectItem>
          <SelectItem value="ux">UX Designer</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4 min-w-max">
        {stages.map((stage) => (
          <div key={stage.id} className="w-72 flex-shrink-0">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                    <Badge variant="secondary" className="ml-1">{stage.candidates.length}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Plus className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stage.candidates.length === 0 ? (
                  <div className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground">
                    Drop candidates here
                  </div>
                ) : (
                  stage.candidates.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border bg-card hover:border-employer-accent/50 transition-colors cursor-grab">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-employer-accent/10 text-employer-accent">{c.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                          <div>
                            <h4 className="font-medium text-sm">{c.name}</h4>
                            <p className="text-xs text-muted-foreground">{c.role}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3 w-3" /></Button>
                      </div>
                      <div className="flex items-center justify-between mt-2 ml-7">
                        <Badge variant="outline" className="text-xs">{c.match}% match</Badge>
                        <span className="text-xs text-muted-foreground">{c.appliedDays}d ago</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  </div>
);

export default EmployerPipeline;
