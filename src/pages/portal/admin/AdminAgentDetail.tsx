import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
        <div className="w-8 h-8 border-4 border-[#1A4D3E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!advisor) {
    return <p className="text-center py-20 text-gray-400">Agent not found</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/portal/admin/agents")}
        className="gap-2 text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />Back to Agents
      </Button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {advisor.first_name} {advisor.last_name}
          </h1>
          <p className="text-gray-500">{advisor.email}</p>
        </div>
        <div className="flex items-center gap-3">
          {advisor.is_active ? (
            <span className="inline-flex items-center bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs px-2.5 py-1 font-medium">Active</span>
          ) : (
            <span className="inline-flex items-center bg-gray-100 text-gray-600 border border-gray-200 rounded-full text-xs px-2.5 py-1 font-medium">Inactive</span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-700 hover:border-[#1A4D3E] hover:text-[#1A4D3E]"
            onClick={toggleActive}
          >
            {advisor.is_active
              ? <><UserMinus className="h-4 w-4 mr-1" />Deactivate</>
              : <><UserCheck className="h-4 w-4 mr-1" />Activate</>
            }
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-3xl font-bold text-[#1A4D3E]">{clients.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Clients</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <p className="text-3xl font-bold text-[#1A4D3E]">{policyCount}</p>
          <p className="text-sm text-gray-500 mt-1">Active Policies</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Agent Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">First Name</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={editForm.first_name ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Last Name</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={editForm.last_name ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Phone</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={editForm.phone ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Title</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={editForm.title ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Bio</Label>
            <Input
              className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
              value={editForm.bio ?? ""}
              onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">License Number</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={editForm.license_number ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, license_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Specializations (comma-separated)</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={editForm.specializations?.join(", ") ?? ""}
                onChange={(e) => setEditForm((p) => ({ ...p, specializations: e.target.value.split(",").map((s) => s.trim()) }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700">Languages (comma-separated)</Label>
            <Input
              className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
              value={editForm.languages?.join(", ") ?? ""}
              onChange={(e) => setEditForm((p) => ({ ...p, languages: e.target.value.split(",").map((s) => s.trim()) }))}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1A4D3E] hover:bg-[#143d30] text-white"
            >
              <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Assigned clients */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Assigned Clients ({clients.length})</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-400">No clients assigned</TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                  <TableCell className="font-medium text-gray-900">{c.first_name} {c.last_name}</TableCell>
                  <TableCell className="text-gray-500">{c.email}</TableCell>
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
      </div>

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
