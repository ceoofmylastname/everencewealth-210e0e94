import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, FileText, FolderOpen, Send, ArrowRight, TrendingUp,
  Calendar, Bell, Shield, Calculator, GraduationCap, Megaphone,
  Newspaper, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalClients: number;
  activePolicies: number;
  ytdRevenue: number;
  pendingInvitations: number;
}

interface RankInfo {
  rank_name: string;
  compensation_level_percent: number;
  badge_color: string;
}

export default function AdvisorDashboard() {
  const { portalUser } = usePortalAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0, activePolicies: 0, ytdRevenue: 0, pendingInvitations: 0,
  });
  const [rank, setRank] = useState<RankInfo | null>(null);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    loadDashboard();
  }, [portalUser]);

  async function loadDashboard() {
    try {
      const { data: advisor } = await supabase
        .from("advisors")
        .select("id")
        .eq("portal_user_id", portalUser!.id)
        .maybeSingle();

      if (!advisor) { setLoading(false); return; }

      const currentYear = new Date().getFullYear();
      const today = new Date().toISOString().split("T")[0];

      const [clients, policies, invitations, perfData, ranks, news, events] = await Promise.all([
        supabase.from("portal_users").select("id", { count: "exact", head: true }).eq("advisor_id", portalUser!.id).eq("role", "client"),
        supabase.from("policies").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("policy_status", "active"),
        supabase.from("client_invitations").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("status", "pending"),
        supabase.from("advisor_performance").select("revenue").eq("advisor_id", advisor.id).gte("entry_date", `${currentYear}-01-01`),
        supabase.from("advisor_rank_config").select("*").order("rank_order", { ascending: false }),
        supabase.from("carrier_news").select("*, carriers(carrier_name)").eq("status", "published").order("published_at", { ascending: false }).limit(3),
        supabase.from("schedule_events").select("*").gte("event_date", today).order("event_date", { ascending: true }).limit(3),
      ]);

      const ytdRevenue = perfData.data?.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0) ?? 0;

      setStats({
        totalClients: clients.count ?? 0,
        activePolicies: policies.count ?? 0,
        ytdRevenue,
        pendingInvitations: invitations.count ?? 0,
      });

      // Determine rank
      if (ranks.data) {
        const currentRank = ranks.data.find(r => ytdRevenue >= Number(r.min_ytd_premium)) || ranks.data[ranks.data.length - 1];
        if (currentRank) {
          setRank({
            rank_name: currentRank.rank_name,
            compensation_level_percent: Number(currentRank.compensation_level_percent),
            badge_color: currentRank.badge_color || "#3b82f6",
          });
        }
      }

      setRecentNews(news.data ?? []);
      setUpcomingEvents(events.data ?? []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Active Clients", value: stats.totalClients, icon: Users, href: "/portal/advisor/clients", color: "text-primary" },
    { label: "YTD Revenue", value: `$${(stats.ytdRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, href: "/portal/advisor/performance", color: "text-emerald-600" },
    { label: "Active Policies", value: stats.activePolicies, icon: FileText, href: "/portal/advisor/policies", color: "text-blue-600" },
    { label: "Pending Invites", value: stats.pendingInvitations, icon: Send, href: "/portal/advisor/invite", color: "text-violet-600" },
  ];

  const quickActions = [
    { label: "Carriers", icon: Shield, href: "/portal/advisor/carriers" },
    { label: "Quoting Tools", icon: Wrench, href: "/portal/advisor/tools" },
    { label: "Calculators", icon: Calculator, href: "/portal/advisor/tools" },
    { label: "Training", icon: GraduationCap, href: "/portal/advisor/training" },
    { label: "Marketing", icon: Megaphone, href: "/portal/advisor/marketing" },
    { label: "Schedule", icon: Calendar, href: "/portal/advisor/schedule" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
          Welcome back, {portalUser?.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">Here's your performance dashboard and latest updates.</p>
      </div>

      {/* Rank Banner */}
      {rank && (
        <Card className="border-none" style={{ background: `linear-gradient(135deg, ${rank.badge_color}15, ${rank.badge_color}05)` }}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Rank</p>
              <p className="text-lg font-bold text-foreground">{rank.rank_name}</p>
            </div>
            <Badge style={{ backgroundColor: rank.badge_color, color: "#fff" }}>
              {rank.compensation_level_percent}% Comp
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={cn("h-5 w-5", card.color)} />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "—" : typeof card.value === "number" ? card.value : card.value}
                </p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <Button variant="outline" className="w-full h-auto flex-col gap-2 py-4">
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Latest Carrier News</CardTitle>
            <Link to="/portal/advisor/news">
              <Button variant="ghost" size="sm">View All <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentNews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent news</p>
            ) : recentNews.map((n: any) => (
              <div key={n.id} className="border-b border-border pb-3 last:border-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {n.carriers?.carrier_name} · {n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
            <Link to="/portal/advisor/schedule">
              <Button variant="ghost" size="sm">View Calendar <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            ) : upcomingEvents.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.event_date).toLocaleDateString()} at {e.event_time}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs capitalize">{e.event_type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
