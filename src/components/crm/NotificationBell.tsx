import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Zap, UserPlus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  CrmNotification,
  useAgentNotifications,
  useMarkNotificationRead,
} from "@/hooks/useClaimableLeads";

interface NotificationBellProps {
  agentId: string | null;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "new_lead_available":
      return <Zap className="w-4 h-4 text-primary" />;
    case "lead_claimed":
      return <Check className="w-4 h-4 text-muted-foreground" />;
    case "lead_assigned":
      return <UserPlus className="w-4 h-4 text-green-500" />;
    case "callback_due":
      return <Clock className="w-4 h-4 text-amber-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
}

export function NotificationBell({ agentId }: NotificationBellProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { data: notifications = [], isLoading } = useAgentNotifications(agentId);
  const markReadMutation = useMarkNotificationRead();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUrgent = notifications.some(
    (n) => !n.read && n.notification_type === "new_lead_available"
  );

  const handleNotificationClick = (notification: CrmNotification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
      setOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    for (const notification of unreadNotifications) {
      await markReadMutation.mutateAsync(notification.id);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className={cn(
            "h-5 w-5",
            hasUrgent && "text-primary animate-pulse"
          )} />
          {unreadCount > 0 && (
            <>
              <span
                className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                  hasUrgent ? "bg-red-500" : "bg-primary"
                )}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
              {hasUrgent && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 animate-ping" />
              )}
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-muted/50 transition-colors flex gap-3",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        !notification.read && "text-foreground",
                        notification.read && "text-muted-foreground"
                      )}
                    >
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              navigate("/crm/agent/notifications");
              setOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
