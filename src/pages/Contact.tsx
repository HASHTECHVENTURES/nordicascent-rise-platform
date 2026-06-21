import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSubmitContact } from "@/hooks/useData";
import { useState } from "react";

export default function Contact() {
  const { toast } = useToast();
  const submitContact = useSubmitContact();
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [demoForm, setDemoForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    size: "",
    interest: "",
    message: "",
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitContact.mutateAsync({
        name: `${contactForm.firstName} ${contactForm.lastName}`.trim(),
        email: contactForm.email,
        company: contactForm.subject,
        message: contactForm.message,
      });
      toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
      setContactForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast({ title: "Failed to send", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const details = [
      demoForm.size && `Company size: ${demoForm.size}`,
      demoForm.interest && `Role: ${demoForm.interest}`,
      demoForm.message,
    ].filter(Boolean).join("\n");
    try {
      await submitContact.mutateAsync({
        name: `${demoForm.firstName} ${demoForm.lastName}`.trim(),
        email: demoForm.email,
        company: demoForm.company,
        message: `[Demo request]\n${details}`,
      });
      toast({ title: "Demo Requested!", description: "Our team will reach out to schedule your demo." });
      setDemoForm({ firstName: "", lastName: "", email: "", company: "", size: "", interest: "", message: "" });
    } catch (err) {
      toast({ title: "Failed to send", description: err instanceof Error ? err.message : "Try again", variant: "destructive" });
    }
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
                    <div className="space-y-2">
                      <Label htmlFor="demo-firstName">First Name</Label>
                      <Input
                        id="demo-firstName"
                        required
                        value={demoForm.firstName}
                        onChange={(e) => setDemoForm((f) => ({ ...f, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="demo-lastName">Last Name</Label>
                      <Input
                        id="demo-lastName"
                        required
                        value={demoForm.lastName}
                        onChange={(e) => setDemoForm((f) => ({ ...f, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-email">Work Email</Label>
                    <Input
                      id="demo-email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      value={demoForm.email}
                      onChange={(e) => setDemoForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-company">Company Name</Label>
                    <Input
                      id="demo-company"
                      required
                      value={demoForm.company}
                      onChange={(e) => setDemoForm((f) => ({ ...f, company: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-size">Company Size</Label>
                    <Select value={demoForm.size} onValueChange={(v) => setDemoForm((f) => ({ ...f, size: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select company size" /></SelectTrigger>
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
                    <Select value={demoForm.interest} onValueChange={(v) => setDemoForm((f) => ({ ...f, interest: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="company">Company looking for talent</SelectItem>
                        <SelectItem value="candidate">Candidate seeking opportunities</SelectItem>
                        <SelectItem value="partner">Potential partner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demo-message">Notes (optional)</Label>
                    <Textarea
                      id="demo-message"
                      rows={3}
                      value={demoForm.message}
                      onChange={(e) => setDemoForm((f) => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" className="w-full nordic-gradient nordic-glow" disabled={submitContact.isPending}>
                    {submitContact.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request Demo"}
                  </Button>
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
                    <div className="space-y-2">
                      <Label htmlFor="contact-firstName">First Name</Label>
                      <Input
                        id="contact-firstName"
                        required
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm((f) => ({ ...f, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-lastName">Last Name</Label>
                      <Input
                        id="contact-lastName"
                        required
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm((f) => ({ ...f, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Select value={contactForm.subject} onValueChange={(v) => setContactForm((f) => ({ ...f, subject: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="company">Company Partnership</SelectItem>
                        <SelectItem value="candidate">Candidate Application</SelectItem>
                        <SelectItem value="partnership">Strategic Partnership</SelectItem>
                        <SelectItem value="press">Press & Media</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      placeholder="How can we help you?"
                      rows={5}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full" disabled={submitContact.isPending}>
                    {submitContact.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
