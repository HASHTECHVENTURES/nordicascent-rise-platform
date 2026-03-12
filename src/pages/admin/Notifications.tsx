import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Megaphone, UserCheck, Building2 } from "lucide-react";
import { useState } from "react";

const AdminNotifications = () => {
  const [audience, setAudience] = useState<"candidates" | "companies" | "all">("candidates");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">Send a message to all candidates, all companies, or everyone</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            New announcement
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your message will be sent by email to the selected audience.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Send to</Label>
            <RadioGroup
              value={audience}
              onValueChange={(v) => setAudience(v as "candidates" | "companies" | "all")}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="candidates" id="candidates" />
                <label htmlFor="candidates" className="flex items-center gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4" /> All candidates
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="companies" id="companies" />
                <label htmlFor="companies" className="flex items-center gap-2 cursor-pointer">
                  <Building2 className="h-4 w-4" /> All companies
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <label htmlFor="all" className="cursor-pointer">Everyone</label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="e.g. New feature: Profile export"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              placeholder="Write your announcement..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          <Button className="gap-2">
            <Megaphone className="h-4 w-4" />
            Send announcement
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
