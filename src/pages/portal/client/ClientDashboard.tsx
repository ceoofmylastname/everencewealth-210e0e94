import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, FolderOpen, ArrowUpRight, MessageCircle, Mail, Phone, User } from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const GOLD = "hsla(51, 78%, 65%, 1)";

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

const statusStyle = (status: string) => {
  switch (status) {
    case "active": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "pending": return "bg-amber-50 text-amber-700 border border-amber-200";
    case "lapsed": return "bg-red-50 text-red-700 border border-red-200";
    default: return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};

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

  const statCards = [
    { label: "Active Policies", value: policies.filter(p => p.policy_status === "active").length, icon: FileText, href: "/portal/client/policies" },
    { label: "Documents", value: docCount, icon: FolderOpen, href: "/portal/client/documents" },
    { label: "Unread Messages", value: msgCount, icon: MessageCircle, href: "/portal/client/messages" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <p className="text-sm text-gray-500">Welcome back</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{portalUser?.first_name} {portalUser?.last_name}</h1>
        <p className="text-sm text-gray-400 mt-1">Your personal insurance portal — everything in one place.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))
          : statCards.map((card) => (
              <Link key={card.label} to={card.href}>
                <div className="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                      <card.icon className="h-5 w-5" style={{ color: BRAND_GREEN }} />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                </div>
              </Link>
            ))}
      </div>

      {/* Two-column: Policies + Advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Policies - 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Policies</h2>
            <Link to="/portal/client/policies" className="text-xs font-semibold hover:underline" style={{ color: GOLD }}>
              View all
            </Link>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-40" /></div>
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : policies.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No policies yet.</p>
            ) : (
              <div className="space-y-2">
                {policies.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${BRAND_GREEN}15` }}>
                        <FileText className="h-4 w-4" style={{ color: BRAND_GREEN }} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.carrier_name}</p>
                        <p className="text-xs text-gray-500">#{p.policy_number} · {p.product_type.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="hidden sm:block">
                        <p className="text-xs text-gray-400">Benefit</p>
                        <p className="text-sm font-semibold text-gray-900">{fmt(p.death_benefit)}</p>
                      </div>
                      <span className={`text-xs rounded-full px-2.5 py-1 font-medium capitalize ${statusStyle(p.policy_status)}`}>
                        {p.policy_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advisor - 1/3 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Your Advisor</h2>
          {loading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div>
              </div>
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : advisor ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                {advisor.photo_url ? (
                  <img src={advisor.photo_url} alt={advisor.first_name} className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-2" style={{ ringColor: BRAND_GREEN } as any} />
                ) : (
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: BRAND_GREEN }}>
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{advisor.first_name} {advisor.last_name}</p>
                  <p className="text-xs text-gray-500">{advisor.title || "Financial Advisor"}</p>
                </div>
              </div>
              <div className="space-y-2 mb-5 text-sm">
                {advisor.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{advisor.email}</span>
                  </div>
                )}
                {advisor.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{advisor.phone}</span>
                  </div>
                )}
              </div>
              <Link to="/portal/client/messages">
                <button className="flex items-center justify-center gap-2 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  <MessageCircle className="h-4 w-4" />
                  Send Message
                </button>
              </Link>
            </>
          ) : (
            <p className="text-sm text-gray-400">No advisor assigned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
