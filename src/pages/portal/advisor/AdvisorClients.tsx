import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Send, Mail, Phone, UserCheck, Copy, Check, ChevronDown, FileText, FolderOpen, MessageSquare, Trash2 } from "lucide-react";
import type { PortalUser } from "@/hooks/usePortalAuth";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
const BRAND_GREEN = "#1A4D3E";
const BRAND_GREEN_LIGHT = "#F0F5F3";

interface AdvisorInfo {
  id: string;
  name: string;
}

export default function AdvisorClients() {
  const { portalUser } = usePortalAuth();
  const [clients, setClients] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [advisorMap, setAdvisorMap] = useState<Record<string, AdvisorInfo>>({});
  const [selectedAdvisor, setSelectedAdvisor] = useState("all");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PortalUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = portalUser?.role === "admin";

  useEffect(() => {
    if (!portalUser) return;
    loadClients();
  }, [portalUser]);

  async function loadClients() {
    try {
      let query = supabase
        .from("portal_users")
        .select("*")
        .eq("role", "client")
        .eq("is_active", true)
        .order("last_name");

      if (!isAdmin) {
        query = query.eq("advisor_id", portalUser!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      const clientData = (data as PortalUser[]) ?? [];
      setClients(clientData);

      // For admins, fetch advisor names
      if (isAdmin && clientData.length > 0) {
        const advisorIds = [...new Set(clientData.map((c) => c.advisor_id).filter(Boolean))];
        if (advisorIds.length > 0) {
          const { data: advisors } = await supabase
            .from("portal_users")
            .select("id, first_name, last_name")
            .in("id", advisorIds);
          const map: Record<string, AdvisorInfo> = {};
          advisors?.forEach((a: any) => {
            map[a.id] = { id: a.id, name: `${a.first_name} ${a.last_name}` };
          });
          setAdvisorMap(map);
        }
      }
    } catch (err) {
      console.error("Error loading clients:", err);
    } finally {
      setLoading(false);
    }
  }

  const advisorList = useMemo(() => {
    return Object.values(advisorMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [advisorMap]);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const q = search.toLowerCase();
      const advisorName = c.advisor_id ? advisorMap[c.advisor_id]?.name?.toLowerCase() ?? "" : "";
      const matchesSearch =
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        advisorName.includes(q);
      const matchesAdvisor = selectedAdvisor === "all" || c.advisor_id === selectedAdvisor;
      return matchesSearch && matchesAdvisor;
    });
  }, [clients, search, selectedAdvisor, advisorMap]);

  const uniqueAdvisorCount = useMemo(() => {
    return new Set(clients.map((c) => c.advisor_id).filter(Boolean)).size;
  }, [clients]);

  function copyEmail(email: string) {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1500);
  }

  async function handleDeleteClient() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("portal_users")
        .update({ is_active: false })
        .eq("id", deleteTarget.id)
        .eq("role", "client");
      if (error) throw error;
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast({ title: "Client removed", description: `${deleteTarget.first_name} ${deleteTarget.last_name} has been removed.` });
    } catch (err) {
      console.error("Error deleting client:", err);
      toast({ title: "Error", description: "Failed to remove client. Please try again.", variant: "destructive" });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? `${clients.length} clients across ${uniqueAdvisorCount} advisor${uniqueAdvisorCount !== 1 ? "s" : ""}` : `${clients.length} total clients`}
          </p>
        </div>
        <Link to="/portal/advisor/invite">
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
            style={{ background: BRAND_GREEN }}
          >
            <Send className="h-4 w-4" /> Invite Client
          </button>
        </Link>
      </div>

      {/* Admin Stats Bar */}
      {isAdmin && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Clients", value: clients.length, icon: Users },
            { label: "Active Advisors", value: uniqueAdvisorCount, icon: UserCheck },
            { label: "Avg per Advisor", value: uniqueAdvisorCount > 0 ? Math.round(clients.length / uniqueAdvisorCount) : 0, icon: FileText },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: BRAND_GREEN_LIGHT }}>
                <stat.icon className="h-4.5 w-4.5" style={{ color: BRAND_GREEN }} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={isAdmin ? "Search clients or advisors..." : "Search clients..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg"
          />
        </div>
        {isAdmin && advisorList.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors min-w-[180px] justify-between"
            >
              <span className="truncate">
                {selectedAdvisor === "all" ? "All Advisors" : advisorMap[selectedAdvisor]?.name}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 max-h-64 overflow-y-auto">
                  <button
                    onClick={() => { setSelectedAdvisor("all"); setFilterOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedAdvisor === "all" ? "font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                    style={selectedAdvisor === "all" ? { color: BRAND_GREEN, background: BRAND_GREEN_LIGHT } : {}}
                  >
                    All Advisors
                  </button>
                  {advisorList.map((adv) => (
                    <button
                      key={adv.id}
                      onClick={() => { setSelectedAdvisor(adv.id); setFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedAdvisor === adv.id ? "font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                      style={selectedAdvisor === adv.id ? { color: BRAND_GREEN, background: BRAND_GREEN_LIGHT } : {}}
                    >
                      {adv.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: BRAND_GREEN, borderTopColor: "transparent" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] p-14 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">
            {search || selectedAdvisor !== "all" ? "No clients match your filters." : "No clients yet. Invite your first client to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => {
            const advisorName = client.advisor_id ? advisorMap[client.advisor_id]?.name : null;
            return (
              <div
                key={client.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] hover:translate-y-[-2px] transition-all duration-200 overflow-hidden group"
              >
                <div className="p-5">
                  {/* Client Identity */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${BRAND_GREEN}, #2a7a64)` }}
                    >
                      {client.first_name[0]}{client.last_name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate text-[15px]">
                        {client.first_name} {client.last_name}
                      </p>
                      {isAdmin && advisorName && (
                        <span
                          className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                        >
                          <UserCheck className="h-3 w-3" />
                          {advisorName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 text-sm mb-4">
                    <div className="flex items-center gap-2 group/email">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                      <span className="truncate text-gray-600 flex-1">{client.email}</span>
                      <button
                        onClick={() => copyEmail(client.email)}
                        className="opacity-0 group-hover/email:opacity-100 transition-opacity p-0.5"
                        title="Copy email"
                      >
                        {copiedEmail === client.email ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                        <span className="text-gray-600">{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Joined date */}
                  {(client as any).created_at && (
                    <p className="text-[11px] text-gray-400 mb-3">
                      Joined {format(new Date((client as any).created_at), "MMM d, yyyy")}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link to={`/portal/advisor/policies?client=${client.id}`} className="flex-1">
                      <button className="w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 text-gray-600 hover:text-white bg-gray-50 hover:bg-[#1A4D3E] border border-gray-200 hover:border-transparent">
                        <FileText className="h-3.5 w-3.5" />
                        Policies
                      </button>
                    </Link>
                    <Link to={`/portal/advisor/documents?client=${client.id}`} className="flex-1">
                      <button className="w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 text-gray-600 hover:text-white bg-gray-50 hover:bg-[#1A4D3E] border border-gray-200 hover:border-transparent">
                        <FolderOpen className="h-3.5 w-3.5" />
                        Docs
                      </button>
                    </Link>
                    <Link to={`/portal/advisor/messages?client=${client.id}`} className="flex-1">
                      <button className="w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 text-gray-600 hover:text-white bg-gray-50 hover:bg-[#1A4D3E] border border-gray-200 hover:border-transparent">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </button>
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(client)}
                      className="py-2 px-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200"
                      title="Remove client"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Client</h3>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to remove <strong>{deleteTarget.first_name} {deleteTarget.last_name}</strong>? They will no longer be able to access the portal.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteClient}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
