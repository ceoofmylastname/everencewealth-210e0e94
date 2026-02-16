import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    // Create portal_users record
    const { data: portalUser, error: puError } = await supabase
      .from("portal_users")
      .insert({
        auth_user_id: crypto.randomUUID(), // placeholder until they sign up
        role: "advisor" as any,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        is_active: true,
      })
      .select("id")
      .single();

    if (puError) {
      toast.error("Failed to create portal user: " + puError.message);
      setSaving(false);
      return;
    }

    // Create advisors record
    const { error: advError } = await supabase
      .from("advisors")
      .insert({
        auth_user_id: crypto.randomUUID(), // placeholder
        portal_user_id: portalUser.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        agency_id: form.agency_id || null,
        license_number: form.license_number || null,
        specializations: form.specializations ? form.specializations.split(",").map((s) => s.trim()) : null,
        is_active: true,
      });

    if (advError) {
      toast.error("Failed to create advisor: " + advError.message);
      setSaving(false);
      return;
    }

    if (sendInvitation) {
      // Try to invoke the invitation edge function
      await supabase.functions.invoke("send-portal-invitation", {
        body: { email: form.email, first_name: form.first_name, role: "advisor" },
      }).catch(() => {
        // Non-critical: invitation may not be configured yet
      });
    }

    toast.success("Agent created successfully");
    navigate("/portal/admin/agents");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/portal/admin/agents")} className="gap-2">
        <ArrowLeft className="h-4 w-4" />Back to Agents
      </Button>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle style={{ color: "#1A4D3E" }}>Add New Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input required value={form.first_name} onChange={(e) => updateField("first_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input required value={form.last_name} onChange={(e) => updateField("last_name", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" required placeholder="agent@example.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
            </div>
            {agencies.length > 0 && (
              <div className="space-y-2">
                <Label>Agency</Label>
                <Select value={form.agency_id} onValueChange={(v) => updateField("agency_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.agency_name} ({a.agency_code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input value={form.license_number} onChange={(e) => updateField("license_number", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Specializations</Label>
              <Input placeholder="e.g. IUL, Whole Life, Annuities" value={form.specializations} onChange={(e) => updateField("specializations", e.target.value)} />
              <p className="text-xs text-muted-foreground">Comma-separated</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="invite" checked={sendInvitation} onCheckedChange={(v) => setSendInvitation(!!v)} />
              <Label htmlFor="invite" className="text-sm font-normal">Send invitation email</Label>
            </div>
            <p className="text-xs text-muted-foreground italic">Commission level configuration coming soon.</p>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/portal/admin/agents")}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Agent"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
