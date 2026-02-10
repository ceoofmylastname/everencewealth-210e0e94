import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { useAllSalestrailCalls } from "@/hooks/useAllSalestrailCalls";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  getStatusBadgeClass,
  formatStatus,
  getLanguageFlag,
  PRIORITY_CONFIG,
  getExtendedUrgency,
  EXTENDED_URGENCY_STYLES,
  REMINDER_TYPE_CONFIG,
} from "@/lib/crm-conditional-styles";

export default function AgentDashboard() {
  // Get current agent
  const { data: session } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    },
  });

  const agentId = session?.user?.id || null;

  // Fetch agent profile
  const { data: agent } = useQuery({
    queryKey: ["crm-agent-profile", agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const { data } = await supabase
        .from("crm_agents")
        .select("*")
        .eq("id", agentId)
        .single();
      return data;
    },
    enabled: !!agentId,
  });

  // Fetch leads stats
  const { data: leads = [] } = useQuery({
    queryKey: ["agent-leads-stats", agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data } = await supabase
        .from("crm_leads")
        .select("*")
        .eq("assigned_agent_id", agentId)
        .eq("archived", false);
      return data || [];
    },
    enabled: !!agentId,
  });

  // Fetch reminders
  const { data: reminders = [] } = useQuery({
    queryKey: ["agent-reminders", agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data } = await supabase
        .from("crm_reminders")
        .select("*, crm_leads(first_name, last_name)")
        .eq("agent_id", agentId)
        .eq("is_completed", false)
        .order("reminder_datetime", { ascending: true })
        .limit(5);
      return data || [];
    },
    enabled: !!agentId,
  });

  // Fetch Salestrail calls for this agent
  const { calls: salestrailCalls, stats: callStats, isLoading: callsLoading } = useAllSalestrailCalls({
    agentId: agentId || undefined,
    enabled: !!agentId,
  });

  // Calculate stats
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.lead_status === "new").length,
    urgentLeads: leads.filter((l) => l.lead_priority === "urgent").length,
    needsFollowUp: leads.filter(
      (l) => l.days_since_last_contact !== null && l.days_since_last_contact > 3
    ).length,
    closedWon: leads.filter((l) => l.lead_status === "closed_won").length,
  };

  // Recent leads
  const recentLeads = [...leads]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  // Priority leads
  const priorityLeads = leads
    .filter(
      (l) => l.lead_priority === "urgent" || l.lead_priority === "high"
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {agent?.first_name || "Agent"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your leads today.
          </p>
        </div>
        <Link to="/crm/agent/leads">
          <Button>
            <Users className="w-4 h-4 mr-2" />
            View All Leads
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.totalLeads}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.newLeads > 0 && "border-blue-500")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New Leads</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.newLeads}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(stats.urgentLeads > 0 && "border-red-500")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.urgentLeads}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed Won</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats.closedWon}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500" />
              Priority Leads
            </CardTitle>
            <Link to="/crm/agent/leads?priority=urgent,high">
              <Button variant="ghost" size="sm">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {priorityLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No priority leads at the moment 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {priorityLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/crm/agent/leads/${lead.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          lead.lead_priority === "urgent"
                            ? "bg-red-500 animate-pulse"
                            : "bg-orange-500"
                        )}
                      />
                      <div>
                        <p className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getLanguageFlag(lead.language)} • {lead.lead_segment}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(lead.lead_status)}
                    >
                      {formatStatus(lead.lead_status)}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Upcoming Reminders
            </CardTitle>
            <Link to="/crm/agent/calendar">
              <Button variant="ghost" size="sm">
                Calendar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">
                No upcoming reminders
              </p>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder: any) => {
                  const urgency = getExtendedUrgency(reminder.reminder_datetime);
                  const styles = EXTENDED_URGENCY_STYLES[urgency];
                  const typeConfig = REMINDER_TYPE_CONFIG[reminder.reminder_type as keyof typeof REMINDER_TYPE_CONFIG] || {
                    icon: "🔔",
                    label: reminder.reminder_type,
                    color: "bg-gray-100 text-gray-700",
                  };

                  return (
                    <Link
                      key={reminder.id}
                      to="/crm/agent/calendar"
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border-l-4 transition-all hover:shadow-md",
                        styles.bg,
                        urgency === "overdue" && "animate-pulse"
                      )}
                      style={{ borderLeftColor: styles.hex }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                            styles.badge
                          )}
                        >
                          {typeConfig.icon}
                        </div>
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {reminder.crm_leads?.first_name}{" "}
                            {reminder.crm_leads?.last_name} •{" "}
                            {formatDistanceToNow(new Date(reminder.reminder_datetime), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(styles.badge, "text-xs")}
                      >
                        {typeConfig.label}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Recent Leads</CardTitle>
          <Link to="/crm/agent/leads">
            <Button variant="ghost" size="sm">
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              No leads assigned yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  to={`/crm/agent/leads/${lead.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {lead.first_name[0]}
                      {lead.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getLanguageFlag(lead.language)} • {lead.lead_source} •{" "}
                        {formatDistanceToNow(new Date(lead.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getStatusBadgeClass(lead.lead_status)}
                    >
                      {formatStatus(lead.lead_status)}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Call Activity
            {callStats.total > 0 && (
              <Badge variant="secondary" className="ml-1">{callStats.total}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <PhoneOutgoing className="w-3.5 h-3.5 text-green-600" />
              {callStats.outbound}
            </span>
            <span className="flex items-center gap-1">
              <PhoneIncoming className="w-3.5 h-3.5 text-blue-600" />
              {callStats.inbound}
            </span>
            <span className="flex items-center gap-1">
              <PhoneMissed className="w-3.5 h-3.5 text-amber-600" />
              {callStats.missed}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {callsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : salestrailCalls.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">
              No calls recorded yet. Calls are logged automatically via Salestrail.
            </p>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {salestrailCalls.slice(0, 20).map((call) => {
                  const isInbound = call.call_direction === "inbound";
                  const isAnswered = call.call_answered;
                  const leadName = call.lead
                    ? `${call.lead.first_name} ${call.lead.last_name}`
                    : "Unknown Lead";
                  const durationMins = call.call_duration ? Math.floor(call.call_duration / 60) : 0;
                  const durationSecs = call.call_duration ? call.call_duration % 60 : 0;
                  const durationStr = call.call_duration
                    ? durationMins > 0
                      ? `${durationMins}m ${durationSecs}s`
                      : `${durationSecs}s`
                    : null;

                  return (
                    <div
                      key={call.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isAnswered
                            ? isInbound
                              ? "bg-blue-100 text-blue-600"
                              : "bg-green-100 text-green-600"
                            : "bg-amber-100 text-amber-600"
                        )}
                      >
                        {isAnswered ? (
                          isInbound ? (
                            <PhoneIncoming className="w-4 h-4" />
                          ) : (
                            <PhoneOutgoing className="w-4 h-4" />
                          )
                        ) : (
                          <PhoneMissed className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{leadName}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              isInbound ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                            )}
                          >
                            {isInbound ? "In" : "Out"}
                          </Badge>
                          {!isAnswered && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700">
                              Missed
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                          {durationStr && ` · ${durationStr}`}
                        </p>
                      </div>
                      {call.salestrail_recording_url && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          🎙️
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
