import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import { MessageSquare, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

const BRAND = "#1A4D3E";

interface Thread {
  thread_id: string;
  agent_name: string;
  last_message: string;
  last_at: string;
}

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export default function ContractingMessages() {
  const { contractingAgent, contractingRole, canViewAll, loading: authLoading } = useContractingAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [agentNames, setAgentNames] = useState<Map<string, string>>(new Map());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading) fetchThreads();
  }, [authLoading]);

  useEffect(() => {
    if (selectedThread) fetchMessages(selectedThread);
  }, [selectedThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("contracting-messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "contracting_messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.thread_id === selectedThread) {
          setMessages(prev => [...prev, {
            id: msg.id, thread_id: msg.thread_id, sender_id: msg.sender_id,
            content: msg.content, is_read: msg.is_read, created_at: msg.created_at,
            sender_name: agentNames.get(msg.sender_id) || "Unknown",
          }]);
        }
        fetchThreads();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedThread, agentNames]);

  async function fetchThreads() {
    try {
      const { data } = await supabase
        .from("contracting_messages")
        .select("thread_id, sender_id, content, created_at")
        .order("created_at", { ascending: false });

      if (!data) { setLoading(false); return; }

      // Collect all unique sender/thread IDs to resolve names
      const allIds = new Set<string>();
      for (const msg of data) {
        allIds.add(msg.thread_id);
        allIds.add(msg.sender_id);
      }

      const { data: agents } = await supabase
        .from("contracting_agents")
        .select("id, first_name, last_name")
        .in("id", Array.from(allIds));

      const nameMap = new Map<string, string>();
      if (agents) {
        for (const a of agents) nameMap.set(a.id, `${a.first_name} ${a.last_name}`);
      }
      setAgentNames(nameMap);

      // Build threads
      const threadMap = new Map<string, Thread>();
      for (const msg of data) {
        if (!threadMap.has(msg.thread_id)) {
          threadMap.set(msg.thread_id, {
            thread_id: msg.thread_id,
            agent_name: nameMap.get(msg.thread_id) || msg.thread_id.slice(0, 8),
            last_message: msg.content,
            last_at: msg.created_at,
          });
        }
      }

      setThreads(Array.from(threadMap.values()));

      // Auto-select for agents
      if (!canViewAll && contractingAgent?.id) {
        setSelectedThread(contractingAgent.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(threadId: string) {
    const { data } = await supabase
      .from("contracting_messages")
      .select("id, thread_id, sender_id, content, is_read, created_at")
      .eq("thread_id", threadId)
      .order("created_at");
    if (data) {
      setMessages(data.map(m => ({
        ...m,
        sender_name: agentNames.get(m.sender_id) || "Unknown",
      })));
    }
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedThread || !contractingAgent?.id) return;
    setSending(true);
    try {
      await supabase.from("contracting_messages").insert({
        thread_id: selectedThread,
        sender_id: contractingAgent.id,
        content: newMessage.trim(),
      });
      // Log message sent
      supabase.from("contracting_activity_logs").insert({
        agent_id: selectedThread,
        performed_by: contractingAgent.id,
        action: "message_sent",
        activity_type: "message_sent",
        description: "Sent a message in thread",
      }).then(null, err => console.error("Activity log error:", err));
      setNewMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  const filteredThreads = threads.filter(t =>
    t.agent_name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  // Agent view: single thread, no sidebar
  if (!canViewAll) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === contractingAgent?.id} />
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-4 border-t border-gray-100 flex gap-2">
            <Input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <Button onClick={handleSend} disabled={sending || !newMessage.trim()} style={{ background: BRAND }} className="text-white">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Admin/Manager view: thread list + messages
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Contracting Messages</h1>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] flex" style={{ height: "calc(100vh - 220px)" }}>
        {/* Thread list */}
        <div className="w-72 border-r border-gray-100 flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search threads..." className="pl-9 h-9 text-sm" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No conversations</div>
            ) : (
              filteredThreads.map(thread => (
                <button
                  key={thread.thread_id}
                  onClick={() => setSelectedThread(thread.thread_id)}
                  className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedThread === thread.thread_id ? "bg-gray-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: BRAND }}>
                      {thread.agent_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{thread.agent_name}</p>
                      <p className="text-xs text-gray-400 truncate">{thread.last_message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Messages panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === contractingAgent?.id} />
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                />
                <Button onClick={handleSend} disabled={sending || !newMessage.trim()} style={{ background: BRAND }} className="text-white">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isOwn ? "text-white" : "bg-gray-100 text-gray-800"}`} style={isOwn ? { background: BRAND } : undefined}>
        {!isOwn && (
          <p className="text-xs font-semibold mb-0.5" style={{ color: BRAND }}>{msg.sender_name}</p>
        )}
        <p className="text-sm">{msg.content}</p>
        <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "text-gray-400"}`}>
          {format(new Date(msg.created_at), "h:mm a")}
        </p>
      </div>
    </div>
  );
}
