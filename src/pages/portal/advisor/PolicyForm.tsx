import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface ClientOption {
  id: string;
  first_name: string;
  last_name: string;
}

export default function PolicyForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { portalUser } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    client_id: "",
    carrier_name: "",
    policy_number: "",
    product_type: "whole_life",
    policy_status: "active",
    death_benefit: "",
    cash_value: "",
    monthly_premium: "",
    premium_frequency: "monthly",
    issue_date: "",
    maturity_date: "",
    notes: "",
  });

  useEffect(() => {
    if (!portalUser) return;
    init();
  }, [portalUser, id]);

  async function init() {
    const { data: advisor } = await supabase
      .from("advisors")
      .select("id")
      .eq("portal_user_id", portalUser!.id)
      .maybeSingle();

    if (!advisor) { setLoading(false); return; }
    setAdvisorId(advisor.id);

    const { data: clientData } = await supabase
      .from("portal_users")
      .select("id, first_name, last_name")
      .eq("role", "client")
      .eq("advisor_id", portalUser!.id)
      .eq("is_active", true)
      .order("last_name");

    setClients((clientData as ClientOption[]) ?? []);

    if (isEdit) {
      const { data: policy } = await supabase.from("policies").select("*").eq("id", id).single();
      if (policy) {
        setForm({
          client_id: policy.client_id,
          carrier_name: policy.carrier_name,
          policy_number: policy.policy_number,
          product_type: policy.product_type,
          policy_status: policy.policy_status,
          death_benefit: policy.death_benefit?.toString() ?? "",
          cash_value: policy.cash_value?.toString() ?? "",
          monthly_premium: policy.monthly_premium?.toString() ?? "",
          premium_frequency: policy.premium_frequency ?? "monthly",
          issue_date: policy.issue_date ?? "",
          maturity_date: policy.maturity_date ?? "",
          notes: policy.notes ?? "",
        });
      }
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!advisorId || !form.client_id) {
      toast.error("Please select a client");
      return;
    }

    setSaving(true);
    const payload = {
      client_id: form.client_id,
      advisor_id: advisorId,
      carrier_name: form.carrier_name,
      policy_number: form.policy_number,
      product_type: form.product_type,
      policy_status: form.policy_status,
      death_benefit: form.death_benefit ? parseFloat(form.death_benefit) : null,
      cash_value: form.cash_value ? parseFloat(form.cash_value) : null,
      monthly_premium: form.monthly_premium ? parseFloat(form.monthly_premium) : null,
      premium_frequency: form.premium_frequency,
      issue_date: form.issue_date || null,
      maturity_date: form.maturity_date || null,
      notes: form.notes || null,
    };

    const { error } = isEdit
      ? await supabase.from("policies").update(payload).eq("id", id)
      : await supabase.from("policies").insert(payload);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isEdit ? "Policy updated" : "Policy created");
      navigate("/portal/advisor/policies");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate("/portal/advisor/policies")}>
        <ArrowLeft className="h-4 w-4 mr-2" />Back to Policies
      </Button>

      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: "'Playfair Display', serif" }}>
            {isEdit ? "Edit Policy" : "New Policy"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={form.client_id} onValueChange={(v) => setForm((f) => ({ ...f, client_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Carrier Name *</Label>
                <Input required value={form.carrier_name} onChange={(e) => setForm((f) => ({ ...f, carrier_name: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Policy Number *</Label>
                <Input required value={form.policy_number} onChange={(e) => setForm((f) => ({ ...f, policy_number: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Product Type *</Label>
                <Select value={form.product_type} onValueChange={(v) => setForm((f) => ({ ...f, product_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole_life">Whole Life</SelectItem>
                    <SelectItem value="term_life">Term Life</SelectItem>
                    <SelectItem value="universal_life">Universal Life</SelectItem>
                    <SelectItem value="variable_life">Variable Life</SelectItem>
                    <SelectItem value="indexed_universal_life">Indexed Universal Life</SelectItem>
                    <SelectItem value="annuity">Annuity</SelectItem>
                    <SelectItem value="disability">Disability</SelectItem>
                    <SelectItem value="long_term_care">Long-Term Care</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.policy_status} onValueChange={(v) => setForm((f) => ({ ...f, policy_status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="lapsed">Lapsed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="paid_up">Paid Up</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Premium Frequency</Label>
                <Select value={form.premium_frequency} onValueChange={(v) => setForm((f) => ({ ...f, premium_frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi_annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Death Benefit</Label>
                <Input type="number" step="0.01" value={form.death_benefit} onChange={(e) => setForm((f) => ({ ...f, death_benefit: e.target.value }))} placeholder="$0.00" />
              </div>

              <div className="space-y-2">
                <Label>Cash Value</Label>
                <Input type="number" step="0.01" value={form.cash_value} onChange={(e) => setForm((f) => ({ ...f, cash_value: e.target.value }))} placeholder="$0.00" />
              </div>

              <div className="space-y-2">
                <Label>Monthly Premium</Label>
                <Input type="number" step="0.01" value={form.monthly_premium} onChange={(e) => setForm((f) => ({ ...f, monthly_premium: e.target.value }))} placeholder="$0.00" />
              </div>

              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input type="date" value={form.issue_date} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Maturity Date</Label>
                <Input type="date" value={form.maturity_date} onChange={(e) => setForm((f) => ({ ...f, maturity_date: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : isEdit ? "Update Policy" : "Create Policy"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/portal/advisor/policies")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
