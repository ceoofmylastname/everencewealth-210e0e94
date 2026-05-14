import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const TARGET_FIELDS = [
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "primary_email", label: "Email" },
  { key: "primary_phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "job_title", label: "Job Title" },
  { key: "address_line1", label: "Address Line 1" },
  { key: "address_line2", label: "Address Line 2" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "postal_code", label: "Postal Code" },
  { key: "country", label: "Country" },
  { key: "date_of_birth", label: "Date of Birth (YYYY-MM-DD)" },
  { key: "source", label: "Source" },
  { key: "lifecycle_stage", label: "Lifecycle Stage" },
  { key: "notes_summary", label: "Notes Summary" },
] as const;

const SKIP = "__skip__";

function autoMatch(header: string): string {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, "");
  const map: Record<string, string> = {
    firstname: "first_name", fname: "first_name", given: "first_name",
    lastname: "last_name", lname: "last_name", surname: "last_name", family: "last_name",
    email: "primary_email", emailaddress: "primary_email",
    phone: "primary_phone", phonenumber: "primary_phone", mobile: "primary_phone", cell: "primary_phone",
    company: "company", organization: "company", org: "company",
    jobtitle: "job_title", title: "job_title", role: "job_title",
    address: "address_line1", address1: "address_line1", street: "address_line1",
    address2: "address_line2",
    city: "city",
    state: "state", province: "state",
    zip: "postal_code", zipcode: "postal_code", postal: "postal_code", postalcode: "postal_code",
    country: "country",
    dob: "date_of_birth", birthday: "date_of_birth", dateofbirth: "date_of_birth",
    source: "source", leadsource: "source",
    stage: "lifecycle_stage", lifecycle: "lifecycle_stage",
    notes: "notes_summary", note: "notes_summary",
  };
  return map[h] ?? SKIP;
}

export default function ContactImport() {
  const { advisorId } = useCurrentAdvisorId();
  const navigate = useNavigate();
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<{ inserted: number; skipped: number } | null>(null);

  function onFile(file: File) {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const hs = res.meta.fields || [];
        setHeaders(hs);
        setRows(res.data);
        const m: Record<string, string> = {};
        hs.forEach((h) => { m[h] = autoMatch(h); });
        setMapping(m);
      },
      error: (err) => toast.error(err.message),
    });
  }

  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

  async function runImport() {
    if (!advisorId) {
      toast.error("Advisor not resolved");
      return;
    }
    setImporting(true);
    let inserted = 0;
    let skipped = 0;
    const batchSize = 100;
    const records: any[] = [];

    for (const row of rows) {
      const rec: Record<string, any> = { advisor_id: advisorId };
      for (const header of headers) {
        const target = mapping[header];
        if (!target || target === SKIP) continue;
        const val = (row[header] ?? "").toString().trim();
        if (val) rec[target] = val;
      }
      if (!rec.first_name && !rec.last_name && !rec.primary_email) {
        skipped++;
        continue;
      }
      records.push(rec);
    }

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error, data } = await supabase.from("advisor_contacts").insert(batch).select("id");
      if (error) {
        toast.error(`Batch ${i / batchSize + 1} failed: ${error.message}`);
        skipped += batch.length;
      } else {
        inserted += data?.length ?? 0;
      }
    }

    setDone({ inserted, skipped });
    setImporting(false);
    toast.success(`Imported ${inserted} contacts`);
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/portal/advisor/contacts" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Link>
      </div>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Import Contacts</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a CSV, map columns, and bulk-import to your contacts.</p>
      </div>

      {done ? (
        <div className="bg-white border rounded-lg p-6 md:p-8 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">Import complete</h2>
          <p className="text-sm text-gray-600">
            Inserted <strong>{done.inserted}</strong> contacts. Skipped <strong>{done.skipped}</strong> rows.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
            <Button variant="outline" className="min-h-11" onClick={() => { setDone(null); setRows([]); setHeaders([]); setMapping({}); }}>
              Import another file
            </Button>
            <Button className="min-h-11" onClick={() => navigate("/portal/advisor/contacts")}>View contacts</Button>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-lg p-8 md:p-12 text-center">
          <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
          <p className="text-sm text-gray-700 mb-4">Drop a CSV file or click to browse</p>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            className="block mx-auto text-sm max-w-full"
          />
          <p className="text-xs text-gray-400 mt-3">Required: at least one of first name, last name, or email per row.</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 md:px-5 py-3 border-b">
              <h2 className="text-sm font-bold text-gray-900">Map columns</h2>
              <p className="text-xs text-gray-500 mt-1">{rows.length} rows detected. Match each CSV column to a contact field, or skip it.</p>
            </div>
            <div className="divide-y">
              {headers.map((h) => (
                <div key={h} className="px-4 md:px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 sm:items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{h}</p>
                    <p className="text-xs text-gray-400 truncate">e.g. {previewRows[0]?.[h] || "—"}</p>
                  </div>
                  <select
                    value={mapping[h] ?? SKIP}
                    onChange={(e) => setMapping((p) => ({ ...p, [h]: e.target.value }))}
                    className="border rounded-md px-3 py-2 text-sm h-10 w-full bg-white"
                  >
                    <option value={SKIP}>— Skip this column —</option>
                    {TARGET_FIELDS.map((f) => (
                      <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" className="w-full sm:w-auto min-h-11" onClick={() => { setRows([]); setHeaders([]); setMapping({}); }}>
              Cancel
            </Button>
            <Button onClick={runImport} disabled={importing} className="w-full sm:w-auto min-h-11">
              {importing ? "Importing…" : `Import ${rows.length} rows`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}