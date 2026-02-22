import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, FileText, Send, ArrowUpRight, TrendingUp,
  Calendar, Shield, Calculator, GraduationCap, Megaphone,
  Wrench, ClipboardList,
} from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";

// Enhanced card classes
const CARD = "bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] transition-all duration-200";
const CARD_HOVER = `${CARD} hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px]`;

interface DashboardStats {
  totalClients: number;
  activePolicies: number;
  ytdRevenue: number;
  pendingInvitations: number;
}


interface RecentClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

function getHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdvisorDashboard() {
  const { portalUser } = usePortalAuth();
  const [stats, setStats] = useState<DashboardStats>({ totalClients: 0, activePolicies: 0, ytdRevenue: 0, pendingInvitations: 0 });
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<RecentClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    loadDashboard();
  }, [portalUser]);

  async function loadDashboard() {
    try {
      const { data: advisor } = await supabase.from("advisors").select("id").eq("portal_user_id", portalUser!.id).maybeSingle();
      if (!advisor) { setLoading(false); return; }

      const currentYear = new Date().getFullYear();
      const today = new Date().toISOString().split("T")[0];

      const [clients, policies, invitations, perfData, news, events, recentClientsRes] = await Promise.all([
        supabase.from("portal_users").select("id", { count: "exact", head: true }).eq("advisor_id", portalUser!.id).eq("role", "client"),
        supabase.from("policies").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("policy_status", "active"),
        supabase.from("client_invitations").select("id", { count: "exact", head: true }).eq("advisor_id", advisor.id).eq("status", "pending"),
        supabase.from("advisor_sales").select("annual_premium").eq("advisor_id", advisor.id).gte("submitted_at", `${currentYear}-01-01T00:00:00`),
        supabase.from("carrier_news").select("*, carriers(carrier_name)").eq("status", "published").order("published_at", { ascending: false }).limit(3),
        supabase.from("schedule_events").select("*, creator:portal_users!schedule_events_created_by_fkey(role)").gte("event_date", today).order("event_date", { ascending: true }).limit(3),
        supabase.from("portal_users").select("id, first_name, last_name, email, avatar_url, created_at").eq("advisor_id", portalUser!.id).eq("role", "client").order("created_at", { ascending: false }).limit(5),
      ]);

      const ytdRevenue = perfData.data?.reduce((sum, r) => sum + (Number(r.annual_premium) || 0), 0) ?? 0;
      setStats({ totalClients: clients.count ?? 0, activePolicies: policies.count ?? 0, ytdRevenue, pendingInvitations: invitations.count ?? 0 });

      setRecentNews(news.data ?? []);
      const filteredEvents = (events.data ?? []).filter(
        (e: any) => e.creator?.role === 'admin' || e.created_by === portalUser?.id
      );
      setUpcomingEvents(filteredEvents);
      setRecentClients((recentClientsRes.data as RecentClient[]) ?? []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { label: "Active Clients", value: stats.totalClients, icon: Users, href: "/portal/advisor/clients", color: BRAND_GREEN },
    { label: "YTD Revenue", value: `$${(stats.ytdRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, href: "/portal/advisor/performance", color: "#C9A84C" },
    { label: "Active Policies", value: stats.activePolicies, icon: FileText, href: "/portal/advisor/policies", color: BRAND_GREEN },
    { label: "Pending Invites", value: stats.pendingInvitations, icon: Send, href: "/portal/advisor/invite", color: "#6366F1" },
  ];

  const quickActions = [
    { label: "Client Analysis", icon: ClipboardList, href: "/portal/advisor/cna" },
    { label: "Carriers", icon: Shield, href: "/portal/advisor/carriers" },
    { label: "Quoting Tools", icon: Wrench, href: "/portal/advisor/tools" },
    { label: "Calculators", icon: Calculator, href: "/portal/advisor/tools" },
    { label: "Training", icon: GraduationCap, href: "/portal/advisor/training" },
    { label: "Marketing", icon: Megaphone, href: "/portal/advisor/marketing" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getHour()}, {portalUser?.first_name} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Here's your performance overview for today.</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#F0F5F3", color: BRAND_GREEN }}>
          Advisor Portal
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${CARD} p-4 space-y-3`}>
                <Skeleton className="h-8 w-8 sm:h-11 sm:w-11 rounded-lg" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          : statCards.map((card) => (
              <Link key={card.label} to={card.href}>
                <div className={`group ${CARD_HOVER} p-3 sm:p-5 cursor-pointer`}>
                  <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                      <card.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: card.color }} />
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <p className="text-xl sm:text-3xl font-extrabold text-gray-900">{card.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{card.label}</p>
                </div>
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <div className={`${CARD} p-3 sm:p-5`}>
        <h2 className="text-sm sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-[#F0F5F3] transition-all cursor-pointer group border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:translate-y-[-1px] hover:border-gray-200">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                  <action.icon className="h-4 w-4 transition-transform group-hover:scale-110" style={{ color: BRAND_GREEN }} />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 text-center">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
        {/* Left 2/3: News + Events */}
        <div className="lg:col-span-2 space-y-5">
          {/* Recent News */}
          <div className={CARD}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Latest Carrier News</h2>
              <Link to="/portal/advisor/news" className="text-xs font-semibold flex items-center gap-1 text-[#1A4D3E] hover:text-[#143d30] hover:underline">
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))
              ) : recentNews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No recent news</p>
              ) : recentNews.map((n: any) => (
                <div key={n.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{n.content}</p>
                  <p className="text-xs mt-2 flex items-center gap-1.5 text-gray-400">
                    <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: GOLD }} />
                    {n.carriers?.carrier_name} · {n.published_at ? new Date(n.published_at).toLocaleDateString() : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className={CARD}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
              <Link to="/portal/advisor/schedule" className="text-xs font-semibold flex items-center gap-1 text-[#1A4D3E] hover:text-[#143d30] hover:underline">
                View Calendar <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-1.5 flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                  </div>
                ))
              ) : upcomingEvents.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming events</p>
              ) : upcomingEvents.map((e: any) => {
                const isAdmin = e.creator?.role === "admin";
                return (
                  <div key={e.id} className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border-l-4 ${isAdmin ? "border-l-amber-400" : "border-l-emerald-400"}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                        <Calendar className="h-4 w-4" style={{ color: BRAND_GREEN }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{e.title}</p>
                        <p className="text-xs text-gray-500">{new Date(e.event_date).toLocaleDateString()} at {e.event_time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isAdmin ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                        {isAdmin ? "Admin" : "Agent"}
                      </span>
                      <span className="text-xs capitalize rounded-full px-2.5 py-0.5 font-medium bg-gray-100 text-gray-600">{e.event_type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1/3: Recent Clients */}
        <div className={CARD}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Clients</h2>
            <Link to="/portal/advisor/clients" className="text-xs font-semibold text-[#1A4D3E] hover:text-[#143d30] hover:underline">
              View all
            </Link>
          </div>
          <div className="p-5 space-y-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1.5 flex-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div>
                </div>
              ))
            ) : recentClients.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No clients yet</p>
            ) : recentClients.map((c) => (
              <Link key={c.id} to={`/portal/advisor/clients/${c.id}`}>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {c.avatar_url ? (
                    <img src={c.avatar_url} alt={c.first_name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: BRAND_GREEN }}>
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.email}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
