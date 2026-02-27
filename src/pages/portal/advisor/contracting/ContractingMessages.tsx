import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import { MessageSquare, Send, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BRAND = "#1A4D3E";

interface Thread {
  thread_id: string;
  agent_name: string;
  last_message: string;
  last_at: string;
  role_type?: "agent" | "manager";
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

interface AgentOption {
  id: string;
  name: string;
  role_type: "agent" | "manager";
}

export default function ContractingMessages() {
  const { contractingAgent, contractingRole, canViewAll, canManage, loading: authLoading, portalUser } = useContractingAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [agentNames, setAgentNames] = useState<Map<string, string>>(new Map());
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [agentOptions, setAgentOptions] = useState<AgentOption[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const myAgentId = contractingAgent?.id;
  const isAdmin = contractingRole === "admin" || contractingRole === "contracting";
  const isManagerOnly = contractingRole === "manager" && !isAdmin;

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

      const allIds = new Set<string>();
      for (const msg of data) {
        allIds.add(msg.thread_id);
        allIds.add(msg.sender_id);
      }

      // For agent view, also add their own ID so we always show "My Thread"
      if (!canViewAll && myAgentId) {
        allIds.add(myAgentId);
      }

      const { data: agents } = await supabase
        .from("contracting_agents")
        .select("id, first_name, last_name, contracting_role, manager_id")
        .in("id", Array.from(allIds));

      const nameMap = new Map<string, string>();
      const roleMap = new Map<string, string>();
      const managerIdMap = new Map<string, string | null>(); // agent_id -> manager_id (portal_users.id)
      if (agents) {
        for (const a of agents) {
          nameMap.set(a.id, `${a.first_name} ${a.last_name}`);
          roleMap.set(a.id, a.contracting_role || "agent");
          managerIdMap.set(a.id, a.manager_id);
        }
      }
      setAgentNames(nameMap);

      const threadMap = new Map<string, Thread>();
      for (const msg of data) {
        if (!threadMap.has(msg.thread_id)) {
          const role = roleMap.get(msg.thread_id);
          threadMap.set(msg.thread_id, {
            thread_id: msg.thread_id,
            agent_name: nameMap.get(msg.thread_id) || msg.thread_id.slice(0, 8),
            last_message: msg.content,
            last_at: msg.created_at,
            role_type: role === "manager" ? "manager" : "agent",
          });
        }
      }

      let threadList = Array.from(threadMap.values());

      // --- Role-based filtering ---

      if (!canViewAll && myAgentId) {
        // Agent view: show only own thread (messages where thread_id = myAgentId)
        // The agent always sees their own thread even if no messages yet
        if (!threadMap.has(myAgentId)) {
          threadList = [{
            thread_id: myAgentId,
            agent_name: "My Thread",
            last_message: "Start a conversation...",
            last_at: new Date().toISOString(),
            role_type: "agent",
          }];
        } else {
          threadList = threadList.filter(t => t.thread_id === myAgentId);
          // Rename to "My Thread" for clarity
          threadList = threadList.map(t => ({ ...t, agent_name: "My Thread" }));
        }
        // Auto-select the agent's own thread
        setSelectedThread(myAgentId);
      } else if (isManagerOnly && portalUser?.id) {
        // Manager (non-admin): only show threads where the agent's manager_id matches this user's portal_users.id
        threadList = threadList.filter(t => managerIdMap.get(t.thread_id) === portalUser.id);
      }
      // Admin: no filtering, see all threads

      setThreads(threadList);
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

  async function getRecipients(threadId: string, senderId: string): Promise<string[]> {
    const recipientIds = new Set<string>();

    // Always add the thread owner (the agent/manager whose thread this is)
    if (threadId !== senderId) {
      recipientIds.add(threadId);
    }

    // Get the thread agent's manager
    const { data: threadAgent } = await supabase
      .from("contracting_agents")
      .select("manager_id")
      .eq("id", threadId)
      .single();

    if (threadAgent?.manager_id) {
      // manager_id references portal_users.id, look up the contracting_agent for that portal user
      const { data: managerPortalUser } = await supabase
        .from("portal_users")
        .select("auth_user_id")
        .eq("id", threadAgent.manager_id)
        .single();

      if (managerPortalUser?.auth_user_id) {
        const { data: managerAgent } = await supabase
          .from("contracting_agents")
          .select("id")
          .eq("auth_user_id", managerPortalUser.auth_user_id)
          .single();

        if (managerAgent?.id && managerAgent.id !== senderId) {
          recipientIds.add(managerAgent.id);
        }
      }
    }

    // If agent is sending, also notify contracting/admin who have messaged in this thread
    if (senderId === threadId) {
      const { data: threadParticipants } = await supabase
        .from("contracting_messages")
        .select("sender_id")
        .eq("thread_id", threadId)
        .neq("sender_id", senderId);

      if (threadParticipants) {
        for (const p of threadParticipants) {
          recipientIds.add(p.sender_id);
        }
      }
    }

    recipientIds.delete(senderId);
    return Array.from(recipientIds);
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedThread || !myAgentId) return;
    setSending(true);
    try {
      const { error } = await supabase.from("contracting_messages").insert({
        thread_id: selectedThread,
        sender_id: myAgentId,
        content: newMessage.trim(),
      });

      if (error) {
        console.error("Insert error:", error);
        setSending(false);
        return;
      }

      const messageContent = newMessage.trim();
      setNewMessage("");

      // Log activity
      supabase.from("contracting_activity_logs").insert({
        agent_id: selectedThread,
        performed_by: myAgentId,
        action: "message_sent",
        activity_type: "message_sent",
        description: "Sent a message in thread",
      }).then(null, err => console.error("Activity log error:", err));

      const recipients = await getRecipients(selectedThread, myAgentId);
      if (recipients.length > 0) {
        supabase.functions.invoke("notify-contracting-message", {
          body: {
            thread_id: selectedThread,
            sender_id: myAgentId,
            message_content: messageContent,
            recipients,
          },
        }).then(null, err => console.error("Email notification error:", err));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  async function fetchAgentOptions() {
    const { data } = await supabase
      .from("contracting_agents")
      .select("id, first_name, last_name, contracting_role");
    if (data) {
      const options: AgentOption[] = data
        .filter(a => a.id !== myAgentId)
        .map(a => ({
          id: a.id,
          name: `${a.first_name} ${a.last_name}`,
          role_type: a.contracting_role === "manager" ? "manager" as const : "agent" as const,
        }));
      setAgentOptions(options);
    }
  }

  function startConversation(agentId: string) {
    setSelectedThread(agentId);
    setNewConvoOpen(false);
  }

  const agentThreads = threads.filter(t => t.role_type !== "manager");
  const managerThreads = threads.filter(t => t.role_type === "manager");

  const filteredAgentThreads = agentThreads.filter(t =>
    t.agent_name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredManagerThreads = managerThreads.filter(t =>
    t.agent_name.toLowerCase().includes(search.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  // Agent view: single thread (their own), no sidebar needed
  if (!canViewAll) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-sm text-gray-500">Messages sent here are visible to your manager and admin team.</p>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] flex flex-col" style={{ height: "calc(100vh - 260px)" }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-gray-400 py-12">
                <div className="text-center">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Send a message to get started</p>
                </div>
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === myAgentId} />
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contracting Messages</h1>
        {canManage && (
          <Dialog open={newConvoOpen} onOpenChange={(open) => { setNewConvoOpen(open); if (open) fetchAgentOptions(); }}>
            <DialogTrigger asChild>
              <Button size="sm" style={{ background: BRAND }} className="text-white gap-1.5">
                <Plus className="h-4 w-4" /> New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a Conversation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {agentOptions.filter(a => a.role_type === "manager").length > 0 && (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Managers</p>
                    {agentOptions.filter(a => a.role_type === "manager").map(a => (
                      <button key={a.id} onClick={() => startConversation(a.id)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#C5A059" }}>
                          {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium">{a.name}</span>
                      </button>
                    ))}
                  </>
                )}
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Agents</p>
                {agentOptions.filter(a => a.role_type === "agent").map(a => (
                  <button key={a.id} onClick={() => startConversation(a.id)} className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-100 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: BRAND }}>
                      {a.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium">{a.name}</span>
                  </button>
                ))}
                {agentOptions.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No agents found</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
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
            {filteredAgentThreads.length === 0 && filteredManagerThreads.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                {canManage ? "No conversations yet. Click 'New Message' to start one." : "No conversations"}
              </div>
            ) : (
              <>
                {filteredManagerThreads.length > 0 && canManage && (
                  <>
                    <div className="px-3 pt-3 pb-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Managers</p>
                    </div>
                    {filteredManagerThreads.map(thread => (
                      <ThreadButton key={thread.thread_id} thread={thread} selected={selectedThread === thread.thread_id} onSelect={setSelectedThread} accentColor="#C5A059" />
                    ))}
                  </>
                )}
                {filteredAgentThreads.length > 0 && (
                  <>
                    {filteredManagerThreads.length > 0 && canManage && (
                      <div className="px-3 pt-3 pb-1">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Agents</p>
                      </div>
                    )}
                    {filteredAgentThreads.map(thread => (
                      <ThreadButton key={thread.thread_id} thread={thread} selected={selectedThread === thread.thread_id} onSelect={setSelectedThread} accentColor={BRAND} />
                    ))}
                  </>
                )}
              </>
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
                  <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === myAgentId} />
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

function ThreadButton({ thread, selected, onSelect, accentColor }: { thread: Thread; selected: boolean; onSelect: (id: string) => void; accentColor: string }) {
  return (
    <button
      onClick={() => onSelect(thread.thread_id)}
      className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected ? "bg-gray-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: accentColor }}>
          {thread.agent_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate">{thread.agent_name}</p>
          <p className="text-xs text-gray-400 truncate">{thread.last_message}</p>
        </div>
      </div>
    </button>
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
