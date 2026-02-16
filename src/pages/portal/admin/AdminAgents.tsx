import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye } from "lucide-react";

interface AgentRow {
  id: string;
  portal_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  clientCount: number;
  policyCount: number;
}

export default function AdminAgents() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => { fetchAgents(); }, []);

  async function fetchAgents() {
    setLoading(true);
    const { data: advisors } = await supabase
      .from("advisors")
      .select("id, portal_user_id, first_name, last_name, email, is_active")
      .order("first_name");

    if (!advisors) { setLoading(false); return; }

    // Fetch client counts per advisor (advisor's portal_user_id = client's advisor_id)
    const portalUserIds = advisors.map((a) => a.portal_user_id);
    const { data: clients } = await (supabase
      .from("portal_users")
      .select("id, advisor_id")
      .eq("role", "client") as any)
      .in("advisor_id", portalUserIds);

    const advisorIds = advisors.map((a: any) => a.id);
    const { data: policies } = await (supabase
      .from("policies") as any)
      .select("id, advisor_id")
      .eq("status", "active")
      .in("advisor_id", advisorIds);

    const clientCounts: Record<string, number> = {};
    (clients ?? []).forEach((c: any) => {
      clientCounts[c.advisor_id] = (clientCounts[c.advisor_id] || 0) + 1;
    });

    const policyCounts: Record<string, number> = {};
    (policies ?? []).forEach((p: any) => {
      policyCounts[p.advisor_id] = (policyCounts[p.advisor_id] || 0) + 1;
    });

    setAgents(
      advisors.map((a) => ({
        ...a,
        clientCount: clientCounts[a.portal_user_id] || 0,
        policyCount: policyCounts[a.id] || 0,
      }))
    );
    setLoading(false);
  }

  const filtered = agents.filter((a) => {
    const matchSearch =
      !search ||
      `${a.first_name} ${a.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && a.is_active) ||
      (statusFilter === "inactive" && !a.is_active);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "#1A4D3E", fontFamily: "'Playfair Display', serif" }}>
          Agent Management
        </h1>
        <Link to="/portal/admin/agents/new">
          <Button><Plus className="h-4 w-4 mr-2" />Add New Agent</Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Clients</TableHead>
                  <TableHead className="text-center">Active Policies</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No agents found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.first_name} {a.last_name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.email}</TableCell>
                      <TableCell>
                        <Badge variant={a.is_active ? "default" : "secondary"} className={a.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                          {a.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{a.clientCount}</TableCell>
                      <TableCell className="text-center">{a.policyCount}</TableCell>
                      <TableCell>
                        <Link to={`/portal/admin/agents/${a.id}`}>
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" />View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
