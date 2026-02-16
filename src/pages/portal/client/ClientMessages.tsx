import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, Send } from "lucide-react";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function ClientMessages() {
  const { portalUser } = usePortalAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [advisorName, setAdvisorName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!portalUser) return;
    loadConversation();
  }, [portalUser]);

  useEffect(() => {
    if (!conversationId) return;
    loadMessages();
    markRead();

    const channel = supabase
      .channel(`client-conv-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "portal_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        if ((payload.new as Message).sender_id !== portalUser?.id) {
          markRead();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversation() {
    if (!portalUser) return;
    const { data } = await supabase
      .from("portal_conversations")
      .select("*, advisor:advisor_id(first_name, last_name)")
      .eq("client_id", portalUser.id)
      .order("last_message_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setConversationId(data.id);
      const adv = data.advisor as any;
      if (adv) setAdvisorName(`${adv.first_name} ${adv.last_name}`);
    }
    setLoading(false);
  }

  async function loadMessages() {
    if (!conversationId) return;
    const { data } = await supabase
      .from("portal_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
  }

  async function markRead() {
    if (!conversationId || !portalUser) return;
    await supabase
      .from("portal_messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", portalUser.id);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !portalUser) return;

    setSending(true);
    await supabase.from("portal_messages").insert({
      conversation_id: conversationId,
      sender_id: portalUser.id,
      content: newMessage.trim(),
    });

    await supabase
      .from("portal_conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", conversationId);

    setNewMessage("");
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Messages
        </h1>
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">No conversation yet. Your advisor will reach out to you soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
        Messages
      </h1>

      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader className="py-3 px-4 border-b">
          <CardTitle className="text-sm">Chat with {advisorName || "Your Advisor"}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => {
            const isMine = msg.sender_id === portalUser?.id;
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2",
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                )}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </CardContent>
        <div className="border-t p-3">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
