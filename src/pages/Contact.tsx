import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Demo Requested!", description: "Our team will reach out to schedule your demo." });
  };

  return (
    <div className="flex flex-col">
      <section className="py-20 lg:py-28 bg-gradient-to-b from-accent/30 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Let's Start a <span className="nordic-gradient-text">Conversation</span>
            </h1>
            <p className="text-xl text-muted-foreground">Have questions? Want to see a demo? We're here to help you find the right solution.</p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="animate-fade-in-up">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg nordic-gradient flex items-center justify-center"><Calendar className="h-5 w-5 text-primary-foreground" /></div>
                  <CardTitle>Book a Demo</CardTitle>
                </div>
                <p className="text-muted-foreground">See Nordic Ascent in action with a personalized demo.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="demo-firstName">First Name</Label><Input id="demo-firstName" required /></div>
                    <div className="space-y-2"><Label htmlFor="demo-lastName">Last Name</Label><Input id="demo-lastName" required /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="demo-email">Work Email</Label><Input id="demo-email" type="email" placeholder="you@company.com" required /></div>
                  <div className="space-y-2"><Label htmlFor="demo-company">Company Name</Label><Input id="demo-company" required /></div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-size">Company Size</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select company size" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="501-1000">501-1000 employees</SelectItem>
                        <SelectItem value="1000+">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-interest">I am a...</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company looking for talent</SelectItem>
                        <SelectItem value="candidate">Candidate seeking opportunities</SelectItem>
                        <SelectItem value="partner">Potential partner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full nordic-gradient nordic-glow">Request Demo</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><Send className="h-5 w-5 text-secondary-foreground" /></div>
                  <CardTitle>Send a Message</CardTitle>
                </div>
                <p className="text-muted-foreground">Have a question or feedback? Drop us a line.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="contact-firstName">First Name</Label><Input id="contact-firstName" required /></div>
                    <div className="space-y-2"><Label htmlFor="contact-lastName">Last Name</Label><Input id="contact-lastName" required /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="contact-email">Email</Label><Input id="contact-email" type="email" placeholder="you@example.com" required /></div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="company">Company Partnership</SelectItem>
                        <SelectItem value="candidate">Candidate Application</SelectItem>
                        <SelectItem value="partnership">Strategic Partnership</SelectItem>
                        <SelectItem value="press">Press & Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" placeholder="How can we help you?" rows={5} required /></div>
                  <Button type="submit" variant="outline" className="w-full">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
