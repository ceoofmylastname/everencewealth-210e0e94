import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Users, Search, Send, Mail, Phone } from "lucide-react";
import type { PortalUser } from "@/hooks/usePortalAuth";

const BRAND_GREEN = "#1A4D3E";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} total clients</p>
        </div>
        <Link to="/portal/advisor/invite">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: BRAND_GREEN }}
          >
            <Send className="h-4 w-4" /> Invite Client
          </button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{search ? "No clients match your search." : "No clients yet. Invite your first client to get started."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white" style={{ background: BRAND_GREEN }}>
                  {client.first_name[0]}{client.last_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{client.first_name} {client.last_name}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate text-gray-600">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="text-gray-600">{client.phone}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/portal/advisor/policies?client=${client.id}`} className="flex-1">
                  <button className="w-full py-1.5 rounded-lg text-xs font-medium transition-all text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200">
                    Policies
                  </button>
                </Link>
                <Link to={`/portal/advisor/documents?client=${client.id}`} className="flex-1">
                  <button className="w-full py-1.5 rounded-lg text-xs font-medium transition-all text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200">
                    Docs
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
