import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface FieldDef {
  id: string;
  label: string;
  field_key: string;
  field_type: string;
  display_order: number | null;
}

const FIELD_TYPES = ["text", "number", "date", "url", "email", "textarea"];

export default function ContactCustomFields() {
  const { advisorId, loading: authLoading } = useCurrentAdvisorId();
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState("text");

  useEffect(() => {
    if (!advisorId) return;
    load();
  }, [advisorId]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("advisor_contact_custom_fields")
      .select("id, label, field_key, field_type, display_order")
      .order("display_order", { ascending: true });
    if (error) toast.error(error.message);
    setFields((data as FieldDef[]) || []);
    setLoading(false);
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60);
  }

  async function addField() {
    if (!advisorId || !newLabel.trim()) return;
    const key = slugify(newLabel);
    if (!key) {
      toast.error("Invalid field name");
      return;
    }
    const { error } = await supabase.from("advisor_contact_custom_fields").insert({
      advisor_id: advisorId,
      label: newLabel.trim(),
      field_key: key,
      field_type: newType,
      display_order: fields.length,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewLabel("");
    setNewType("text");
    toast.success("Field added");
    load();
  }

  async function removeField(id: string) {
    if (!confirm("Delete this custom field? All values across contacts will be removed.")) return;
    const { error } = await supabase.from("advisor_contact_custom_fields").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Field deleted");
    load();
  }

  if (authLoading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/portal/advisor/contacts" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Custom Fields</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define your own fields to capture data unique to your practice. These appear on every contact's Custom Fields tab.
        </p>
      </div>

      <div className="bg-white border rounded-lg p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-900">Add a new field</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Field label (e.g. Spouse Name)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="flex-1"
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <Button onClick={addField} disabled={!newLabel.trim()}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b text-sm font-bold text-gray-900">
          Your Fields {fields.length > 0 && <span className="text-gray-400 font-normal">({fields.length})</span>}
        </div>
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading…</div>
        ) : fields.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No custom fields yet. Add one above.</div>
        ) : (
          <ul className="divide-y">
            {fields.map((f) => (
              <li key={f.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{f.label}</p>
                  <p className="text-xs text-gray-500">
                    <code>{f.field_key}</code> · {f.field_type}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeField(f.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}