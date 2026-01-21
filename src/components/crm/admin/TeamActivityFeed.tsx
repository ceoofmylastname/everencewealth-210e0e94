import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, ExternalLink, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  useTeamActivity,
  TeamActivity,
  getActivityTypeIcon,
  getActivityTypeLabel,
  formatCallOutcome,
} from "@/hooks/useTeamActivity";
import { getLanguageFlag } from "@/lib/crm-conditional-styles";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamActivityFeedProps {
  className?: string;
  limit?: number;
}

export function TeamActivityFeed({ className, limit = 20 }: TeamActivityFeedProps) {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("all");
  
  const { data: activities, isLoading } = useTeamActivity({
    activityType: filterType !== "all" ? filterType : undefined,
    limit,
  });

  const activityTypes = [
    { value: "all", label: "All Activities" },
    { value: "call", label: "📞 Calls" },
    { value: "email", label: "📧 Emails" },
    { value: "whatsapp", label: "💬 WhatsApp" },
    { value: "note", label: "📝 Notes" },
    { value: "meeting", label: "🤝 Meetings" },
  ];

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Team Activity
        </CardTitle>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px] h-8">
            <Filter className="h-3 w-3 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  onViewLead={() =>
                    navigate(`/crm/admin/leads/${activity.lead_id}`)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ActivityItem({
  activity,
  onViewLead,
}: {
  activity: TeamActivity;
  onViewLead: () => void;
}) {
  const callOutcome = formatCallOutcome(activity.outcome);

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs bg-primary/10">
          {activity.agent?.first_name?.[0] || "?"}
          {activity.agent?.last_name?.[0] || ""}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              <span className="mr-1">
                {getActivityTypeIcon(activity.activity_type)}
              </span>
              {activity.agent?.first_name} {activity.agent?.last_name}
              <span className="text-muted-foreground font-normal mx-1">→</span>
              {activity.lead ? (
                <span className="text-primary">
                  {activity.lead.first_name} {activity.lead.last_name}
                  <span className="ml-1 opacity-70">
                    {getLanguageFlag(activity.lead.language)}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground italic">
                  Unknown lead
                </span>
              )}
            </p>

            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getActivityTypeLabel(activity.activity_type)}
              </Badge>

              {activity.outcome && (
                <span className={`text-xs ${callOutcome.color}`}>
                  {callOutcome.label}
                </span>
              )}

              {activity.call_duration && (
                <span className="text-xs text-muted-foreground">
                  {Math.floor(activity.call_duration / 60)}m{" "}
                  {activity.call_duration % 60}s
                </span>
              )}
            </div>

            {activity.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {activity.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
              })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onViewLead}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
