import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Paperclip, MoreVertical, Building2 } from "lucide-react";
import { useState } from "react";

const conversations = [
  { id: 1, company: "TechNordic AB", recruiter: "Johan Eriksson", lastMessage: "Looking forward to the interview!", time: "2 min ago", unread: 2, avatar: "" },
  { id: 2, company: "Nordic Innovations", recruiter: "Maria Hansen", lastMessage: "Thank you for applying. We'd like to schedule...", time: "1 hour ago", unread: 0, avatar: "" },
  { id: 3, company: "DesignHub Finland", recruiter: "Mikko Virtanen", lastMessage: "Congratulations! We're pleased to extend...", time: "Yesterday", unread: 1, avatar: "" },
  { id: 4, company: "DataFlow Norway", recruiter: "Erik Olsen", lastMessage: "Thank you for your time today.", time: "3 days ago", unread: 0, avatar: "" },
];

const messages = [
  { id: 1, sender: "recruiter", content: "Hi Emma! Thank you for applying to the Senior Frontend Developer position.", time: "10:30 AM" },
  { id: 2, sender: "recruiter", content: "We've reviewed your profile and are impressed with your experience. Would you be available for an interview this week?", time: "10:31 AM" },
  { id: 3, sender: "me", content: "Hi Johan! Thank you for reaching out. I'm very interested in the position.", time: "11:15 AM" },
  { id: 4, sender: "me", content: "I'm available on Thursday or Friday afternoon. Would either of those work?", time: "11:15 AM" },
  { id: 5, sender: "recruiter", content: "Perfect! Let's schedule for Thursday at 2 PM. I'll send you a calendar invite with the video call link.", time: "11:45 AM" },
  { id: 6, sender: "me", content: "That works great! I'll be there.", time: "12:00 PM" },
  { id: 7, sender: "recruiter", content: "Looking forward to the interview!", time: "12:05 PM" },
];

const CandidateMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">Communicate with recruiters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-22rem)]">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                    selectedConversation.id === conv.id ? 'bg-muted/50' : ''
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={conv.avatar} />
                    <AvatarFallback className="bg-candidate-accent/10 text-candidate-accent">
                      {conv.recruiter.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{conv.company}</h3>
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{conv.recruiter}</p>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="bg-candidate-accent">{conv.unread}</Badge>
                  )}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-candidate-accent/10 text-candidate-accent">
                    {selectedConversation.recruiter.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedConversation.recruiter}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {selectedConversation.company}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${
                    msg.sender === 'me' 
                      ? 'bg-candidate-accent text-white' 
                      : 'bg-muted'
                  } rounded p-3`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'
                    }`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input 
                placeholder="Type a message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button className="bg-candidate-accent hover:bg-candidate-accent/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CandidateMessages;
