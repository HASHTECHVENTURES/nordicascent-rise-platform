import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, GraduationCap, Award, Upload, Plus, Pencil, Trash2 } from "lucide-react";

const skills = ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL", "TailwindCSS"];

const experiences = [
  { id: 1, title: "Senior Frontend Developer", company: "TechCorp AB", location: "Stockholm", period: "2022 - Present", description: "Led frontend development for enterprise SaaS platform." },
  { id: 2, title: "Frontend Developer", company: "StartupNord", location: "Gothenburg", period: "2020 - 2022", description: "Built React applications and design systems." },
];

const education = [
  { id: 1, degree: "M.Sc. Computer Science", school: "KTH Royal Institute of Technology", period: "2018 - 2020" },
  { id: 2, degree: "B.Sc. Software Engineering", school: "Chalmers University of Technology", period: "2015 - 2018" },
];

const CandidateProfile = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your profile and CV</p>
        </div>
        <Button className="gap-2 bg-candidate-accent hover:bg-candidate-accent/90">
          <Upload className="h-4 w-4" />
          Upload CV
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Experience
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Education
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Award className="h-4 w-4" />
            Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-candidate-accent/10 text-candidate-accent">EL</AvatarFallback>
                </Avatar>
                <Button variant="outline">Change Photo</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Emma" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Lindqvist" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="emma.lindqvist@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="+46 70 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="Stockholm, Sweden" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input id="linkedin" defaultValue="linkedin.com/in/emmalindqvist" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" rows={4} defaultValue="Passionate frontend developer with 5+ years of experience building modern web applications. Specialized in React and TypeScript." />
              </div>
              <Button className="bg-candidate-accent hover:bg-candidate-accent/90">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Experience</CardTitle>
              <Button size="sm" className="gap-2 bg-candidate-accent hover:bg-candidate-accent/90">
                <Plus className="h-4 w-4" />
                Add Experience
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company} • {exp.location}</p>
                      <p className="text-sm text-muted-foreground">{exp.period}</p>
                      <p className="text-sm mt-2">{exp.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Education</CardTitle>
              <Button size="sm" className="gap-2 bg-candidate-accent hover:bg-candidate-accent/90">
                <Plus className="h-4 w-4" />
                Add Education
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.school}</p>
                      <p className="text-sm text-muted-foreground">{edu.period}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Skills & Expertise</CardTitle>
              <Button size="sm" className="gap-2 bg-candidate-accent hover:bg-candidate-accent/90">
                <Plus className="h-4 w-4" />
                Add Skill
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm py-1 px-3 gap-2">
                    {skill}
                    <button className="hover:text-destructive">×</button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateProfile;
