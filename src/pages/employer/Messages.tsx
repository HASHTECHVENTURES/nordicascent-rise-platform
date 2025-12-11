import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Paperclip, MoreVertical, Briefcase } from "lucide-react";
import { useState } from "react";

const conversations = [
  { id: 1, candidate: "Emma Lindqvist", role: "Frontend Developer", lastMessage: "Thank you for the update!", time: "5 min ago", unread: 1 },
  { id: 2, candidate: "Lars Andersen", role: "Product Manager", lastMessage: "I'm available on Thursday afternoon.", time: "1 hour ago", unread: 0 },
  { id: 3, candidate: "Sofia Virtanen", role: "UX Designer", lastMessage: "Looking forward to the interview!", time: "Yesterday", unread: 0 },
  { id: 4, candidate: "Magnus Olsen", role: "Backend Engineer", lastMessage: "Could you share more details about the role?", time: "2 days ago", unread: 2 },
];

const messages = [
  { id: 1, sender: "candidate", content: "Hi! Thank you for considering my application.", time: "10:00 AM" },
  { id: 2, sender: "me", content: "Hello Emma! We were impressed with your profile and would like to schedule an interview.", time: "10:15 AM" },
  { id: 3, sender: "me", content: "Would you be available this Thursday at 2 PM for a technical interview?", time: "10:16 AM" },
  { id: 4, sender: "candidate", content: "Yes, Thursday at 2 PM works perfectly for me!", time: "10:45 AM" },
  { id: 5, sender: "me", content: "I've sent you a calendar invite with the video call link. Please let me know if you have any questions.", time: "11:00 AM" },
  { id: 6, sender: "candidate", content: "Thank you for the update!", time: "11:05 AM" },
];

const EmployerMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Messages</h1><p className="text-muted-foreground">Communicate with candidates</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search conversations..." className="pl-9" /></div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-22rem)]">
              {conversations.map((conv) => (
                <div key={conv.id} onClick={() => setSelectedConversation(conv)} className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${selectedConversation.id === conv.id ? 'bg-muted/50' : ''}`}>
                  <Avatar><AvatarFallback className="bg-employer-accent/10 text-employer-accent">{conv.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><h3 className="font-medium truncate">{conv.candidate}</h3><span className="text-xs text-muted-foreground">{conv.time}</span></div>
                    <p className="text-sm text-muted-foreground">{conv.role}</p>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && <Badge className="bg-employer-accent">{conv.unread}</Badge>}
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback className="bg-employer-accent/10 text-employer-accent">{selectedConversation.candidate.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                <div><CardTitle className="text-lg">{selectedConversation.candidate}</CardTitle><p className="text-sm text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" />{selectedConversation.role}</p></div>
              </div>
              <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${msg.sender === 'me' ? 'bg-employer-accent text-white' : 'bg-muted'} rounded-lg p-3`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="ghost" size="icon"><Paperclip className="h-4 w-4" /></Button>
              <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="flex-1" />
              <Button className="bg-employer-accent hover:bg-employer-accent/90"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployerMessages;
