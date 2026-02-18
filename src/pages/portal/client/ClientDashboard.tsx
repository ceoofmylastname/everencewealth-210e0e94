import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { FileText, FolderOpen, ArrowUpRight, MessageCircle, Mail, Phone, User } from "lucide-react";

interface PolicySummary {
  id: string;
  carrier_name: string;
  policy_number: string;
  product_type: string;
  policy_status: string;
  death_benefit: number | null;
  cash_value: number | null;
}

interface AdvisorInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  photo_url: string | null;
}

export default function ClientDashboard() {
  const { portalUser } = usePortalAuth();
  const [policies, setPolicies] = useState<PolicySummary[]>([]);
  const [docCount, setDocCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [advisor, setAdvisor] = useState<AdvisorInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [msgHovered, setMsgHovered] = useState(false);

  useEffect(() => {
    if (!portalUser) return;
    loadData();
  }, [portalUser]);

  async function loadData() {
    try {
      const [policiesRes, docsRes, advisorRes] = await Promise.all([
        supabase.from("policies").select("id, carrier_name, policy_number, product_type, policy_status, death_benefit, cash_value").eq("client_id", portalUser!.id).order("created_at", { ascending: false }).limit(5),
        supabase.from("portal_documents").select("id", { count: "exact", head: true }).eq("client_id", portalUser!.id).eq("is_client_visible", true),
        portalUser!.advisor_id
          ? supabase.from("advisors").select("first_name, last_name, email, phone, title, photo_url").eq("portal_user_id", portalUser!.advisor_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      let unreadCount = 0;
      try {
        const msgsRes = await (supabase.from("portal_messages" as any).select("id", { count: "exact", head: true }) as any).eq("recipient_id", portalUser!.id).eq("is_read", false);
        unreadCount = msgsRes.count ?? 0;
      } catch {}

      setPolicies((policiesRes.data as PolicySummary[]) ?? []);
      setDocCount(docsRes.count ?? 0);
      setMsgCount(unreadCount);
      setAdvisor(advisorRes.data as AdvisorInfo | null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const gold = "hsla(51, 78%, 65%, 1)";
  const goldGlowHover = "0 0 32px hsla(51, 78%, 65%, 0.55), 0 0 64px hsla(51, 78%, 65%, 0.2)";

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return gold;
      case "pending": return "hsla(38,92%,60%,1)";
      case "lapsed": return "hsla(0,84%,60%,1)";
      default: return "hsla(0,0%,60%,1)";
    }
  };

  const statCards = [
    { label: "Active Policies", value: policies.length, icon: FileText, href: "/portal/client/policies" },
    { label: "Documents", value: docCount, icon: FolderOpen, href: "/portal/client/documents" },
    { label: "Unread Messages", value: msgCount, icon: MessageCircle, href: "/portal/client/messages" },
  ];

  return (
    <div className="relative min-h-screen -m-6 p-6" style={{ background: "#020806" }}>
      {/* Mesh orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-[450px] w-[450px] rounded-full opacity-35"
          style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.55) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-1/2 -right-32 h-[380px] w-[380px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsla(51,78%,65%,0.25) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute -bottom-16 left-1/4 h-[300px] w-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsla(160,48%,21%,0.5) 0%, transparent 70%)", filter: "blur(70px)" }} />
      </div>

      <div className="relative z-10 space-y-8">
        {/* Welcome Banner */}
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border text-xs font-medium tracking-widest uppercase"
            style={{ borderColor: "hsla(51,78%,65%,0.3)", color: gold, background: "hsla(51,78%,65%,0.08)" }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: gold }} />
            Welcome Back
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white" style={{ fontFamily: "var(--font-hero, serif)" }}>
            {portalUser?.first_name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "hsla(51,78%,65%,0.7)" }}>
            Your personal insurance portal — everything in one place.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
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
                      borderTop: "1px solid hsla(51,78%,65%,0.3)",
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

        {/* Two-column: Policies + Advisor Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Policies — 2/3 */}
          <div className="lg:col-span-2 glass-card rounded-2xl">
            <div className="flex items-center justify-between p-6 pb-4">
              <h2 className="text-lg font-semibold text-white">Recent Policies</h2>
              <Link to="/portal/client/policies" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: gold }}>
                View all
              </Link>
            </div>
            <div className="px-6 pb-6">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "hsla(0,0%,100%,0.04)" }}>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-white/5 animate-pulse" />
                        <div className="space-y-1.5">
                          <div className="h-4 w-28 rounded bg-white/5 animate-pulse" />
                          <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
                        </div>
                      </div>
                      <div className="h-4 w-20 rounded bg-white/5 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : policies.length === 0 ? (
                <p className="text-white/40 text-center py-10">No policies yet.</p>
              ) : (
                <div className="space-y-3">
                  {policies.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-xl transition-colors"
                      style={{ background: "hsla(0,0%,100%,0.04)", border: "1px solid hsla(0,0%,100%,0.06)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.07)"}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "hsla(0,0%,100%,0.04)"}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg flex items-center justify-center"
                          style={{ background: "hsla(51,78%,65%,0.12)", border: "1px solid hsla(51,78%,65%,0.2)" }}>
                          <FileText className="h-4 w-4" style={{ color: gold }} />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{p.carrier_name}</p>
                          <p className="text-xs text-white/50">#{p.policy_number} · {p.product_type.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-xs text-white/40">Benefit</p>
                          <p className="text-sm font-semibold text-white">{fmt(p.death_benefit)}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: statusColor(p.policy_status) }} />
                          <span className="text-xs text-white/50 capitalize">{p.policy_status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Advisor Sidebar — 1/3 */}
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Advisor</h2>
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-white/5 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 rounded bg-white/5 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
              </div>
            ) : advisor ? (
              <>
                <div className="flex items-center gap-4 mb-5">
                  {advisor.photo_url ? (
                    <img src={advisor.photo_url} alt={advisor.first_name} className="h-14 w-14 rounded-full object-cover"
                      style={{ border: `2px solid hsla(51,78%,65%,0.4)` }} />
                  ) : (
                    <div className="h-14 w-14 rounded-full flex items-center justify-center"
                      style={{ background: "hsla(51,78%,65%,0.12)", border: `2px solid hsla(51,78%,65%,0.3)` }}>
                      <User className="h-6 w-6" style={{ color: gold }} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-white">{advisor.first_name} {advisor.last_name}</p>
                    <p className="text-xs" style={{ color: "hsla(51,78%,65%,0.6)" }}>{advisor.title || "Financial Advisor"}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5 text-sm">
                  {advisor.email && (
                    <div className="flex items-center gap-2" style={{ color: "hsla(51,78%,65%,0.7)" }}>
                      <Mail className="h-4 w-4" style={{ color: gold }} />
                      <span className="truncate text-white/70">{advisor.email}</span>
                    </div>
                  )}
                  {advisor.phone && (
                    <div className="flex items-center gap-2" style={{ color: "hsla(51,78%,65%,0.7)" }}>
                      <Phone className="h-4 w-4" style={{ color: gold }} />
                      <span className="text-white/70">{advisor.phone}</span>
                    </div>
                  )}
                </div>
                <Link
                  to="/portal/client/messages"
                  className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-300"
                  style={{
                    background: msgHovered ? "hsla(51,78%,65%,0.2)" : "hsla(51,78%,65%,0.12)",
                    border: "1px solid hsla(51,78%,65%,0.4)",
                    color: gold,
                    boxShadow: msgHovered ? "0 0 20px hsla(51,78%,65%,0.35)" : "none",
                  }}
                  onMouseEnter={() => setMsgHovered(true)}
                  onMouseLeave={() => setMsgHovered(false)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Message
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/40">No advisor assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
