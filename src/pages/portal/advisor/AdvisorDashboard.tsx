import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, FileText, Send, ArrowUpRight, TrendingUp,
  Calendar, Shield, Calculator, GraduationCap, Megaphone,
  Wrench, User,
} from "lucide-react";

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

interface RecentClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

export default function AdvisorDashboard() {
  const { portalUser } = usePortalAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0, activePolicies: 0, ytdRevenue: 0, pendingInvitations: 0,
  });
  const [rank, setRank] = useState<RankInfo | null>(null);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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

      const [clients, policies, invitations, perfData, ranks, news, events, recentClientsRes] = await Promise.all([
        supabase.from("portal_users").select("id", { count: "exact", head: true }).eq("advisor_id", portalUser!.id).eq("role", "client"),
        supabase.from("policies").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("policy_status", "active"),
        supabase.from("client_invitations").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("status", "pending"),
        supabase.from("advisor_performance").select("revenue").eq("advisor_id", advisor.id).gte("entry_date", `${currentYear}-01-01`),
        supabase.from("advisor_rank_config").select("*").order("rank_order", { ascending: false }),
        supabase.from("carrier_news").select("*, carriers(carrier_name)").eq("status", "published").order("published_at", { ascending: false }).limit(3),
        supabase.from("schedule_events").select("*").gte("event_date", today).order("event_date", { ascending: true }).limit(3),
        supabase.from("portal_users").select("id, first_name, last_name, email, avatar_url, created_at").eq("advisor_id", portalUser!.id).eq("role", "client").order("created_at", { ascending: false }).limit(5),
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
      setRecentClients((recentClientsRes.data as RecentClient[]) ?? []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const gold = "hsla(51, 78%, 65%, 1)";
  const goldGlow = "0 0 24px hsla(51, 78%, 65%, 0.45), 0 0 48px hsla(51, 78%, 65%, 0.15)";
  const goldGlowHover = "0 0 32px hsla(51, 78%, 65%, 0.65), 0 0 70px hsla(51, 78%, 65%, 0.25)";

  const statCards = [
    { label: "Active Clients", value: stats.totalClients, icon: Users, href: "/portal/advisor/clients" },
    { label: "YTD Revenue", value: `$${(stats.ytdRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, href: "/portal/advisor/performance" },
    { label: "Active Policies", value: stats.activePolicies, icon: FileText, href: "/portal/advisor/policies" },
    { label: "Pending Invites", value: stats.pendingInvitations, icon: Send, href: "/portal/advisor/invite" },
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
    <div className="relative min-h-screen -m-6 p-6" style={{ background: "#020806" }}>
      {/* Mesh orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsla(51,78%,65%,0.3) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsla(160,48%,21%,0.6) 0%, transparent 70%)", filter: "blur(70px)" }} />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Welcome Header */}
        <div>
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border text-xs font-medium tracking-widest uppercase"
            style={{ borderColor: "hsla(51,78%,65%,0.3)", color: gold, background: "hsla(51,78%,65%,0.08)" }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: gold }} />
            Advisor Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: "var(--font-hero, serif)" }}>
            Welcome back, {portalUser?.first_name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsla(51,78%,65%,0.7)" }}>
            Here's your performance dashboard and latest updates.
          </p>
        </div>

        {/* Rank Banner */}
        {rank && (
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between"
            style={{ borderLeft: `3px solid ${rank.badge_color}`, borderColor: "hsla(0,0%,100%,0.08)" }}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "hsla(51,78%,65%,0.6)" }}>Current Rank</p>
              <p className="text-xl font-bold text-white mt-0.5">{rank.rank_name}</p>
            </div>
            <Badge className="text-sm px-3 py-1 rounded-full border-0" style={{ backgroundColor: `${rank.badge_color}30`, color: rank.badge_color }}>
              {rank.compensation_level_percent}% Comp
            </Badge>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
                  <div className="h-8 w-16 rounded bg-white/5 animate-pulse" />
                  <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                </div>
              ))
            : statCards.map((card, i) => (
                <Link key={card.label} to={card.href} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-in">
                  <div
                    className="group glass-card rounded-2xl p-6 transition-all duration-300 cursor-pointer"
                    style={{
                      borderTop: `1px solid hsla(51,78%,65%,0.3)`,
                      boxShadow: hoveredCard === card.label ? goldGlowHover : "none",
                      transform: hoveredCard === card.label ? "scale(1.02)" : "scale(1)",
                    }}
                    onMouseEnter={() => setHoveredCard(card.label)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{ background: "hsla(51,78%,65%,0.12)", border: "1px solid hsla(51,78%,65%,0.2)" }}>
                        <card.icon className="h-5 w-5" style={{ color: gold }} />
                      </div>
                      <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: gold }} />
                    </div>
                    <p className="text-3xl font-black" style={{ color: gold }}>{card.value}</p>
                    <p className="text-sm mt-1 text-white/60">{card.label}</p>
                  </div>
                </Link>
              ))}
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <div
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 cursor-pointer group"
                  style={{ background: "hsla(0,0%,100%,0.04)", border: "1px solid hsla(0,0%,100%,0.07)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.border = "1px solid hsla(51,78%,65%,0.4)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 16px hsla(51,78%,65%,0.15)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.border = "1px solid hsla(0,0%,100%,0.07)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <action.icon className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color: gold }} />
                  <span className="text-xs font-medium text-white/70 group-hover:text-white transition-colors">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2/3: News + Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent News */}
            <div className="glass-card rounded-2xl">
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-lg font-semibold text-white">Latest Carrier News</h2>
                <Link to="/portal/advisor/news" className="text-xs font-medium flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: gold }}>
                  View All <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="px-6 pb-6 space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: "hsla(0,0%,100%,0.04)" }}>
                      <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
                      <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
                      <div className="h-3 w-1/3 rounded bg-white/5 animate-pulse" />
                    </div>
                  ))
                ) : recentNews.length === 0 ? (
                  <p className="text-sm text-white/40 py-4 text-center">No recent news</p>
                ) : recentNews.map((n: any) => (
                  <div key={n.id} className="p-3 rounded-xl transition-colors"
                    style={{ background: "hsla(0,0%,100%,0.04)", border: "1px solid hsla(0,0%,100%,0.06)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.07)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.04)"}
                  >
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs mt-1 line-clamp-2 text-white/50">{n.content}</p>
                    <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: "hsla(51,78%,65%,0.7)" }}>
                      <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: gold }} />
                      {n.carriers?.carrier_name} · {n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="glass-card rounded-2xl">
              <div className="flex items-center justify-between p-6 pb-4">
                <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                <Link to="/portal/advisor/schedule" className="text-xs font-medium flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: gold }}>
                  View Calendar <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="px-6 pb-6 space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsla(0,0%,100%,0.04)" }}>
                      <div className="h-9 w-9 rounded-lg bg-white/5 animate-pulse" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-1/2 rounded bg-white/5 animate-pulse" />
                        <div className="h-3 w-1/3 rounded bg-white/5 animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-sm text-white/40 py-4 text-center">No upcoming events</p>
                ) : upcomingEvents.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{ background: "hsla(0,0%,100%,0.04)", border: "1px solid hsla(0,0%,100%,0.06)" }}
                    onMouseEnter={ev => (ev.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.07)"}
                    onMouseLeave={ev => (ev.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.04)"}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center"
                        style={{ background: "hsla(51,78%,65%,0.12)", border: "1px solid hsla(51,78%,65%,0.2)" }}>
                        <Calendar className="h-4 w-4" style={{ color: gold }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{e.title}</p>
                        <p className="text-xs text-white/50">
                          {new Date(e.event_date).toLocaleDateString()} at {e.event_time}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs capitalize rounded-full px-2.5 py-1 border font-medium"
                      style={{ borderColor: "hsla(51,78%,65%,0.35)", color: gold, background: "hsla(51,78%,65%,0.08)" }}>
                      {e.event_type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1/3: Recent Clients */}
          <div className="glass-card rounded-2xl">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-semibold text-white">Recent Clients</h2>
              <Link to="/portal/advisor/clients" className="text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: gold }}>
                View all
              </Link>
            </div>
            <div className="px-6 pb-6 space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "hsla(0,0%,100%,0.04)" }}>
                    <div className="h-9 w-9 rounded-full bg-white/5 animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                      <div className="h-3 w-32 rounded bg-white/5 animate-pulse" />
                    </div>
                  </div>
                ))
              ) : recentClients.length === 0 ? (
                <p className="text-sm text-white/40 py-4 text-center">No clients yet</p>
              ) : recentClients.map((c) => (
                <Link key={c.id} to={`/portal/advisor/clients/${c.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{ background: "hsla(0,0%,100%,0.04)", border: "1px solid hsla(0,0%,100%,0.06)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.07)"}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.04)"}
                  >
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt={c.first_name} className="h-9 w-9 rounded-full object-cover ring-1"
                        style={{ ringColor: gold } as any} />
                    ) : (
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "hsla(51,78%,65%,0.15)", color: gold, border: "1px solid hsla(51,78%,65%,0.3)" }}>
                        {c.first_name[0]}{c.last_name[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{c.first_name} {c.last_name}</p>
                      <p className="text-xs" style={{ color: "hsla(51,78%,65%,0.6)" }}>{c.email}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
