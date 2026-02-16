import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, UserMinus, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { ReassignAdvisorDialog } from "@/components/portal/admin/ReassignAdvisorDialog";

interface AdvisorData {
  id: string;
  portal_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  title: string | null;
  bio: string | null;
  license_number: string | null;
  specializations: string[] | null;
  languages: string[] | null;
  is_active: boolean;
}

interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  advisor_id: string | null;
}

export default function AdminAgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [advisor, setAdvisor] = useState<AdvisorData | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [policyCount, setPolicyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdvisorData>>({});
  const [reassignClient, setReassignClient] = useState<ClientRow | null>(null);

  useEffect(() => { if (id) fetchData(); }, [id]);

  async function fetchData() {
    setLoading(true);
    const { data: adv } = await supabase
      .from("advisors")
      .select("id, portal_user_id, first_name, last_name, email, phone, title, bio, license_number, specializations, languages, is_active")
      .eq("id", id!)
      .single();

    if (!adv) { setLoading(false); return; }
    setAdvisor(adv as AdvisorData);
    setEditForm(adv as AdvisorData);

    const { data: clientData } = await (supabase
      .from("portal_users")
      .select("id, first_name, last_name, email, is_active, advisor_id")
      .eq("role", "client") as any)
      .eq("advisor_id", (adv as any).portal_user_id);
    setClients((clientData as ClientRow[]) ?? []);

    const { count } = await (supabase
      .from("policies")
      .select("id", { count: "exact", head: true })
      .eq("advisor_id", id!) as any)
      .eq("status", "active");
    setPolicyCount(count ?? 0);

    setLoading(false);
  }

  async function handleSave() {
    if (!advisor) return;
    setSaving(true);
    const { error } = await supabase
      .from("advisors")
      .update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone,
        title: editForm.title,
        bio: editForm.bio,
        license_number: editForm.license_number,
        specializations: editForm.specializations,
        languages: editForm.languages,
      })
      .eq("id", advisor.id);

    // Also update portal_users name
    await supabase
      .from("portal_users")
      .update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone,
      })
      .eq("id", advisor.portal_user_id);

    setSaving(false);
    if (error) {
      toast.error("Failed to update agent");
    } else {
      toast.success("Agent updated");
      fetchData();
    }
  }

  async function toggleActive() {
    if (!advisor) return;
    const newActive = !advisor.is_active;
    await supabase.from("advisors").update({ is_active: newActive }).eq("id", advisor.id);
    await supabase.from("portal_users").update({ is_active: newActive }).eq("id", advisor.portal_user_id);
    toast.success(newActive ? "Agent activated" : "Agent deactivated");
    fetchData();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!advisor) {
    return <p className="text-center py-20 text-muted-foreground">Agent not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/portal/admin/agents")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />Back to Agents
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A4D3E", fontFamily: "'Playfair Display', serif" }}>
            {advisor.first_name} {advisor.last_name}
          </h1>
          <p className="text-muted-foreground">{advisor.email}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={advisor.is_active ? "default" : "secondary"} className={advisor.is_active ? "bg-green-100 text-green-800" : ""}>
            {advisor.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button variant="outline" size="sm" onClick={toggleActive}>
            {advisor.is_active ? <><UserMinus className="h-4 w-4 mr-1" />Deactivate</> : <><UserCheck className="h-4 w-4 mr-1" />Activate</>}
          </Button>
        </div>
      </div>

      {/* Performance summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold" style={{ color: "#1A4D3E" }}>{clients.length}</p>
            <p className="text-sm text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold" style={{ color: "#1A4D3E" }}>{policyCount}</p>
            <p className="text-sm text-muted-foreground">Active Policies</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit form */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: "#1A4D3E" }}>Agent Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={editForm.first_name ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={editForm.last_name ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={editForm.phone ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editForm.title ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Input value={editForm.bio ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input value={editForm.license_number ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, license_number: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Specializations (comma-separated)</Label>
              <Input value={editForm.specializations?.join(", ") ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, specializations: e.target.value.split(",").map((s) => s.trim()) }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Languages (comma-separated)</Label>
            <Input value={editForm.languages?.join(", ") ?? ""} onChange={(e) => setEditForm((p) => ({ ...p, languages: e.target.value.split(",").map((s) => s.trim()) }))} />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assigned clients */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: "#1A4D3E" }}>Assigned Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No clients assigned</TableCell>
                </TableRow>
              ) : (
                clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.first_name} {c.last_name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "default" : "secondary"} className={c.is_active ? "bg-green-100 text-green-800" : ""}>
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
        </CardContent>
      </Card>

      {reassignClient && (
        <ReassignAdvisorDialog
          open={!!reassignClient}
          onOpenChange={(open) => !open && setReassignClient(null)}
          clientId={reassignClient.id}
          clientName={`${reassignClient.first_name} ${reassignClient.last_name}`}
          currentAdvisorId={reassignClient.advisor_id}
          onReassigned={fetchData}
        />
      )}
    </div>
  );
}
