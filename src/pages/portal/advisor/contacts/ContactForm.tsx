import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ContactForm() {
  const { id } = useParams();
  const editing = !!id;
  const navigate = useNavigate();
  const { advisorId } = useCurrentAdvisorId();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", company: "", job_title: "",
    primary_email: "", primary_phone: "",
    address_street: "", address_city: "", address_state: "", address_zip: "", address_country: "USA",
    date_of_birth: "", source: "", lifecycle_stage: "lead", tags: "",
  });

  useEffect(() => {
    if (!editing) return;
    (async () => {
      const { data } = await supabase.from("advisor_contacts").select("*").eq("id", id!).maybeSingle();
      if (data) {
        setForm({
          first_name: data.first_name ?? "", last_name: data.last_name ?? "",
          company: data.company ?? "", job_title: data.job_title ?? "",
          primary_email: data.primary_email ?? "", primary_phone: data.primary_phone ?? "",
          address_street: data.address_street ?? "", address_city: data.address_city ?? "",
          address_state: data.address_state ?? "", address_zip: data.address_zip ?? "",
          address_country: data.address_country ?? "USA",
          date_of_birth: data.date_of_birth ?? "", source: data.source ?? "",
          lifecycle_stage: data.lifecycle_stage ?? "lead",
          tags: (data.tags ?? []).join(", "),
        });
      }
    })();
  }, [editing, id]);

  async function save() {
    if (!advisorId) return toast.error("Advisor identity not loaded");
    if (!form.first_name && !form.last_name && !form.primary_email) {
      return toast.error("Provide at least a name or email");
    }
    setSaving(true);
    const payload = {
      ...form,
      advisor_id: advisorId,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      date_of_birth: form.date_of_birth || null,
    };
    const res = editing
      ? await supabase.from("advisor_contacts").update(payload).eq("id", id!).select().maybeSingle()
      : await supabase.from("advisor_contacts").insert(payload).select().maybeSingle();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(editing ? "Contact updated" : "Contact created");
    navigate(`/portal/advisor/contacts/${res.data!.id}`);
  }

  const F = (k: keyof typeof form) => ({
    value: form[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{editing ? "Edit Contact" : "Add Contact"}</h1>
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First name"><Input {...F("first_name")} /></Field>
          <Field label="Last name"><Input {...F("last_name")} /></Field>
          <Field label="Company"><Input {...F("company")} /></Field>
          <Field label="Job title"><Input {...F("job_title")} /></Field>
          <Field label="Primary email"><Input type="email" {...F("primary_email")} /></Field>
          <Field label="Primary phone"><Input {...F("primary_phone")} /></Field>
          <Field label="Date of birth"><Input type="date" {...F("date_of_birth")} /></Field>
          <Field label="Source"><Input placeholder="referral, website..." {...F("source")} /></Field>
        </div>
        <Field label="Street"><Input {...F("address_street")} /></Field>
        <div className="grid grid-cols-4 gap-4">
          <Field label="City"><Input {...F("address_city")} /></Field>
          <Field label="State"><Input {...F("address_state")} /></Field>
          <Field label="ZIP"><Input {...F("address_zip")} /></Field>
          <Field label="Country"><Input {...F("address_country")} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Lifecycle stage">
            <select className="w-full border rounded-md h-10 px-3" value={form.lifecycle_stage}
              onChange={(e) => setForm((f) => ({ ...f, lifecycle_stage: e.target.value }))}>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="client">Client</option>
              <option value="past_client">Past client</option>
            </select>
          </Field>
          <Field label="Tags (comma-separated)"><Input {...F("tags")} /></Field>
        </div>
        <div className="flex gap-2 justify-end pt-4">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={save} disabled={saving} style={{ backgroundColor: "#1A4D3E" }}>
            {saving ? "Saving..." : "Save Contact"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-700 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
