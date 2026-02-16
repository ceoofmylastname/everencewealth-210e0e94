import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    // Build advisor lookup
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
      <h1 className="text-2xl font-bold" style={{ color: "#1A4D3E", fontFamily: "'Playfair Display', serif" }}>
        Client Management
      </h1>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Assigned Advisor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No clients found</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.email}</TableCell>
                      <TableCell>{c.advisorName}</TableCell>
                      <TableCell>
                        <Badge variant={c.is_active ? "default" : "secondary"} className={c.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                          {c.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setReassignClient(c)}>
                          Reassign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
