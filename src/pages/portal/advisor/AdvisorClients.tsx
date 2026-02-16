import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Send, Mail, Phone } from "lucide-react";
import type { PortalUser } from "@/hooks/usePortalAuth";

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
    return (
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
            Clients
          </h1>
          <p className="text-muted-foreground mt-1">{clients.length} total clients</p>
        </div>
        <Button asChild>
          <Link to="/portal/advisor/invite"><Send className="h-4 w-4 mr-2" />Invite Client</Link>
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {search ? "No clients match your search." : "No clients yet. Invite your first client to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {client.first_name[0]}{client.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {client.first_name} {client.last_name}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/portal/advisor/policies?client=${client.id}`}>Policies</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/portal/advisor/documents?client=${client.id}`}>Docs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
