import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, FileText, Send, ArrowUpRight, TrendingUp,
  Calendar, Shield, Calculator, GraduationCap, Megaphone,
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
    { label: "Active Clients", value: stats.totalClients, icon: Users, href: "/portal/advisor/clients", filled: true },
    { label: "YTD Revenue", value: `$${(stats.ytdRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, href: "/portal/advisor/performance", filled: false, tint: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "Active Policies", value: stats.activePolicies, icon: FileText, href: "/portal/advisor/policies", filled: false, tint: "bg-blue-500/10 border-blue-500/20" },
    { label: "Pending Invites", value: stats.pendingInvitations, icon: Send, href: "/portal/advisor/invite", filled: false, tint: "bg-violet-500/10 border-violet-500/20" },
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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-serif">
          Welcome back, {portalUser?.first_name}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Here's your performance dashboard and latest updates.</p>
      </div>

      {/* Rank Banner */}
      {rank && (
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${rank.badge_color}20, ${rank.badge_color}08)`, border: `1px solid ${rank.badge_color}30` }}>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Rank</p>
            <p className="text-xl font-bold text-foreground mt-0.5">{rank.rank_name}</p>
          </div>
          <Badge className="text-sm px-3 py-1 rounded-full" style={{ backgroundColor: rank.badge_color, color: "#fff" }}>
            {rank.compensation_level_percent}% Comp
          </Badge>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link key={card.label} to={card.href}>
            <div
              className={cn(
                "group rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]",
                card.filled
                  ? "bg-primary text-primary-foreground"
                  : `${card.tint} border`
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  card.filled ? "bg-primary-foreground/20" : "bg-card"
                )}>
                  <card.icon className={cn("h-5 w-5", card.filled ? "text-primary-foreground" : "text-foreground")} />
                </div>
                <ArrowUpRight className={cn(
                  "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                  card.filled ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>
              <p className={cn("text-3xl font-bold", card.filled ? "" : "text-foreground")}>
                {loading ? "—" : card.value}
              </p>
              <p className={cn("text-sm mt-1", card.filled ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {card.label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 hover:scale-105 cursor-pointer">
                <action.icon className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent News */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-foreground">Latest Carrier News</h2>
            <Link to="/portal/advisor/news">
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {recentNews.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent news</p>
            ) : recentNews.map((n: any) => (
              <div key={n.id} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.content}</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                  {n.carriers?.carrier_name} · {n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
            <Link to="/portal/advisor/schedule">
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                View Calendar <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="px-6 pb-6 space-y-3">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming events</p>
            ) : upcomingEvents.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.event_date).toLocaleDateString()} at {e.event_time}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs capitalize rounded-full">{e.event_type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
