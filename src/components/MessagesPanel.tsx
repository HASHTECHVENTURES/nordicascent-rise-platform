import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Send, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  useConversationsWithDetails,
  useMessageableUsers,
  useMessages,
  useSendMessage,
  useStartConversation,
  useMarkConversationRead,
} from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { MessageBody } from "@/components/MessageBody";
import { cn } from "@/lib/utils";

type Props = {
  emptyHint?: string;
  allowNewConversation?: boolean;
  initialProfileId?: string;
};

function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function sentStyles(role: string | undefined) {
  if (role === "candidate") {
    return {
      bubble: "bg-nordic-orange text-white",
      button: "bg-nordic-orange hover:bg-nordic-orange/90 text-white",
      badge: "bg-nordic-orange text-white",
      link: "text-white underline underline-offset-2",
    };
  }
  return {
    bubble: "bg-primary text-primary-foreground",
    button: "bg-primary hover:bg-primary/90 text-primary-foreground",
    badge: "bg-primary text-primary-foreground",
    link: "text-primary-foreground underline underline-offset-2",
  };
}

export default function MessagesPanel({
  emptyHint = "Start a conversation from a candidate or employer profile.",
  allowNewConversation = false,
  initialProfileId,
}: Props) {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const styles = sentStyles(profile?.role);
  const { data: conversations, isLoading } = useConversationsWithDetails();
  const { data: messageableUsers, isLoading: usersLoading } = useMessageableUsers();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startedInitial, setStartedInitial] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading, isError: messagesError } = useMessages(selectedId);
  const sendMessage = useSendMessage();
  const startConversation = useStartConversation();
  const markRead = useMarkConversationRead();

  useEffect(() => {
    if (!selectedId) return;
    markRead.mutate(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["messages", selectedId] });
          qc.invalidateQueries({ queryKey: ["conversations-details"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedId, qc]);

  useEffect(() => {
    if (conversations?.length && !selectedId) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (!initialProfileId || startedInitial || !profile?.id) return;
    setStartedInitial(true);
    startConversation
      .mutateAsync({ otherProfileId: initialProfileId })
      .then((convId) => setSelectedId(convId))
      .catch(() => {});
  }, [initialProfileId, profile?.id, startedInitial, startConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const filtered = useMemo(() => {
    if (!search) return conversations ?? [];
    const q = search.toLowerCase();
    return (conversations ?? []).filter((c) =>
      c.otherName.toLowerCase().includes(q) || c.subject?.toLowerCase().includes(q)
    );
  }, [conversations, search]);

  const filteredUsers = useMemo(() => {
    if (!userSearch) return messageableUsers ?? [];
    const q = userSearch.toLowerCase();
    return (messageableUsers ?? []).filter(
      (u) =>
        (u.full_name?.toLowerCase().includes(q) ?? false) ||
        (u.subtitle?.toLowerCase().includes(q) ?? false),
    );
  }, [messageableUsers, userSearch]);

  const selected = conversations?.find((c) => c.id === selectedId);

  const handleSend = async () => {
    if (!selectedId || !newMessage.trim()) return;
    await sendMessage.mutateAsync({ conversationId: selectedId, body: newMessage.trim() });
    setNewMessage("");
  };

  const handleStartWithUser = async (otherProfileId: string, name: string | null) => {
    const convId = await startConversation.mutateAsync({
      otherProfileId,
      subject: name ? `Chat with ${name}` : undefined,
    });
    setSelectedId(convId);
    setDialogOpen(false);
    setUserSearch("");
    qc.invalidateQueries({ queryKey: ["conversations-details"] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="flex flex-col h-[min(720px,calc(100vh-11rem))] overflow-hidden border shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,300px)_1fr] flex-1 min-h-0">
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r min-h-0 bg-card">
          <div className="p-3 border-b flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {allowNewConversation && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="outline" className="shrink-0 h-9 w-9">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New message</DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search people..."
                      className="pl-9"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1">
                    {usersLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">{emptyHint}</p>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted text-left"
                          disabled={startConversation.isPending}
                          onClick={() => handleStartWithUser(user.id, user.full_name)}
                        >
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url ?? undefined} />
                            <AvatarFallback>{initials(user.full_name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{user.full_name ?? "User"}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.subtitle ?? user.role}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">{emptyHint}</p>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left border-b hover:bg-muted/60 transition-colors",
                    selectedId === conv.id && "bg-muted"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={conv.otherAvatar ?? undefined} />
                    <AvatarFallback>{initials(conv.otherName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate text-foreground">{conv.otherName}</span>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessage ?? "No messages yet"}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className={cn(styles.badge, "shrink-0 h-5 min-w-5 px-1.5")}>{conv.unread}</Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col min-h-[320px] lg:min-h-0 min-w-0 bg-background">
          {selected ? (
            <>
              <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b bg-card">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selected.otherAvatar ?? undefined} />
                  <AvatarFallback>{initials(selected.otherName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{selected.otherName}</p>
                  {(selected.otherSubtitle || selected.subject) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {selected.otherSubtitle ?? selected.subject}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 bg-muted/30">
                {messagesLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messagesError ? (
                  <p className="text-center text-sm text-destructive py-8">Could not load messages. Refresh the page.</p>
                ) : (messages ?? []).length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">No messages yet. Type below to start.</p>
                ) : (
                  <div className="space-y-4">
                    {(messages ?? []).map((msg) => {
                      const isMe = msg.sender_id === profile?.id;
                      return (
                        <div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                          <span className="text-[10px] text-muted-foreground mb-1 px-1">
                            {isMe ? "You" : selected.otherName}
                          </span>
                          <div
                            className={cn(
                              "max-w-[85%] rounded-xl px-4 py-3",
                              isMe
                                ? styles.bubble
                                : "bg-card border border-border text-foreground shadow-sm"
                            )}
                          >
                            <MessageBody
                              body={msg.body}
                              className={isMe ? "text-inherit" : "text-foreground"}
                              linkClassName={
                                isMe ? styles.link : "text-primary underline underline-offset-2 font-medium"
                              }
                            />
                            <p className={cn("text-[10px] mt-2 opacity-70", isMe ? "" : "text-muted-foreground opacity-100")}>
                              {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="shrink-0 p-3 border-t bg-card">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    className="flex-1 bg-background"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={sendMessage.isPending || !newMessage.trim()}
                    className={cn(styles.button, "shrink-0 px-4")}
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-8 text-center">
              {filtered.length === 0 ? emptyHint : "Select a conversation from the list"}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
