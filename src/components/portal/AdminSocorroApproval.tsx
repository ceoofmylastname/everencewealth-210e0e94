import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SocorroAdvisor } from "@/types/socorro";

export default function AdminSocorroApproval() {
  const { portalUser } = usePortalAuth();
  const { toast } = useToast();
  const [advisors, setAdvisors] = useState<SocorroAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAdvisors((data ?? []) as unknown as SocorroAdvisor[]);
    } catch (err) {
      console.error("Failed to load advisors:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (advisor: SocorroAdvisor) => {
    setTogglingId(advisor.id);
    try {
      const newApproved = !advisor.is_approved;
      const { error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .update({
          is_approved: newApproved,
          approved_by: newApproved ? portalUser?.id : null,
          approved_at: newApproved ? new Date().toISOString() : null,
        })
        .eq("id", advisor.id);
      if (error) throw error;
      setAdvisors((prev) =>
        prev.map((a) =>
          a.id === advisor.id
            ? { ...a, is_approved: newApproved, approved_by: newApproved ? portalUser?.id ?? null : null, approved_at: newApproved ? new Date().toISOString() : null }
            : a
        )
      );
      toast({
        title: newApproved ? "Advisor approved" : "Advisor unapproved",
        description: `${advisor.first_name} ${advisor.last_name}`,
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setTogglingId(null);
    }
  };

  const filtered = advisors.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.first_name.toLowerCase().includes(q) ||
      a.last_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading advisors…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search advisors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={loadAdvisors}>
          Refresh
        </Button>
        <span className="text-sm text-gray-400 ml-auto">
          {filtered.length} advisor{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-gray-400 text-sm">No advisors found.</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advisor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Headshot</TableHead>
                <TableHead>Approved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((advisor) => (
                <TableRow key={advisor.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {advisor.headshot_url ? (
                        <img
                          src={advisor.headshot_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                          {advisor.first_name[0]}{advisor.last_name[0]}
                        </div>
                      )}
                      {advisor.first_name} {advisor.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{advisor.email}</TableCell>
                  <TableCell>
                    {advisor.headshot_url ? (
                      <span className="text-xs text-emerald-600">Set</span>
                    ) : (
                      <span className="text-xs text-gray-400">Missing</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {togglingId === advisor.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Switch
                          checked={advisor.is_approved}
                          onCheckedChange={() => toggleApproval(advisor)}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
