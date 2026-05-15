import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentAdvisorId } from "@/hooks/useCurrentAdvisorId";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  Smartphone,
  FileSpreadsheet,
  Contact as ContactIcon,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

// ---------------- Shared types ----------------
type PhoneEntry = { phone: string; label?: string | null };
type EmailEntry = { email: string; label?: string | null };
type ImportSource = "iphone_vcf" | "csv_upload" | "android_picker";

export type ParsedContact = {
  first_name: string | null;
  last_name: string | null;
  phones: PhoneEntry[];
  emails: EmailEntry[];
  source: ImportSource;
  /** Optional extra columns from CSV mapping */
  extra?: Record<string, string>;
};

// ---------------- CSV constants ----------------
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

// ---------------- Helpers ----------------
function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, "").trim();
}

// Android picker doesn't have ContactsManager types in TS lib
const androidPickerSupported =
  typeof navigator !== "undefined" &&
  "contacts" in navigator &&
  typeof window !== "undefined" &&
  "ContactsManager" in window;

// ---------------- Main component ----------------
export default function ContactImport() {
  const { advisorId } = useCurrentAdvisorId();
  const navigate = useNavigate();
  const [parsedRows, setParsedRows] = useState<ParsedContact[] | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<{ inserted: number; skipped: number } | null>(null);

  function showPreview(rows: ParsedContact[]) {
    if (rows.length === 0) {
      toast.error("No contacts found in that file");
      return;
    }
    setParsedRows(rows);
    setSelected(new Array(rows.length).fill(true));
  }

  function resetAll() {
    setParsedRows(null);
    setSelected([]);
    setDone(null);
  }

  async function runImport() {
    if (!advisorId) {
      toast.error("Advisor not resolved");
      return;
    }
    if (!parsedRows) return;
    const chosen = parsedRows.filter((_, i) => selected[i]);
    if (chosen.length === 0) {
      toast.error("Select at least one contact");
      return;
    }

    setImporting(true);
    let inserted = 0;
    let skipped = 0;

    try {
      // --- Duplicate check by primary phone ---
      const primaryPhones = chosen
        .map((c) => c.phones[0]?.phone)
        .filter((p): p is string => !!p);
      const dupSet = new Set<string>();
      if (primaryPhones.length > 0) {
        const { data: dups } = await supabase
          .from("advisor_contacts")
          .select("primary_phone")
          .eq("advisor_id", advisorId)
          .in("primary_phone", primaryPhones);
        (dups ?? []).forEach((d: any) => d.primary_phone && dupSet.add(d.primary_phone));
      }

      const toInsert = chosen.filter((c) => {
        const p = c.phones[0]?.phone;
        if (p && dupSet.has(p)) {
          skipped++;
          return false;
        }
        return true;
      });

      // --- Insert in batches of 25 with allSettled ---
      const BATCH = 25;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const slice = toInsert.slice(i, i + BATCH);
        const results = await Promise.allSettled(
          slice.map(async (c) => {
            const baseRow: Record<string, any> = {
              advisor_id: advisorId,
              first_name: c.first_name,
              last_name: c.last_name,
              primary_phone: c.phones[0]?.phone ?? null,
              primary_email: c.emails[0]?.email ?? null,
              source: c.source,
            };
            if (c.extra) {
              for (const [k, v] of Object.entries(c.extra)) {
                if (v && !(k in baseRow)) baseRow[k] = v;
              }
            }
            const { data: inserted, error } = await supabase
              .from("advisor_contacts")
              .insert(baseRow)
              .select("id")
              .single();
            if (error) throw error;
            const contactId = (inserted as any).id;

            const phoneRows = c.phones.map((p, idx) => ({
              advisor_id: advisorId,
              contact_id: contactId,
              phone: p.phone,
              label: p.label ?? null,
              is_primary: idx === 0,
            }));
            const emailRows = c.emails.map((e, idx) => ({
              advisor_id: advisorId,
              contact_id: contactId,
              email: e.email,
              label: e.label ?? null,
              is_primary: idx === 0,
            }));

            await Promise.all([
              phoneRows.length
                ? supabase.from("advisor_contact_phones").insert(phoneRows)
                : Promise.resolve(),
              emailRows.length
                ? supabase.from("advisor_contact_emails").insert(emailRows)
                : Promise.resolve(),
            ]);
          })
        );
        for (const r of results) {
          if (r.status === "fulfilled") inserted++;
          else skipped++;
        }
      }

      setDone({ inserted, skipped });
      toast.success(`Imported ${inserted} contacts. Skipped ${skipped} duplicates.`);
    } catch (err: any) {
      toast.error(err?.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  }

  // ---------------- Render ----------------
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link to="/portal/advisor/contacts" className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Contacts
        </Link>
      </div>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Import Contacts</h1>
        <p className="text-sm text-gray-500 mt-1">Bring in contacts from your iPhone, a CSV file, or your Android phone.</p>
      </div>

      {done ? (
        <div className="bg-white border rounded-2xl p-6 md:p-8 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">Import complete</h2>
          <p className="text-sm text-gray-600">
            Inserted <strong>{done.inserted}</strong> contacts. Skipped <strong>{done.skipped}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2 pt-2">
            <Button variant="outline" className="min-h-11" onClick={resetAll}>
              Import more
            </Button>
            <Button className="min-h-11" onClick={() => navigate("/portal/advisor/contacts")}>
              View contacts
            </Button>
          </div>
        </div>
      ) : parsedRows ? (
        <PreviewTable
          rows={parsedRows}
          selected={selected}
          onToggle={(idx) =>
            setSelected((p) => p.map((v, i) => (i === idx ? !v : v)))
          }
          onToggleAll={(v) => setSelected(parsedRows.map(() => v))}
          importing={importing}
          onCancel={resetAll}
          onImport={runImport}
        />
      ) : (
        <Tabs defaultValue="iphone" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid sm:grid-cols-none sm:auto-cols-max sm:grid-flow-col h-auto">
            <TabsTrigger value="iphone" className="gap-2 min-h-11">
              <Smartphone className="h-4 w-4" /> iPhone (.vcf)
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2 min-h-11">
              <FileSpreadsheet className="h-4 w-4" /> CSV
            </TabsTrigger>
            {androidPickerSupported && (
              <TabsTrigger value="android" className="gap-2 min-h-11">
                <ContactIcon className="h-4 w-4" /> Android Picker
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="iphone" className="mt-4">
            <IphoneTab onParsed={showPreview} />
          </TabsContent>
          <TabsContent value="csv" className="mt-4">
            <CsvTab onParsed={showPreview} />
          </TabsContent>
          {androidPickerSupported && (
            <TabsContent value="android" className="mt-4">
              <AndroidTab onParsed={showPreview} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}

// ---------------- Preview table ----------------
function PreviewTable({
  rows, selected, onToggle, onToggleAll, importing, onCancel, onImport,
}: {
  rows: ParsedContact[];
  selected: boolean[];
  onToggle: (idx: number) => void;
  onToggleAll: (v: boolean) => void;
  importing: boolean;
  onCancel: () => void;
  onImport: () => void;
}) {
  const checkedCount = selected.filter(Boolean).length;
  const allChecked = checkedCount === rows.length;

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-2xl overflow-hidden">
        <div className="px-4 md:px-5 py-3 border-b flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Review {rows.length} contacts</h2>
            <p className="text-xs text-gray-500 mt-1">Uncheck any rows you don't want to import.</p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => onToggleAll(!allChecked)}>
            {allChecked ? "Uncheck all" : "Check all"}
          </Button>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {rows.map((c, i) => (
            <label key={i} className="flex items-start gap-3 p-4 active:bg-gray-50">
              <Checkbox checked={selected[i]} onCheckedChange={() => onToggle(i)} className="mt-1" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {c.first_name || ""} {c.last_name || ""}
                </div>
                {c.phones[0] && <div className="text-xs text-gray-600 truncate">{c.phones[0].phone}</div>}
                {c.emails[0] && <div className="text-xs text-gray-600 truncate">{c.emails[0].email}</div>}
                {(c.phones.length > 1 || c.emails.length > 1) && (
                  <div className="text-[10px] text-gray-400 mt-1">
                    {c.phones.length > 1 && `+${c.phones.length - 1} phone${c.phones.length > 2 ? "s" : ""}`}
                    {c.phones.length > 1 && c.emails.length > 1 && " · "}
                    {c.emails.length > 1 && `+${c.emails.length - 1} email${c.emails.length > 2 ? "s" : ""}`}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs text-gray-600 uppercase">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3">First Name</th>
                <th className="px-4 py-3">Last Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">+ phones</th>
                <th className="px-4 py-3 text-right">+ emails</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Checkbox checked={selected[i]} onCheckedChange={() => onToggle(i)} />
                  </td>
                  <td className="px-4 py-2">{c.first_name}</td>
                  <td className="px-4 py-2">{c.last_name}</td>
                  <td className="px-4 py-2 text-gray-600">{c.phones[0]?.phone ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{c.emails[0]?.email ?? "—"}</td>
                  <td className="px-4 py-2 text-right text-gray-500">{Math.max(0, c.phones.length - 1)}</td>
                  <td className="px-4 py-2 text-right text-gray-500">{Math.max(0, c.emails.length - 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <Button variant="outline" className="w-full sm:w-auto min-h-11" onClick={onCancel} disabled={importing}>
          Cancel
        </Button>
        <Button onClick={onImport} disabled={importing || checkedCount === 0} className="w-full sm:w-auto min-h-11">
          {importing ? "Importing…" : `Import ${checkedCount} contacts`}
        </Button>
      </div>
    </div>
  );
}

// ---------------- iPhone tab ----------------
function IphoneTab({ onParsed }: { onParsed: (rows: ParsedContact[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      const rows = parseVcfText(text);
      onParsed(rows);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not parse vCard file");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="bg-white border rounded-2xl">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 text-left">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-emerald-700" />
              <span className="font-semibold text-gray-900 text-sm">How to export contacts from iPhone</span>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 text-sm text-gray-600 space-y-2 border-t pt-3">
              <div>
                <strong className="text-gray-900">Multiple contacts:</strong> Open Contacts app → tap{" "}
                <em>Lists</em> (top-left) → long-press a list → <em>Export</em> → email the .vcf to yourself → upload here.
              </div>
              <div>
                <strong className="text-gray-900">Single contact:</strong> Tap the contact → <em>Share Contact</em> → save the .vcf → upload here.
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      <div className="bg-white border-2 border-dashed rounded-2xl p-8 md:p-12 text-center">
        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-700 mb-4">Drop a .vcf file or click to browse</p>
        <input
          type="file"
          accept=".vcf,.vcard,text/vcard,text/x-vcard"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="block mx-auto text-sm max-w-full"
        />
        {busy && <p className="text-xs text-gray-500 mt-3">Parsing…</p>}
      </div>
    </div>
  );
}

// Hand-rolled vCard parser. Supports vCard 2.1, 3.0, and 4.0 for the fields
// we extract (FN, N, TEL, EMAIL). iPhone exports 3.0 by default; macOS exports
// 3.0; Android varies by app. Handles Apple's ITEM1.PROPERTY grouping and
// RFC 6350 line folding.
function parseVcfText(text: string): ParsedContact[] {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const rows: ParsedContact[] = [];
  let current: ParsedContact | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.toUpperCase() === "BEGIN:VCARD") {
      current = { first_name: null, last_name: null, phones: [], emails: [], source: "iphone_vcf" };
      continue;
    }
    if (line.toUpperCase() === "END:VCARD") {
      if (current && (current.first_name || current.last_name || current.phones.length || current.emails.length)) {
        rows.push(current);
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const left = line.slice(0, colonIdx);
    const value = line.slice(colonIdx + 1);

    const semiIdx = left.indexOf(";");
    const rawName = (semiIdx === -1 ? left : left.slice(0, semiIdx)).toUpperCase();
    const paramStr = semiIdx === -1 ? "" : left.slice(semiIdx + 1);
    const propName = rawName.replace(/^ITEM\d+\./, "");

    if (propName === "N") {
      const parts = value.split(";");
      current.last_name = (parts[0] || "").trim() || null;
      current.first_name = (parts[1] || "").trim() || null;
    } else if (propName === "FN" && !current.first_name && !current.last_name) {
      const v = value.trim();
      const idx = v.indexOf(" ");
      if (idx === -1) {
        current.first_name = v;
      } else {
        current.first_name = v.slice(0, idx);
        current.last_name = v.slice(idx + 1);
      }
    } else if (propName === "TEL") {
      const phone = normalizePhone(value.replace(/^tel:/i, ""));
      if (phone) current.phones.push({ phone, label: extractTypeLabel(paramStr) });
    } else if (propName === "EMAIL") {
      const email = value.trim();
      if (email) current.emails.push({ email, label: extractTypeLabel(paramStr) });
    }
  }
  return rows;
}

function extractTypeLabel(paramStr: string): string | null {
  if (!paramStr) return null;
  const noise = new Set(["pref", "internet", "voice"]);
  for (const part of paramStr.split(";")) {
    const eqIdx = part.indexOf("=");
    let values: string[];
    if (eqIdx === -1) {
      values = [part];
    } else {
      if (part.slice(0, eqIdx).toUpperCase() !== "TYPE") continue;
      values = part.slice(eqIdx + 1).split(",");
    }
    for (const v of values) {
      const lower = v.trim().toLowerCase().replace(/^"|"$/g, "");
      if (lower && !noise.has(lower)) return lower;
    }
  }
  return null;
}

// ---------------- CSV tab ----------------
function CsvTab({ onParsed }: { onParsed: (rows: ParsedContact[]) => void }) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const previewRows = useMemo(() => rows.slice(0, 5), [rows]);

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

  function buildAndPreview() {
    const parsed: ParsedContact[] = [];
    for (const row of rows) {
      const rec: Record<string, string> = {};
      for (const header of headers) {
        const target = mapping[header];
        if (!target || target === SKIP) continue;
        const val = (row[header] ?? "").toString().trim();
        if (val) rec[target] = val;
      }
      const first = rec.first_name || null;
      const last = rec.last_name || null;
      const phone = rec.primary_phone ? normalizePhone(rec.primary_phone) : "";
      const email = rec.primary_email?.trim() || "";
      if (!first && !last && !phone && !email) continue;

      const extra: Record<string, string> = {};
      for (const [k, v] of Object.entries(rec)) {
        if (k !== "first_name" && k !== "last_name" && k !== "primary_phone" && k !== "primary_email" && k !== "source") {
          extra[k] = v;
        }
      }

      parsed.push({
        first_name: first,
        last_name: last,
        phones: phone ? [{ phone, label: "mobile" }] : [],
        emails: email ? [{ email, label: "work" }] : [],
        source: "csv_upload",
        extra,
      });
    }
    onParsed(parsed);
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed rounded-2xl p-8 md:p-12 text-center">
        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-700 mb-4">Drop a CSV file or click to browse</p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          className="block mx-auto text-sm max-w-full"
        />
        <p className="text-xs text-gray-400 mt-3">Required: at least one of first name, last name, phone, or email per row.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-2xl overflow-hidden">
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
        <Button className="w-full sm:w-auto min-h-11" onClick={buildAndPreview}>
          Preview {rows.length} rows
        </Button>
      </div>
    </div>
  );
}

// ---------------- Android tab ----------------
function AndroidTab({ onParsed }: { onParsed: (rows: ParsedContact[]) => void }) {
  const [busy, setBusy] = useState(false);

  async function pick() {
    setBusy(true);
    try {
      const results = await (navigator as any).contacts.select(
        ["name", "tel", "email"],
        { multiple: true }
      );
      const rows: ParsedContact[] = (results || []).map((r: any) => {
        const fullName = (r.name?.[0] ?? "").trim();
        const idx = fullName.indexOf(" ");
        const first = idx === -1 ? fullName || null : fullName.slice(0, idx);
        const last = idx === -1 ? null : fullName.slice(idx + 1);
        const phones: PhoneEntry[] = (r.tel ?? [])
          .map((t: string) => normalizePhone(t))
          .filter((p: string) => !!p)
          .map((phone: string) => ({ phone, label: "mobile" }));
        const emails: EmailEntry[] = (r.email ?? [])
          .map((e: string) => e?.trim())
          .filter((e: string) => !!e)
          .map((email: string) => ({ email, label: "work" }));
        return {
          first_name: first || null,
          last_name: last,
          phones,
          emails,
          source: "android_picker" as const,
        };
      }).filter((c: ParsedContact) =>
        c.first_name || c.last_name || c.phones.length || c.emails.length
      );
      onParsed(rows);
    } catch (err: any) {
      toast.error(err?.message ?? "Could not open contact picker");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white border-2 border-dashed rounded-2xl p-8 md:p-12 text-center">
      <ContactIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
      <p className="text-sm text-gray-700 mb-4">Pick contacts directly from your Android phone</p>
      <Button onClick={pick} disabled={busy} className="min-h-11">
        {busy ? "Opening…" : "Pick from Phone"}
      </Button>
    </div>
  );
}
