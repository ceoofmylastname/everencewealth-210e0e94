import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, ClipboardList, AlertCircle, Activity, Clock, Eye, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminStats } from "@/hooks/useAdminLeads";
import { useTodayActivityCount } from "@/hooks/useTeamActivity";
import { TeamActivityFeed } from "@/components/crm/admin/TeamActivityFeed";
import { AgentCapacityOverview } from "@/components/crm/admin/AgentCapacityOverview";

export default function CrmDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useAdminStats();
  const { data: todayCount } = useTodayActivityCount();

  const statCards = [
    {
      title: "Total Agents",
      value: stats?.totalAgents ?? 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Agents",
      value: stats?.activeAgents ?? 0,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Leads",
      value: stats?.totalLeads ?? 0,
      icon: ClipboardList,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Unclaimed Leads",
      value: stats?.unclaimed ?? 0,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      highlight: (stats?.unclaimed ?? 0) > 0,
    },
    {
      title: "SLA Breaches",
      value: stats?.slaBreaches ?? 0,
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-100",
      highlight: (stats?.slaBreaches ?? 0) > 0,
    },
    {
      title: "Today's Activity",
      value: todayCount ?? 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your CRM system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className={stat.highlight ? "border-orange-300 bg-orange-50/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/crm/admin/leads")} className="gap-2">
            <Eye className="h-4 w-4" />
            View Unclaimed Leads
          </Button>
          <Button variant="outline" onClick={() => navigate("/crm/admin/agents")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Manage Agents
          </Button>
        </CardContent>
      </Card>

      {/* Activity Feed + Capacity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamActivityFeed limit={15} />
        <AgentCapacityOverview />
      </div>
    </div>
  );
}
