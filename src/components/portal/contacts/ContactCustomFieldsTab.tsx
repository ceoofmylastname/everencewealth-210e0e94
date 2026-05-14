import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FieldDef { id: string; label: string; field_key: string; field_type: string; }
interface FieldValue { id?: string; field_id: string; value: string | null; }

export default function ContactCustomFieldsTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [values, setValues] = useState<Record<string, FieldValue>>({});

  useEffect(() => { load(); }, [contactId]);
  async function load() {
    const [{ data: defs }, { data: vals }] = await Promise.all([
      supabase.from("advisor_contact_custom_fields").select("*").order("display_order"),
      supabase.from("advisor_contact_field_values").select("*").eq("contact_id", contactId),
    ]);
    setFields((defs as FieldDef[]) || []);
    const map: Record<string, FieldValue> = {};
    (vals || []).forEach((v: any) => { map[v.field_id] = v; });
    setValues(map);
  }
  async function setValue(field: FieldDef, val: string) {
    const existing = values[field.id];
    if (existing?.id) {
      await supabase.from("advisor_contact_field_values").update({ value: val }).eq("id", existing.id);
    } else {
      const { data } = await supabase.from("advisor_contact_field_values").insert({
        contact_id: contactId, field_id: field.id, advisor_id: advisorId, value: val,
      }).select().maybeSingle();
      if (data) setValues((p) => ({ ...p, [field.id]: data as any }));
    }
    toast.success("Saved");
  }

  if (fields.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-8 text-center text-sm text-gray-500">
        No custom fields defined yet. <Link to="/portal/advisor/contacts/settings" className="text-emerald-700 underline">Create some</Link>.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      {fields.map((f) => (
        <div key={f.id} className="grid grid-cols-3 gap-3 items-center">
          <label className="text-sm font-medium text-gray-700">{f.label}</label>
          <div className="col-span-2">
            <Input
              type={f.field_type === "number" ? "number" : f.field_type === "date" ? "date" : "text"}
              defaultValue={values[f.id]?.value ?? ""}
              onBlur={(e) => setValue(f, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
