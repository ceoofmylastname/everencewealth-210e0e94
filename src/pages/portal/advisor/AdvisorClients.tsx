import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Send, Mail, Phone } from "lucide-react";
import type { PortalUser } from "@/hooks/usePortalAuth";

const GOLD = "hsla(51, 78%, 65%, 1)";
const GOLD_BG = "hsla(51, 78%, 65%, 0.12)";
const GOLD_BORDER = "hsla(51, 78%, 65%, 0.3)";
const GLASS = { background: "hsla(160,48%,21%,0.08)", border: "1px solid hsla(0,0%,100%,0.08)", backdropFilter: "blur(16px)" };

function MeshOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, hsla(160,60%,25%,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${GOLD_BG} 0%, transparent 70%)`, filter: "blur(80px)" }} />
    </div>
  );
}

export default function AdvisorClients() {
  const { portalUser } = usePortalAuth();
  const [clients, setClients] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!portalUser) return;
    loadClients();
  }, [portalUser]);

  async function loadClients() {
    try {
      const { data, error } = await supabase
        .from("portal_users")
        .select("*")
        .eq("role", "client")
        .eq("advisor_id", portalUser!.id)
        .eq("is_active", true)
        .order("last_name");
      if (error) throw error;
      setClients((data as PortalUser[]) ?? []);
    } catch (err) {
      console.error("Error loading clients:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return c.first_name.toLowerCase().includes(q) || c.last_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div className="relative min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8" style={{ background: "#020806" }}>
      <MeshOrbs />
      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full"
                style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                CLIENT ROSTER
              </span>
            </div>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Clients</h1>
            <p className="text-white/50 mt-1 text-sm">{clients.length} total clients</p>
          </div>
          <Link to="/portal/advisor/invite">
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${GOLD_BG}`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <Send className="h-4 w-4" /> Invite Client
            </button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20 rounded-xl"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: GOLD, borderTopColor: "transparent" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl p-12 text-center" style={GLASS}>
            <Users className="h-12 w-12 mx-auto mb-4 text-white/20" />
            <p className="text-white/50">{search ? "No clients match your search." : "No clients yet. Invite your first client to get started."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="rounded-2xl p-5 transition-all"
                style={GLASS}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 0 32px hsla(51,78%,65%,0.08)`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: GOLD_BG, color: GOLD, border: `1px solid ${GOLD_BORDER}` }}>
                    {client.first_name[0]}{client.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{client.first_name} {client.last_name}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                    <span className="truncate text-white/60">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                      <span className="text-white/60">{client.phone}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/portal/advisor/policies?client=${client.id}`} className="flex-1">
                    <button className="w-full py-1.5 rounded-lg text-xs font-medium transition-all text-white/60 hover:text-white"
                      style={{ background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
                      Policies
                    </button>
                  </Link>
                  <Link to={`/portal/advisor/documents?client=${client.id}`} className="flex-1">
                    <button className="w-full py-1.5 rounded-lg text-xs font-medium transition-all text-white/60 hover:text-white"
                      style={{ background: "hsla(0,0%,100%,0.05)", border: "1px solid hsla(0,0%,100%,0.08)" }}>
                      Docs
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
