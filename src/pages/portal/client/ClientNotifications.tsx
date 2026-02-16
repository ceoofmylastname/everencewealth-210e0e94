import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { useNavigate } from "react-router-dom";
import { Bell, Trash2, FileText, MessageSquare, Shield, Settings, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

const PAGE_SIZE = 20;

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "document", label: "Documents" },
  { value: "message", label: "Messages" },
  { value: "policy", label: "Policy Updates" },
  { value: "system", label: "System" },
];

function getNotificationIcon(type: string) {
  switch (type) {
    case "document":
      return { icon: FileText, bg: "bg-blue-100 text-blue-600" };
    case "message":
      return { icon: MessageSquare, bg: "bg-emerald-100 text-emerald-600" };
    case "policy":
      return { icon: Shield, bg: "bg-amber-100 text-amber-600" };
    case "system":
      return { icon: Settings, bg: "bg-gray-100 text-gray-600" };
    default:
      return { icon: Bell, bg: "bg-[#E8F2EF] text-[#1A4D3E]" };
  }
}

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date)) return "This Week";
  return "Older";
}

export default function ClientNotifications() {
  const { portalUser } = usePortalAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (offset = 0, append = false) => {
    if (!portalUser) return;
    if (!append) setLoading(true);
    else setLoadingMore(true);

    const { data } = await supabase
      .from("portal_notifications")
      .select("*")
      .eq("user_id", portalUser.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    const fetched = (data as Notification[]) ?? [];
    setHasMore(fetched.length === PAGE_SIZE);

    if (append) {
      setNotifications((prev) => [...prev, ...fetched]);
    } else {
      setNotifications(fetched);
    }

    if (!append) setLoading(false);
    else setLoadingMore(false);
  }, [portalUser]);

  useEffect(() => {
    if (portalUser) fetchNotifications();
  }, [portalUser, fetchNotifications]);

  // Realtime subscription
  useEffect(() => {
    if (!portalUser) return;

    const channel = supabase
      .channel("client-notifications-page")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "portal_notifications",
          filter: `user_id=eq.${portalUser.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [portalUser]);

  const filtered = filter === "all"
    ? notifications
    : filter === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => n.notification_type.includes(filter));

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Group by date
  const grouped: Record<string, Notification[]> = {};
  for (const n of filtered) {
    const group = getDateGroup(n.created_at);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(n);
  }
  const groupOrder = ["Today", "Yesterday", "This Week", "Older"];

  async function markAsRead(id: string) {
    await supabase.from("portal_notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllRead() {
    if (!portalUser) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("portal_notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  }

  async function deleteNotification(id: string) {
    await supabase.from("portal_notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  }

  async function deleteAllRead() {
    const readIds = notifications.filter((n) => n.read).map((n) => n.id);
    if (readIds.length === 0) return;
    await supabase.from("portal_notifications").delete().in("id", readIds);
    setNotifications((prev) => prev.filter((n) => !n.read));
    toast.success("Read notifications deleted");
  }

  function handleClick(n: Notification) {
    if (!n.read) markAsRead(n.id);
    if (n.link) navigate(n.link);
  }

  function handleLoadMore() {
    fetchNotifications(notifications.length, true);
  }

  return (
    <div className="min-h-screen bg-[#F0F2F1] -m-6 p-6">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1A4D3E]">Notifications</h1>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
            {notifications.some((n) => n.read) && (
              <Button variant="outline" size="sm" onClick={deleteAllRead}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete read
              </Button>
            )}
          </div>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            {TYPE_FILTERS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A4D3E]" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mb-4 text-[#1A4D3E] opacity-40" />
            <p className="text-lg font-medium">You're all caught up!</p>
            <p className="text-sm mt-1">No notifications to show</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {groupOrder.map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <div key={group}>
                  <div className="sticky top-0 z-10 bg-[#F0F2F1] py-2">
                    <p className="text-xs font-semibold text-[#1A4D3E]/60 uppercase tracking-wider">{group}</p>
                  </div>
                  <Card className="divide-y overflow-hidden">
                    {items.map((n) => {
                      const { icon: Icon, bg } = getNotificationIcon(n.notification_type);
                      return (
                        <div
                          key={n.id}
                          className={cn(
                            "flex items-start gap-3 px-4 py-4 transition-colors cursor-pointer border border-transparent",
                            !n.read ? "bg-[#E8F2EF]" : "bg-white",
                            "hover:border-[#1A4D3E]/20"
                          )}
                          onClick={() => handleClick(n)}
                        >
                          <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5", bg)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{n.title}</p>
                              {!n.read && (
                                <div className="h-2 w-2 rounded-full bg-[#1A4D3E] shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </Card>
                </div>
              );
            })}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Load More
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
