import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Briefcase, Clock, ArrowLeft, CheckCircle, Upload } from "lucide-react";
import { jobs } from "@/data/mockData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const job = jobs.find((j) => j.id === id);
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Job not found</h1>
        <Button asChild><Link to="/careers">Back to Careers</Link></Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Application Submitted!", description: "Thank you for your interest. We'll be in touch soon." });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col">
      <section className="py-12 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={() => navigate("/careers")} className="mb-6"><ArrowLeft className="mr-2 h-4 w-4" />Back to Careers</Button>
          <div className="max-w-4xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl sm:text-4xl font-bold">{job.title}</h1>
              <Badge variant="secondary">{job.type}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{job.department}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />Posted {new Date(job.posted).toLocaleDateString()}</span>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild><Button size="lg" className="nordic-gradient nordic-glow">Apply Now</Button></DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Apply for {job.title}</DialogTitle>
                  <DialogDescription>Fill out the form below to submit your application.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" required /></div>
                    <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" required /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" required /></div>
                  <div className="space-y-2"><Label htmlFor="linkedin">LinkedIn Profile (optional)</Label><Input id="linkedin" placeholder="https://linkedin.com/in/..." /></div>
                  <div className="space-y-2"><Label htmlFor="experience">Years of Experience</Label><Input id="experience" type="number" min="0" required /></div>
                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, DOC up to 5MB</p>
                    </div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="message">Cover Letter (optional)</Label><Textarea id="message" placeholder="Tell us why you'd be a great fit..." rows={4} /></div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="nordic-gradient">Submit Application</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl">
            <div className="lg:col-span-2 space-y-8">
              <Card><CardHeader><CardTitle>About the Role</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{job.description}</p></CardContent></Card>
              <Card>
                <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {job.requirements.map((item, i) => (<li key={i} className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" /><span>{item}</span></li>))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Benefits</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {job.benefits.map((item, i) => (<li key={i} className="flex items-start gap-3"><CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" /><span>{item}</span></li>))}
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Quick Apply</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Ready to take the next step? Apply now and join our team.</p>
                  <Button className="w-full nordic-gradient" onClick={() => setIsDialogOpen(true)}>Apply for this Position</Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Share this Job</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">Share on LinkedIn</Button>
                  <Button variant="outline" className="w-full justify-start">Share on Twitter</Button>
                  <Button variant="outline" className="w-full justify-start">Copy Link</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
