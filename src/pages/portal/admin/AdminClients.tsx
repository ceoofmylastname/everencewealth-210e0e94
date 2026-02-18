import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";
import { ReassignAdvisorDialog } from "@/components/portal/admin/ReassignAdvisorDialog";

interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  advisor_id: string | null;
  advisorName: string;
}

interface AdvisorMap {
  [portalUserId: string]: string;
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reassignClient, setReassignClient] = useState<ClientRow | null>(null);

  useEffect(() => { fetchClients(); }, []);

  async function fetchClients() {
    setLoading(true);
    const { data: clientData } = await supabase
      .from("portal_users")
      .select("id, first_name, last_name, email, is_active, advisor_id")
      .eq("role", "client")
      .order("first_name");

    const { data: advisors } = await supabase
      .from("advisors")
      .select("portal_user_id, first_name, last_name");

    const advisorMap: AdvisorMap = {};
    (advisors ?? []).forEach((a: any) => {
      advisorMap[a.portal_user_id] = `${a.first_name} ${a.last_name}`;
    });

    setClients(
      (clientData ?? []).map((c: any) => ({
        ...c,
        advisorName: c.advisor_id ? (advisorMap[c.advisor_id] || "Unknown") : "Unassigned",
      }))
    );
    setLoading(false);
  }

  const filtered = clients.filter((c) =>
    !search ||
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage all portal clients</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-4 border-[#1A4D3E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assigned Advisor</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-400">No clients found</TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <TableCell className="font-medium text-gray-900">{c.first_name} {c.last_name}</TableCell>
                    <TableCell className="text-gray-500">{c.email}</TableCell>
                    <TableCell className="text-gray-700">{c.advisorName}</TableCell>
                    <TableCell>
                      {c.is_active ? (
                        <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs px-2.5 py-0.5 font-medium">Active</span>
                      ) : (
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs px-2.5 py-0.5 font-medium">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#1A4D3E] text-[#1A4D3E] hover:bg-[#F0F5F3]"
                        onClick={() => setReassignClient(c)}
                      >
                        Reassign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {reassignClient && (
        <ReassignAdvisorDialog
          open={!!reassignClient}
          onOpenChange={(open) => !open && setReassignClient(null)}
          clientId={reassignClient.id}
          clientName={`${reassignClient.first_name} ${reassignClient.last_name}`}
          currentAdvisorId={reassignClient.advisor_id}
          onReassigned={fetchClients}
        />
      )}
    </div>
  );
}
