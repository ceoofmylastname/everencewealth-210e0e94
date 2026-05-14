import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ContactPoliciesTab from "@/components/portal/contacts/ContactPoliciesTab";
import ContactNotesTab from "@/components/portal/contacts/ContactNotesTab";
import ContactAppointmentsTab from "@/components/portal/contacts/ContactAppointmentsTab";
import ContactDocumentsTab from "@/components/portal/contacts/ContactDocumentsTab";
import ContactAssociationsTab from "@/components/portal/contacts/ContactAssociationsTab";
import ContactRemindersTab from "@/components/portal/contacts/ContactRemindersTab";
import ContactCustomFieldsTab from "@/components/portal/contacts/ContactCustomFieldsTab";

const TABS = ["Overview", "Policies", "Notes", "Appointments", "Reminders", "Documents", "Associations", "Custom Fields"] as const;
type Tab = typeof TABS[number];

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { advisorId } = useCurrentAdvisorId();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    const { data, error } = await supabase.from("advisor_contacts").select("*").eq("id", id!).maybeSingle();
    if (error) toast.error(error.message);
    setContact(data);
    setLoading(false);
  }

  async function deleteContact() {
    if (!confirm("Delete this contact and all related data? This cannot be undone.")) return;
    const { error } = await supabase.from("advisor_contacts").delete().eq("id", id!);
    if (error) return toast.error(error.message);
    toast.success("Contact deleted");
    navigate("/portal/advisor/contacts");
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!contact) return <div className="p-8">Contact not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Link to="/portal/advisor/contacts" className="inline-flex items-center text-sm text-gray-600 mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to contacts
      </Link>

      <div className="bg-white border rounded-lg p-6 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {contact.first_name} {contact.last_name}
            </h1>
            {contact.job_title && <p className="text-gray-600 text-sm mt-1">{contact.job_title}{contact.company ? ` · ${contact.company}` : ""}</p>}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
              {contact.primary_email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{contact.primary_email}</span>}
              {contact.primary_phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" />{contact.primary_phone}</span>}
              {contact.address_city && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{[contact.address_city, contact.address_state].filter(Boolean).join(", ")}</span>}
              {contact.company && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" />{contact.company}</span>}
            </div>
            <div className="flex gap-1 mt-3">
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 capitalize">{contact.lifecycle_stage}</span>
              {(contact.tags || []).map((t: string) => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/portal/advisor/contacts/${id}/edit`)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button variant="outline" size="sm" onClick={deleteContact}>
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${tab === t ? "border-emerald-700 text-emerald-700" : "border-transparent text-gray-600 hover:text-gray-900"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        {tab === "Overview" && <OverviewTab contact={contact} />}
        {tab === "Policies" && advisorId && <ContactPoliciesTab contactId={id!} advisorId={advisorId} />}
        {tab === "Notes" && advisorId && <ContactNotesTab contactId={id!} advisorId={advisorId} />}
        {tab === "Appointments" && advisorId && <ContactAppointmentsTab contactId={id!} advisorId={advisorId} />}
        {tab === "Reminders" && advisorId && <ContactRemindersTab contactId={id!} advisorId={advisorId} />}
        {tab === "Documents" && advisorId && <ContactDocumentsTab contactId={id!} advisorId={advisorId} />}
        {tab === "Associations" && advisorId && <ContactAssociationsTab contactId={id!} advisorId={advisorId} />}
        {tab === "Custom Fields" && advisorId && <ContactCustomFieldsTab contactId={id!} advisorId={advisorId} />}
      </div>
    </div>
  );
}

function OverviewTab({ contact }: { contact: any }) {
  return (
    <div className="bg-white border rounded-lg p-6 space-y-4 text-sm">
      <Row label="Email" value={contact.primary_email} />
      <Row label="Phone" value={contact.primary_phone} />
      <Row label="Date of birth" value={contact.date_of_birth} />
      <Row label="Source" value={contact.source} />
      <Row label="Address" value={[contact.address_street, contact.address_city, contact.address_state, contact.address_zip, contact.address_country].filter(Boolean).join(", ")} />
      <Row label="Created" value={new Date(contact.created_at).toLocaleString()} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b last:border-0">
      <div className="text-gray-500 font-medium">{label}</div>
      <div className="col-span-2 text-gray-900">{value || <span className="text-gray-400">—</span>}</div>
    </div>
  );
}
