import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, Send, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  { icon: Mail, label: "Email", value: "hello@nordicascent.com" },
  { icon: Phone, label: "Phone", value: "+46 8 123 456 78" },
  { icon: MapPin, label: "Address", value: "Kungsgatan 1, Stockholm, Sweden" },
  { icon: Clock, label: "Hours", value: "Mon-Fri 9:00-18:00 CET" },
];

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
            <p className="text-xl text-muted-foreground">Have questions? Want to see a demo? We're here to help you find the right solution for your team.</p>
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
                <p className="text-muted-foreground">See Nordicascent in action with a personalized demo.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="demo-firstName">First Name</Label><Input id="demo-firstName" required /></div>
                    <div className="space-y-2"><Label htmlFor="demo-lastName">Last Name</Label><Input id="demo-lastName" required /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="demo-email">Work Email</Label><Input id="demo-email" type="email" required /></div>
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
                    <Label htmlFor="demo-interest">Primary Interest</Label>
                    <Select><SelectTrigger><SelectValue placeholder="What are you looking for?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee-management">Employee Management</SelectItem>
                        <SelectItem value="training">Training & Learning</SelectItem>
                        <SelectItem value="reporting">Reporting & Analytics</SelectItem>
                        <SelectItem value="compliance">Compliance & Admin</SelectItem>
                        <SelectItem value="full-platform">Full Platform</SelectItem>
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
                  <div className="space-y-2"><Label htmlFor="contact-email">Email</Label><Input id="contact-email" type="email" required /></div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Select><SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Customer Support</SelectItem>
                        <SelectItem value="sales">Sales Question</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
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

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground">Reach out directly through any of these channels.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {contactInfo.map((item, i) => (
              <Card key={item.label} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardContent className="pt-6 pb-6 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-accent mx-auto flex items-center justify-center">
                    <item.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="font-medium">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
