import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { useNavigate } from "react-router-dom";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
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

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "policy", label: "Policy Updates" },
  { value: "document", label: "Documents" },
  { value: "message", label: "Messages" },
  { value: "system", label: "System" },
];

export default function ClientNotifications() {
  const { portalUser } = usePortalAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (portalUser) fetchNotifications();
  }, [portalUser]);

  async function fetchNotifications() {
    if (!portalUser) return;
    setLoading(true);
    const { data } = await supabase
      .from("portal_notifications")
      .select("*")
      .eq("user_id", portalUser.id)
      .order("created_at", { ascending: false });
    setNotifications((data as Notification[]) ?? []);
    setLoading(false);
  }

  const filtered = filter === "all"
    ? notifications
    : notifications.filter((n) => n.notification_type.includes(filter));

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="h-12 w-12 mb-4 opacity-40" />
          <p className="text-lg font-medium">No notifications</p>
          <p className="text-sm mt-1">You're all caught up!</p>
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 px-4 py-4 hover:bg-muted/50 transition-colors cursor-pointer",
                !n.read && "bg-primary/5"
              )}
              onClick={() => handleClick(n)}
            >
              {!n.read && (
                <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
              )}
              <div className={cn("flex-1 min-w-0", n.read && "pl-[18px]")}>
                <p className="text-sm font-medium">{n.title}</p>
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
          ))}
        </Card>
      )}
    </div>
  );
}
