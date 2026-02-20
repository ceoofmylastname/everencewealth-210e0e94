import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, Send, User, Shield, Filter, Eye } from "lucide-react";

interface Conversation {
  id: string;
  advisor_id: string;
  client_id: string;
  last_message_at: string;
  client_name?: string;
  advisor_name?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function AdvisorMessages() {
  const { portalUser } = usePortalAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [clients, setClients] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [advisorFilter, setAdvisorFilter] = useState<string>("all");
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = portalUser?.role === "admin";

  // Check if admin owns the selected conversation
  const selectedConversation = conversations.find((c) => c.id === selectedConv);
  const isOwnConversation = selectedConversation?.advisor_id === portalUser?.id;
  const canSend = !isAdmin || isOwnConversation;

  useEffect(() => {
    if (!portalUser) return;
    loadConversations();
    loadClients();
  }, [portalUser]);

  useEffect(() => {
    if (!selectedConv) return;
    loadMessages(selectedConv);
    if (canSend) markMessagesRead(selectedConv);

    const channel = supabase
      .channel(`conv-${selectedConv}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "portal_messages",
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        if (canSend && (payload.new as Message).sender_id !== portalUser?.id) {
          markMessagesRead(selectedConv);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConv, canSend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadConversations() {
    if (!portalUser) return;

    let query = supabase
      .from("portal_conversations")
      .select("*")
      .order("last_message_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("advisor_id", portalUser.id);
    }

    const { data } = await query;
    if (!data) return;

    const userIds = new Set<string>();
    data.forEach((c: any) => {
      userIds.add(c.client_id);
      userIds.add(c.advisor_id);
    });

    const { data: userData } = await supabase
      .from("portal_users")
      .select("id, first_name, last_name")
      .in("id", Array.from(userIds));

    const nameMap: Record<string, string> = {};
    userData?.forEach((u: any) => {
      nameMap[u.id] = `${u.first_name} ${u.last_name}`;
    });
    setSenderNames((prev) => ({ ...prev, ...nameMap }));

    const enriched = data.map((c: any) => ({
      ...c,
      client_name: nameMap[c.client_id] || "Unknown",
      advisor_name: nameMap[c.advisor_id] || "Unknown",
    }));
    setConversations(enriched);
  }

  async function loadClients() {
    if (!portalUser) return;
    // Admin loads only their own clients for new conversations; advisors load theirs
    const { data } = await supabase
      .from("portal_users")
      .select("id, first_name, last_name")
      .eq("advisor_id", portalUser.id)
      .eq("role", "client")
      .eq("is_active", true);
    setClients(data ?? []);
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from("portal_messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) ?? []);
  }

  async function markMessagesRead(convId: string) {
    if (!portalUser) return;
    await supabase
      .from("portal_messages")
      .update({ read: true })
      .eq("conversation_id", convId)
      .neq("sender_id", portalUser.id);
  }

  async function startConversation(clientId: string) {
    if (!portalUser) return;
    const existing = conversations.find((c) => c.client_id === clientId && c.advisor_id === portalUser.id);
    if (existing) {
      setSelectedConv(existing.id);
      return;
    }

    const { data, error } = await supabase
      .from("portal_conversations")
      .insert({ advisor_id: portalUser.id, client_id: clientId })
      .select()
      .single();

    if (!error && data) {
      await loadConversations();
      setSelectedConv(data.id);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !portalUser || !canSend) return;

    setSending(true);
    const content = newMessage.trim();
    const { error } = await supabase.from("portal_messages").insert({
      conversation_id: selectedConv,
      sender_id: portalUser.id,
      content,
    });

    if (!error) {
      setNewMessage("");
      await supabase
        .from("portal_conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", selectedConv);

      supabase.functions.invoke("notify-portal-message", {
        body: {
          conversation_id: selectedConv,
          message_content: content,
          sender_role: isAdmin ? "advisor" : "advisor",
        },
      }).catch((err) => console.warn("Notification error:", err));
    }
    setSending(false);
  }

  // Get unique advisors for filter dropdown
  const uniqueAdvisors = isAdmin
    ? Array.from(new Map(conversations.map((c) => [c.advisor_id, c.advisor_name || "Unknown"])).entries())
    : [];

  // Filter conversations by selected advisor
  const filteredConversations = advisorFilter === "all"
    ? conversations
    : conversations.filter((c) => c.advisor_id === advisorFilter);

  function getMessageAlignment(msg: Message) {
    if (!isAdmin) return msg.sender_id === portalUser?.id ? "right" : "left";
    const conv = selectedConversation;
    return conv && msg.sender_id === conv.advisor_id ? "right" : "left";
  }

  function getConversationLabel(conv: Conversation) {
    if (isAdmin) return `${conv.advisor_name} ↔ ${conv.client_name}`;
    return conv.client_name || "Unknown";
  }

  // Clients available for new conversation (own clients only)
  const availableClients = clients.filter((c) => !conversations.find((conv) => conv.client_id === c.id && conv.advisor_id === portalUser?.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Messages
        </h1>
        {isAdmin && selectedConv && !isOwnConversation && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <Eye className="h-3 w-3" />
            Observing
          </span>
        )}
        {isAdmin && selectedConv && isOwnConversation && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            <MessageSquare className="h-3 w-3" />
            Your Conversation
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="py-3 px-4 border-b">
            <CardTitle className="text-sm">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {/* Admin: Advisor filter */}
            {isAdmin && uniqueAdvisors.length > 1 && (
              <div className="p-3 border-b">
                <div className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    className="w-full text-sm border rounded-md p-2 bg-background"
                    value={advisorFilter}
                    onChange={(e) => setAdvisorFilter(e.target.value)}
                  >
                    <option value="all">All Advisors</option>
                    {uniqueAdvisors.map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Start new conversation (for both admin and advisor, using their own clients) */}
            {availableClients.length > 0 && (
              <div className="p-3 border-b">
                <select
                  className="w-full text-sm border rounded-md p-2 bg-background"
                  onChange={(e) => { if (e.target.value) startConversation(e.target.value); e.target.value = ""; }}
                  defaultValue=""
                >
                  <option value="" disabled>+ New conversation...</option>
                  {availableClients.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>
            )}

            {filteredConversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
            ) : (
              filteredConversations.map((conv) => {
                const isOwn = conv.advisor_id === portalUser?.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors",
                      selectedConv === conv.id && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        isAdmin && isOwn ? "bg-emerald-100" : "bg-primary/10"
                      )}>
                        <User className={cn("h-4 w-4", isAdmin && isOwn ? "text-emerald-700" : "text-primary")} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{getConversationLabel(conv)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.last_message_at).toLocaleDateString()}
                          {isAdmin && isOwn && <span className="ml-1.5 text-emerald-600 font-medium">• Yours</span>}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Select a conversation to {canSend ? "start messaging" : "view messages"}</p>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="py-3 px-4 border-b">
                <CardTitle className="text-sm">{getConversationLabel(selectedConversation!)}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const alignment = getMessageAlignment(msg);
                  const isRight = alignment === "right";
                  const senderLabel = senderNames[msg.sender_id];
                  return (
                    <div key={msg.id} className={cn("flex", isRight ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        isRight
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}>
                        {isAdmin && senderLabel && (
                          <p className={cn("text-[10px] font-semibold mb-0.5", isRight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {senderLabel}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        <p className={cn("text-[10px] mt-1", isRight ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Show send form when user can send */}
              {canSend && (
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
              )}

              {/* Show read-only indicator for observing */}
              {!canSend && (
                <div className="border-t p-3 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    You are observing this conversation (read-only)
                  </p>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
