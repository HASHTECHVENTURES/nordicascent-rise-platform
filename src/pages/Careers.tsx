import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Briefcase, Clock, ArrowRight, Heart, Coffee, Plane, GraduationCap, Search } from "lucide-react";
import { jobs, departments } from "@/data/mockData";

const benefits = [
  { icon: Heart, title: "Health & Wellness", description: "Comprehensive health insurance and wellness programs" },
  { icon: Coffee, title: "Flexible Work", description: "Remote-first with optional office spaces" },
  { icon: Plane, title: "Generous PTO", description: "30 days vacation plus public holidays" },
  { icon: GraduationCap, title: "Learning Budget", description: "Annual budget for courses and conferences" },
];

export default function Careers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const locations = [...new Set(jobs.map((job) => job.location))];
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment;
    const matchesLocation = selectedLocation === "all" || job.location === selectedLocation;
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  return (
    <div className="flex flex-col">
      <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Join Our Team and <span className="nordic-gradient-text">Make an Impact</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">Help us build the future of workforce management. We're looking for passionate people who want to make a difference.</p>
            <Button size="lg" asChild className="nordic-gradient nordic-glow">
              <a href="#positions">View Open Positions<ArrowRight className="ml-2 h-5 w-5" /></a>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Work With Us</h2>
            <p className="text-lg text-muted-foreground">We believe in taking care of our team so they can do their best work.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <Card key={benefit.title} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="pt-8 pb-6 space-y-4">
                  <div className="h-14 w-14 rounded-xl nordic-gradient mx-auto flex items-center justify-center">
                    <benefit.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="positions" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Open Positions</h2>
            <p className="text-lg text-muted-foreground">Find your next opportunity at Nordicascent.</p>
          </div>
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search positions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (<SelectItem key={loc} value={loc}>{loc}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
              <Card key={job.id} className="hover:border-primary/50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge variant="secondary">{job.type}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.department}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Posted {new Date(job.posted).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button asChild><Link to={`/careers/${job.id}`}>View Details<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="text-center py-12"><p className="text-muted-foreground">No positions found matching your criteria.</p></div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold">Don't See the Right Role?</h2>
            <p className="text-lg text-muted-foreground">We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.</p>
            <Button size="lg" variant="outline" asChild><Link to="/contact">Send Open Application<ArrowRight className="ml-2 h-5 w-5" /></Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
