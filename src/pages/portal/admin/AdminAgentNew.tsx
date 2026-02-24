import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Agency {
  id: string;
  agency_name: string;
  agency_code: string;
}

export default function AdminAgentNew() {
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [saving, setSaving] = useState(false);
  const [sendInvitation, setSendInvitation] = useState(true);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    agency_id: "",
    license_number: "",
    specializations: "",
    role: "advisor",
  });

  useEffect(() => {
    supabase.from("agency_hierarchy").select("id, agency_name, agency_code").order("agency_name").then(({ data }) => {
      setAgencies((data as Agency[]) ?? []);
    });
  }, []);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { data, error } = await supabase.functions.invoke("create-agent", {
      body: {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        agency_id: form.agency_id,
        license_number: form.license_number,
        specializations: form.specializations,
        send_invitation: sendInvitation,
        role: form.role,
      },
    });

    if (error) {
      toast.error("Failed to create agent: " + error.message);
      setSaving(false);
      return;
    }

    if (data?.error) {
      toast.error(data.error);
      setSaving(false);
      return;
    }

    if (data?.invitation_sent) {
      toast.success("Agent created and invitation email sent");
    } else if (data?.invitation_error) {
      toast.warning("Agent created but invitation email failed: " + data.invitation_error);
    } else {
      toast.success("Agent created successfully");
    }
    navigate("/portal/admin/agents");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/portal/admin/agents")}
        className="gap-2 text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />Back to Agents
      </Button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Add New Agent</h2>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details to create a new advisor agent</p>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">First Name *</Label>
                <Input
                  required
                  className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                  value={form.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Last Name *</Label>
                <Input
                  required
                  className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                  value={form.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Email *</Label>
              <Input
                type="email"
                required
                placeholder="agent@example.com"
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Role *</Label>
              <Select value={form.role} onValueChange={(v) => updateField("role", v)}>
                <SelectTrigger className="border-gray-200 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="advisor">Advisor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {form.role === "admin" && (
                <p className="text-xs text-amber-600 font-medium">⚠ This user will have full administrative access to the portal.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Phone</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
            {agencies.length > 0 && (
              <div className="space-y-2">
                <Label className="text-gray-700">Agency</Label>
                <Select value={form.agency_id} onValueChange={(v) => updateField("agency_id", v)}>
                  <SelectTrigger className="border-gray-200 bg-white">
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.agency_name} ({a.agency_code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-gray-700">License Number</Label>
              <Input
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={form.license_number}
                onChange={(e) => updateField("license_number", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Specializations</Label>
              <Input
                placeholder="e.g. IUL, Whole Life, Annuities"
                className="border-gray-200 bg-white focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
                value={form.specializations}
                onChange={(e) => updateField("specializations", e.target.value)}
              />
              <p className="text-xs text-gray-400">Comma-separated</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="invite" checked={sendInvitation} onCheckedChange={(v) => setSendInvitation(!!v)} />
              <Label htmlFor="invite" className="text-sm font-normal text-gray-700">Send invitation email</Label>
            </div>
            <p className="text-xs text-gray-400 italic">Commission level configuration coming soon.</p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                className="border-gray-200 text-gray-700"
                onClick={() => navigate("/portal/admin/agents")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1A4D3E] hover:bg-[#143d30] text-white"
              >
                {saving ? "Creating..." : "Create Agent"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
