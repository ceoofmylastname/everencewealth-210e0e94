import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Skeleton } from "@/components/ui/skeleton";
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

      // Separate query for messages to avoid type depth issues
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

  const fmt = (n: number | null) => n != null ? `$${n.toLocaleString()}` : "—";

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "pending": return "bg-amber-500";
      case "lapsed": return "bg-destructive";
      default: return "bg-muted-foreground";
    }
  };

  const statCards = [
    { label: "Active Policies", value: policies.length, icon: FileText, href: "/portal/client/policies", tint: "bg-primary/10 border-primary/20", iconTint: "text-primary bg-primary/20" },
    { label: "Documents", value: docCount, icon: FolderOpen, href: "/portal/client/documents", tint: "bg-amber-500/10 border-amber-500/20", iconTint: "text-amber-600 bg-amber-500/20" },
    { label: "Unread Messages", value: msgCount, icon: MessageCircle, href: "/portal/client/messages", tint: "bg-violet-500/10 border-violet-500/20", iconTint: "text-violet-600 bg-violet-500/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-primary p-6 sm:p-8 text-primary-foreground">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif">
          Welcome, {portalUser?.first_name}
        </h1>
        <p className="mt-1 text-primary-foreground/70 text-sm sm:text-base">
          Your personal insurance portal — everything in one place.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border p-6 space-y-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          : statCards.map((card, i) => (
              <Link key={card.label} to={card.href} style={{ animationDelay: `${i * 80}ms` }} className="animate-fade-in">
                <div className={`group rounded-2xl ${card.tint} border p-6 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${card.iconTint}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
                </div>
              </Link>
            ))}
      </div>

      {/* Two-column: Policies + Advisor Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Policies — 2/3 */}
        <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card shadow-sm">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Policies</h2>
            <Link to="/portal/client/policies" className="text-sm text-primary hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="px-6 pb-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : policies.length === 0 ? (
              <p className="text-muted-foreground text-center py-10">No policies yet.</p>
            ) : (
              <div className="space-y-3">
                {policies.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{p.carrier_name}</p>
                        <p className="text-xs text-muted-foreground">#{p.policy_number} · {p.product_type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Benefit</p>
                        <p className="text-sm font-semibold text-foreground">{fmt(p.death_benefit)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${statusColor(p.policy_status)}`} />
                        <span className="text-xs text-muted-foreground capitalize">{p.policy_status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advisor Sidebar — 1/3 */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/50 bg-card shadow-sm p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Your Advisor</h2>
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : advisor ? (
              <>
                <div className="flex items-center gap-4 mb-5">
                  {advisor.photo_url ? (
                    <img src={advisor.photo_url} alt={advisor.first_name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{advisor.first_name} {advisor.last_name}</p>
                    <p className="text-xs text-muted-foreground">{advisor.title || "Financial Advisor"}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5 text-sm">
                  {advisor.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{advisor.email}</span>
                    </div>
                  )}
                  {advisor.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{advisor.phone}</span>
                    </div>
                  )}
                </div>
                <Link to="/portal/client/messages" className="flex items-center justify-center gap-2 w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
                  <MessageCircle className="h-4 w-4" />
                  Send Message
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No advisor assigned yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
