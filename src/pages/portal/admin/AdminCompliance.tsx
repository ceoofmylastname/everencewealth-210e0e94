import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, FileText, CheckCircle, AlertCircle, Download, ExternalLink, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const BRAND_GREEN = "#1A4D3E";
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

interface ComplianceDocument { id: string; name: string; status: string; expiry_date: string | null; file_url: string | null; advisor_id: string; }
interface CarrierContract { id: string; carrier_name: string; status: string; contracted_date: string | null; advisor_id: string; }

const defaultDocForm = { name: "", status: "current", expiry_date: "", file_url: "", advisor_id: "" };
const defaultContractForm = { carrier_name: "", status: "active", contracted_date: "", advisor_id: "" };

function getStatusBadge(status: string) {
  switch (status) {
    case "active": case "current": return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "pending": return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    case "expired": return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>;
    case "not_required": return <Badge className="bg-muted text-muted-foreground border-border">Not Required</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminCompliance() {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [contracts, setContracts] = useState<CarrierContract[]>([]);
  const [nonResidentLicenses, setNonResidentLicenses] = useState<any[]>([]);
  const [complianceRecords, setComplianceRecords] = useState<any[]>([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("all");

  // Doc/Contract dialogs (existing)
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({ ...defaultDocForm });
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [contractForm, setContractForm] = useState({ ...defaultContractForm });

  // Non-resident license dialog
  const [showLicenseDialog, setShowLicenseDialog] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any>(null);
  const [licenseForm, setLicenseForm] = useState({ state: "", license_number: "", expiration_date: "", advisor_id: "" });

  // Compliance record dialog
  const [showCRDialog, setShowCRDialog] = useState(false);
  const [crAdvisorId, setCrAdvisorId] = useState("");
  const [crForm, setCrForm] = useState({ eo_insurance_exp: "", aml_training_date: "", background_check_date: "", ce_hours_completed: false, ce_hours_required: 0, ce_hours_earned: 0 });

  // Resident license dialog
  const [showResidentDialog, setShowResidentDialog] = useState(false);
  const [residentAdvisorId, setResidentAdvisorId] = useState("");
  const [residentForm, setResidentForm] = useState({ resident_state: "", resident_license_number: "", resident_license_exp: "", npn_number: "", ce_due_date: "" });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [advisorsRes, docsRes, contractsRes, nrlRes, crRes] = await Promise.all([
      supabase.from("advisors").select("id, first_name, last_name, portal_user_id, resident_state, resident_license_number, resident_license_exp, npn_number, ce_due_date").eq("is_active", true).order("first_name"),
      supabase.from("compliance_documents").select("id, name, status, expiry_date, file_url, advisor_id"),
      supabase.from("carrier_contracts").select("id, carrier_name, status, contracted_date, advisor_id"),
      supabase.from("non_resident_licenses").select("*").order("state"),
      supabase.from("compliance_records").select("*"),
    ]);
    setAdvisors(advisorsRes.data ?? []);
    setDocuments((docsRes.data ?? []) as ComplianceDocument[]);
    setContracts((contractsRes.data ?? []) as CarrierContract[]);
    setNonResidentLicenses(nrlRes.data ?? []);
    setComplianceRecords(crRes.data ?? []);
    setLoading(false);
  };

  const filteredDocs = selectedAdvisor === "all" ? documents : documents.filter(d => d.advisor_id === selectedAdvisor);
  const filteredContracts = selectedAdvisor === "all" ? contracts : contracts.filter(c => c.advisor_id === selectedAdvisor);
  const filteredNRL = selectedAdvisor === "all" ? nonResidentLicenses : nonResidentLicenses.filter((l: any) => l.advisor_id === selectedAdvisor);
  const activeContracts = filteredContracts.filter(c => c.status === "active").length;
  const pendingContracts = filteredContracts.filter(c => c.status === "pending").length;
  const currentDocs = filteredDocs.filter(d => d.status === "current").length;

  function getAdvisorName(advisorId: string) { const a = advisors.find(x => x.id === advisorId); return a ? `${a.first_name} ${a.last_name}` : ""; }

  // --- Document CRUD ---
  function openAddDoc() { setEditingDoc(null); setDocForm({ ...defaultDocForm, advisor_id: advisors[0]?.id || "" }); setShowDocDialog(true); }
  function openEditDoc(d: ComplianceDocument) { setEditingDoc(d); setDocForm({ name: d.name, status: d.status, expiry_date: d.expiry_date || "", file_url: d.file_url || "", advisor_id: d.advisor_id }); setShowDocDialog(true); }
  async function handleSaveDoc() {
    if (!docForm.name.trim() || !docForm.advisor_id) { toast.error("Name and advisor are required"); return; }
    const payload = { name: docForm.name, status: docForm.status, expiry_date: docForm.expiry_date || null, file_url: docForm.file_url || null, advisor_id: docForm.advisor_id };
    if (editingDoc) { await supabase.from("compliance_documents").update(payload).eq("id", editingDoc.id); toast.success("Document updated!"); }
    else { await supabase.from("compliance_documents").insert(payload); toast.success("Document created!"); }
    setShowDocDialog(false); fetchAll();
  }
  async function handleDeleteDoc(id: string) { await supabase.from("compliance_documents").delete().eq("id", id); toast.success("Document deleted"); fetchAll(); }

  // --- Contract CRUD ---
  function openAddContract() { setEditingContract(null); setContractForm({ ...defaultContractForm, advisor_id: advisors[0]?.id || "" }); setShowContractDialog(true); }
  function openEditContract(c: CarrierContract) { setEditingContract(c); setContractForm({ carrier_name: c.carrier_name, status: c.status, contracted_date: c.contracted_date || "", advisor_id: c.advisor_id }); setShowContractDialog(true); }
  async function handleSaveContract() {
    if (!contractForm.carrier_name.trim() || !contractForm.advisor_id) { toast.error("Carrier name and advisor are required"); return; }
    const payload = { carrier_name: contractForm.carrier_name, status: contractForm.status, contracted_date: contractForm.contracted_date || null, advisor_id: contractForm.advisor_id };
    if (editingContract) { await supabase.from("carrier_contracts").update(payload).eq("id", editingContract.id); toast.success("Contract updated!"); }
    else { await supabase.from("carrier_contracts").insert(payload); toast.success("Contract created!"); }
    setShowContractDialog(false); fetchAll();
  }
  async function handleDeleteContract(id: string) { await supabase.from("carrier_contracts").delete().eq("id", id); toast.success("Contract deleted"); fetchAll(); }

  // --- Non-Resident License CRUD ---
  function openAddLicense() { setEditingLicense(null); setLicenseForm({ state: "", license_number: "", expiration_date: "", advisor_id: advisors[0]?.id || "" }); setShowLicenseDialog(true); }
  function openEditLicense(l: any) { setEditingLicense(l); setLicenseForm({ state: l.state, license_number: l.license_number || "", expiration_date: l.expiration_date || "", advisor_id: l.advisor_id }); setShowLicenseDialog(true); }
  async function handleSaveLicense() {
    if (!licenseForm.state || !licenseForm.advisor_id) { toast.error("State and advisor are required"); return; }
    const payload = { state: licenseForm.state, license_number: licenseForm.license_number || null, expiration_date: licenseForm.expiration_date || null, advisor_id: licenseForm.advisor_id, status: "active" };
    if (editingLicense) { await supabase.from("non_resident_licenses").update(payload).eq("id", editingLicense.id); toast.success("License updated!"); }
    else { await supabase.from("non_resident_licenses").insert(payload); toast.success("License added!"); }
    setShowLicenseDialog(false); fetchAll();
  }
  async function handleDeleteLicense(id: string) { await supabase.from("non_resident_licenses").delete().eq("id", id); toast.success("License deleted"); fetchAll(); }

  // --- Compliance Record CRUD ---
  function openCRDialog(advisorId: string) {
    setCrAdvisorId(advisorId);
    const existing = complianceRecords.find((r: any) => r.advisor_id === advisorId);
    if (existing) {
      setCrForm({ eo_insurance_exp: existing.eo_insurance_exp || "", aml_training_date: existing.aml_training_date || "", background_check_date: existing.background_check_date || "", ce_hours_completed: existing.ce_hours_completed || false, ce_hours_required: existing.ce_hours_required || 0, ce_hours_earned: existing.ce_hours_earned || 0 });
    } else {
      setCrForm({ eo_insurance_exp: "", aml_training_date: "", background_check_date: "", ce_hours_completed: false, ce_hours_required: 0, ce_hours_earned: 0 });
    }
    setShowCRDialog(true);
  }
  async function handleSaveCR() {
    const payload = { advisor_id: crAdvisorId, eo_insurance_exp: crForm.eo_insurance_exp || null, aml_training_date: crForm.aml_training_date || null, background_check_date: crForm.background_check_date || null, ce_hours_completed: crForm.ce_hours_completed, ce_hours_required: crForm.ce_hours_required, ce_hours_earned: crForm.ce_hours_earned };
    const existing = complianceRecords.find((r: any) => r.advisor_id === crAdvisorId);
    if (existing) { await supabase.from("compliance_records").update(payload).eq("id", existing.id); toast.success("Compliance record updated!"); }
    else { await supabase.from("compliance_records").insert(payload); toast.success("Compliance record created!"); }
    setShowCRDialog(false); fetchAll();
  }

  // --- Resident License ---
  function openResidentDialog(advisorId: string) {
    setResidentAdvisorId(advisorId);
    const a = advisors.find(x => x.id === advisorId);
    setResidentForm({ resident_state: a?.resident_state || "", resident_license_number: a?.resident_license_number || "", resident_license_exp: a?.resident_license_exp || "", npn_number: a?.npn_number || "", ce_due_date: a?.ce_due_date || "" });
    setShowResidentDialog(true);
  }
  async function handleSaveResident() {
    const payload = { resident_state: residentForm.resident_state || null, resident_license_number: residentForm.resident_license_number || null, resident_license_exp: residentForm.resident_license_exp || null, npn_number: residentForm.npn_number || null, ce_due_date: residentForm.ce_due_date || null };
    await supabase.from("advisors").update(payload).eq("id", residentAdvisorId);
    toast.success("Resident license updated!");
    setShowResidentDialog(false); fetchAll();
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Manage Compliance</h1>
          <p className="text-muted-foreground mt-1">Manage documents, contracts, licenses, and compliance records</p>
        </div>
      </div>

      {/* Advisor filter */}
      {advisors.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Filter by Advisor:</label>
          <select value={selectedAdvisor} onChange={e => setSelectedAdvisor(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
            <option value="all">All Advisors</option>
            {advisors.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
          </select>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium text-muted-foreground">Current Documents</p><p className="text-lg font-semibold text-foreground">{currentDocs}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium text-muted-foreground">Active Contracts</p><p className="text-lg font-semibold text-foreground">{activeContracts}</p><p className="text-xs text-muted-foreground">{pendingContracts} pending</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><CheckCircle className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium text-muted-foreground">NR Licenses</p><p className="text-lg font-semibold text-foreground">{filteredNRL.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><AlertCircle className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Advisors</p><p className="text-lg font-semibold text-foreground">{advisors.length}</p></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="licenses">NR Licenses</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Records</TabsTrigger>
          <TabsTrigger value="resident">Resident Licenses</TabsTrigger>
        </TabsList>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Compliance Documents</h2>
              <button onClick={openAddDoc} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}><Plus className="h-4 w-4" /> Add Document</button>
            </div>
            {filteredDocs.length === 0 ? <p className="text-sm text-muted-foreground py-4">No documents.</p> : (
              <div className="divide-y divide-border">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{getAdvisorName(doc.advisor_id)}{doc.expiry_date && ` • Expires: ${new Date(doc.expiry_date).toLocaleDateString()}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      {doc.file_url && <Button variant="ghost" size="sm" asChild><a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-1" />Download</a></Button>}
                      <button onClick={() => openEditDoc(doc)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <AlertDialog><AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this document?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteDoc(doc.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Carrier Contracts</h2>
              <button onClick={openAddContract} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}><Plus className="h-4 w-4" /> Add Contract</button>
            </div>
            {filteredContracts.length === 0 ? <p className="text-sm text-muted-foreground py-4">No contracts.</p> : (
              <div className="divide-y divide-border">
                {filteredContracts.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${c.status === "active" ? "bg-green-500" : c.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.carrier_name}</p>
                        <p className="text-xs text-muted-foreground">{getAdvisorName(c.advisor_id)}{c.contracted_date && ` • ${new Date(c.contracted_date).toLocaleDateString()}`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(c.status)}
                      <button onClick={() => openEditContract(c)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      <AlertDialog><AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this contract?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteContract(c.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* NR Licenses Tab */}
        <TabsContent value="licenses">
          <Card><CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Non-Resident Licenses</h2>
              <button onClick={openAddLicense} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}><Plus className="h-4 w-4" /> Add License</button>
            </div>
            {filteredNRL.length === 0 ? <p className="text-sm text-muted-foreground py-4">No non-resident licenses.</p> : (
              <Table>
                <TableHeader><TableRow><TableHead>Advisor</TableHead><TableHead>State</TableHead><TableHead>License #</TableHead><TableHead>Expires</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredNRL.map((l: any) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm">{getAdvisorName(l.advisor_id)}</TableCell>
                      <TableCell className="font-medium">{l.state}</TableCell>
                      <TableCell>{l.license_number || "—"}</TableCell>
                      <TableCell>{l.expiration_date ? format(new Date(l.expiration_date), "MM/dd/yyyy") : "—"}</TableCell>
                      <TableCell>{getStatusBadge(l.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditLicense(l)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                          <AlertDialog><AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                            <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this license?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteLicense(l.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        {/* Compliance Records Tab */}
        <TabsContent value="compliance">
          <Card><CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Records</h2>
            <p className="text-sm text-muted-foreground mb-4">Set E&O, AML, background check, and CE hours per advisor.</p>
            <Table>
              <TableHeader><TableRow><TableHead>Advisor</TableHead><TableHead>E&O Exp</TableHead><TableHead>AML Training</TableHead><TableHead>Background Check</TableHead><TableHead>CE Hours</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {advisors.map(a => {
                  const cr = complianceRecords.find((r: any) => r.advisor_id === a.id);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.first_name} {a.last_name}</TableCell>
                      <TableCell>{cr?.eo_insurance_exp ? format(new Date(cr.eo_insurance_exp), "MM/dd/yyyy") : "—"}</TableCell>
                      <TableCell>{cr?.aml_training_date ? format(new Date(cr.aml_training_date), "MM/dd/yyyy") : "—"}</TableCell>
                      <TableCell>{cr?.background_check_date ? format(new Date(cr.background_check_date), "MM/dd/yyyy") : "—"}</TableCell>
                      <TableCell>{cr ? `${cr.ce_hours_earned}/${cr.ce_hours_required}` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <button onClick={() => openCRDialog(a.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* Resident Licenses Tab */}
        <TabsContent value="resident">
          <Card><CardContent className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Resident License Info</h2>
            <p className="text-sm text-muted-foreground mb-4">Update resident state, license number, expiration, NPN, and CE due date per advisor.</p>
            <Table>
              <TableHeader><TableRow><TableHead>Advisor</TableHead><TableHead>State</TableHead><TableHead>License #</TableHead><TableHead>Expires</TableHead><TableHead>NPN</TableHead><TableHead>CE Due</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {advisors.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.first_name} {a.last_name}</TableCell>
                    <TableCell>{a.resident_state || "—"}</TableCell>
                    <TableCell>{a.resident_license_number || "—"}</TableCell>
                    <TableCell>{a.resident_license_exp ? format(new Date(a.resident_license_exp), "MM/dd/yyyy") : "—"}</TableCell>
                    <TableCell>{a.npn_number || "—"}</TableCell>
                    <TableCell>{a.ce_due_date ? format(new Date(a.ce_due_date), "MM/dd/yyyy") : "—"}</TableCell>
                    <TableCell className="text-right">
                      <button onClick={() => openResidentDialog(a.id)} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      {/* Document Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editingDoc ? "Edit Document" : "Add Document"}</DialogTitle><DialogDescription>Enter document details.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-muted-foreground">Name *</label><Input value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">Advisor *</label><select value={docForm.advisor_id} onChange={e => setDocForm({ ...docForm, advisor_id: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}><option value="">Select</option>{advisors.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-muted-foreground">Status</label><select value={docForm.status} onChange={e => setDocForm({ ...docForm, status: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}><option value="current">Current</option><option value="pending">Pending</option><option value="expired">Expired</option><option value="not_required">Not Required</option></select></div>
              <div><label className="text-sm font-medium text-muted-foreground">Expiry</label><Input type="date" value={docForm.expiry_date} onChange={e => setDocForm({ ...docForm, expiry_date: e.target.value })} className={inputCls} /></div>
            </div>
            <div><label className="text-sm font-medium text-muted-foreground">File URL</label><Input value={docForm.file_url} onChange={e => setDocForm({ ...docForm, file_url: e.target.value })} className={inputCls} /></div>
            <Button onClick={handleSaveDoc} className="w-full">{editingDoc ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editingContract ? "Edit Contract" : "Add Contract"}</DialogTitle><DialogDescription>Enter contract details.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-muted-foreground">Carrier Name *</label><Input value={contractForm.carrier_name} onChange={e => setContractForm({ ...contractForm, carrier_name: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">Advisor *</label><select value={contractForm.advisor_id} onChange={e => setContractForm({ ...contractForm, advisor_id: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}><option value="">Select</option>{advisors.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-muted-foreground">Status</label><select value={contractForm.status} onChange={e => setContractForm({ ...contractForm, status: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}><option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option></select></div>
              <div><label className="text-sm font-medium text-muted-foreground">Date</label><Input type="date" value={contractForm.contracted_date} onChange={e => setContractForm({ ...contractForm, contracted_date: e.target.value })} className={inputCls} /></div>
            </div>
            <Button onClick={handleSaveContract} className="w-full">{editingContract ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* License Dialog */}
      <Dialog open={showLicenseDialog} onOpenChange={setShowLicenseDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>{editingLicense ? "Edit License" : "Add NR License"}</DialogTitle><DialogDescription>Enter license details.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-muted-foreground">Advisor *</label><select value={licenseForm.advisor_id} onChange={e => setLicenseForm({ ...licenseForm, advisor_id: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}><option value="">Select</option>{advisors.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}</select></div>
            <div><label className="text-sm font-medium text-muted-foreground">State *</label><select value={licenseForm.state} onChange={e => setLicenseForm({ ...licenseForm, state: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}><option value="">Select</option>{US_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="text-sm font-medium text-muted-foreground">License #</label><Input value={licenseForm.license_number} onChange={e => setLicenseForm({ ...licenseForm, license_number: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">Expiration</label><Input type="date" value={licenseForm.expiration_date} onChange={e => setLicenseForm({ ...licenseForm, expiration_date: e.target.value })} className={inputCls} /></div>
            <Button onClick={handleSaveLicense} className="w-full">{editingLicense ? "Update" : "Add License"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compliance Record Dialog */}
      <Dialog open={showCRDialog} onOpenChange={setShowCRDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Compliance Record — {getAdvisorName(crAdvisorId)}</DialogTitle><DialogDescription>Set compliance dates and CE hours.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-muted-foreground">E&O Insurance Exp</label><Input type="date" value={crForm.eo_insurance_exp} onChange={e => setCrForm({ ...crForm, eo_insurance_exp: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">AML Training Date</label><Input type="date" value={crForm.aml_training_date} onChange={e => setCrForm({ ...crForm, aml_training_date: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">Background Check Date</label><Input type="date" value={crForm.background_check_date} onChange={e => setCrForm({ ...crForm, background_check_date: e.target.value })} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-muted-foreground">CE Required</label><Input type="number" value={crForm.ce_hours_required} onChange={e => setCrForm({ ...crForm, ce_hours_required: Number(e.target.value) })} className={inputCls} /></div>
              <div><label className="text-sm font-medium text-muted-foreground">CE Earned</label><Input type="number" value={crForm.ce_hours_earned} onChange={e => setCrForm({ ...crForm, ce_hours_earned: Number(e.target.value) })} className={inputCls} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={crForm.ce_hours_completed} onChange={e => setCrForm({ ...crForm, ce_hours_completed: e.target.checked })} className="rounded" />
              <label className="text-sm text-muted-foreground">CE Hours Completed</label>
            </div>
            <Button onClick={handleSaveCR} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resident License Dialog */}
      <Dialog open={showResidentDialog} onOpenChange={setShowResidentDialog}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Resident License — {getAdvisorName(residentAdvisorId)}</DialogTitle><DialogDescription>Update resident license info.</DialogDescription></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-muted-foreground">State</label><select value={residentForm.resident_state} onChange={e => setResidentForm({ ...residentForm, resident_state: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}><option value="">Select</option>{US_STATES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="text-sm font-medium text-muted-foreground">License Number</label><Input value={residentForm.resident_license_number} onChange={e => setResidentForm({ ...residentForm, resident_license_number: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">Expiration</label><Input type="date" value={residentForm.resident_license_exp} onChange={e => setResidentForm({ ...residentForm, resident_license_exp: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">NPN Number</label><Input value={residentForm.npn_number} onChange={e => setResidentForm({ ...residentForm, npn_number: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-muted-foreground">CE Due Date</label><Input type="date" value={residentForm.ce_due_date} onChange={e => setResidentForm({ ...residentForm, ce_due_date: e.target.value })} className={inputCls} /></div>
            <Button onClick={handleSaveResident} className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
