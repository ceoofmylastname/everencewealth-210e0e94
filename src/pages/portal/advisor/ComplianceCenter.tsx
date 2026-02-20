import { useEffect, useState } from "react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Shield, FileText, CheckCircle, AlertCircle, Clock,
  Download, ExternalLink, Plus, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";

const BRAND_GREEN = "#1A4D3E";
const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

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

function isExpired(expiryDate: string | null) { if (!expiryDate) return false; return new Date(expiryDate) < new Date(); }

export default function ComplianceCenter() {
  const { portalUser } = usePortalAuth();
  const isAdmin = portalUser?.role === "admin";
  const [advisor, setAdvisor] = useState<any>(null);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [contracts, setContracts] = useState<CarrierContract[]>([]);
  const [trainingStats, setTrainingStats] = useState({ complete: 0, total: 0 });
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>("all");

  // Admin CRUD state
  const [showDocDialog, setShowDocDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [docForm, setDocForm] = useState({ ...defaultDocForm });
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<any>(null);
  const [contractForm, setContractForm] = useState({ ...defaultContractForm });

  useEffect(() => { if (portalUser) fetchAll(); }, [portalUser]);

  const fetchAll = async () => {
    setLoading(true);
    if (isAdmin) {
      const [advisorsRes, docsRes, contractsRes, trainingsRes] = await Promise.all([
        supabase.from("advisors").select("id, first_name, last_name, portal_user_id").eq("is_active", true).order("first_name"),
        supabase.from("compliance_documents").select("id, name, status, expiry_date, file_url, advisor_id"),
        supabase.from("carrier_contracts").select("id, carrier_name, status, contracted_date, advisor_id"),
        supabase.from("trainings").select("id").eq("status", "published"),
      ]);
      setAdvisors(advisorsRes.data ?? []);
      setDocuments((docsRes.data ?? []) as ComplianceDocument[]);
      setContracts((contractsRes.data ?? []) as CarrierContract[]);
      setTrainingStats({ complete: 0, total: trainingsRes.data?.length || 0 });
    } else {
      const { data: advisorData } = await supabase.from("advisors").select("*").eq("portal_user_id", portalUser!.id).maybeSingle();
      setAdvisor(advisorData);
      if (!advisorData) { setLoading(false); return; }
      const [docsRes, contractsRes, trainingsRes, progressRes] = await Promise.all([
        supabase.from("compliance_documents").select("id, name, status, expiry_date, file_url, advisor_id").eq("advisor_id", advisorData.id),
        supabase.from("carrier_contracts").select("id, carrier_name, status, contracted_date, advisor_id").eq("advisor_id", advisorData.id),
        supabase.from("trainings").select("id").eq("status", "published"),
        supabase.from("training_progress").select("id, completed").eq("advisor_id", advisorData.id),
      ]);
      setDocuments((docsRes.data || []) as ComplianceDocument[]);
      setContracts((contractsRes.data || []) as CarrierContract[]);
      setTrainingStats({ complete: progressRes.data?.filter(p => p.completed).length || 0, total: trainingsRes.data?.length || 0 });
    }
    setLoading(false);
  };

  const filteredDocs = selectedAdvisor === "all" ? documents : documents.filter(d => d.advisor_id === selectedAdvisor);
  const filteredContracts = selectedAdvisor === "all" ? contracts : contracts.filter(c => c.advisor_id === selectedAdvisor);

  const activeContracts = filteredContracts.filter(c => c.status === "active").length;
  const pendingContracts = filteredContracts.filter(c => c.status === "pending").length;
  const currentDocs = filteredDocs.filter(d => d.status === "current").length;
  const licenseDocs = filteredDocs.filter(d => d.name.toLowerCase().includes("license"));
  const licenseDoc = licenseDocs[0] || null;

  const totalDocs = filteredDocs.length || 1;
  const totalContracts = filteredContracts.length || 1;
  const totalTrainings = trainingStats.total || 1;
  const complianceScore = Math.round((activeContracts / totalContracts) * 30 + (trainingStats.complete / totalTrainings) * 30 + (currentDocs / totalDocs) * 40);

  function getAdvisorName(advisorId: string) { const a = advisors.find(x => x.id === advisorId); return a ? `${a.first_name} ${a.last_name}` : ""; }

  // Document CRUD
  function openAddDoc() { setEditingDoc(null); setDocForm({ ...defaultDocForm, advisor_id: advisors[0]?.id || "" }); setShowDocDialog(true); }
  function openEditDoc(d: ComplianceDocument) { setEditingDoc(d); setDocForm({ name: d.name, status: d.status, expiry_date: d.expiry_date || "", file_url: d.file_url || "", advisor_id: d.advisor_id }); setShowDocDialog(true); }
  async function handleSaveDoc() {
    if (!docForm.name.trim() || !docForm.advisor_id) { toast.error("Name and advisor are required"); return; }
    const payload = { name: docForm.name, status: docForm.status, expiry_date: docForm.expiry_date || null, file_url: docForm.file_url || null, advisor_id: docForm.advisor_id };
    if (editingDoc) {
      const { error } = await supabase.from("compliance_documents").update(payload).eq("id", editingDoc.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Document updated!");
    } else {
      const { error } = await supabase.from("compliance_documents").insert(payload);
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Document created!");
    }
    setShowDocDialog(false); fetchAll();
  }
  async function handleDeleteDoc(id: string) {
    const { error } = await supabase.from("compliance_documents").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Document deleted"); fetchAll();
  }

  // Contract CRUD
  function openAddContract() { setEditingContract(null); setContractForm({ ...defaultContractForm, advisor_id: advisors[0]?.id || "" }); setShowContractDialog(true); }
  function openEditContract(c: CarrierContract) { setEditingContract(c); setContractForm({ carrier_name: c.carrier_name, status: c.status, contracted_date: c.contracted_date || "", advisor_id: c.advisor_id }); setShowContractDialog(true); }
  async function handleSaveContract() {
    if (!contractForm.carrier_name.trim() || !contractForm.advisor_id) { toast.error("Carrier name and advisor are required"); return; }
    const payload = { carrier_name: contractForm.carrier_name, status: contractForm.status, contracted_date: contractForm.contracted_date || null, advisor_id: contractForm.advisor_id };
    if (editingContract) {
      const { error } = await supabase.from("carrier_contracts").update(payload).eq("id", editingContract.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Contract updated!");
    } else {
      const { error } = await supabase.from("carrier_contracts").insert(payload);
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Contract created!");
    }
    setShowContractDialog(false); fetchAll();
  }
  async function handleDeleteContract(id: string) {
    const { error } = await supabase.from("carrier_contracts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Contract deleted"); fetchAll();
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Compliance Center</h1>
          <p className="text-muted-foreground mt-1">Monitor licensing, contracting, and compliance requirements</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={openAddDoc} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}><Plus className="h-4 w-4" /> Add Document</button>
            <button onClick={openAddContract} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-all"><Plus className="h-4 w-4" /> Add Contract</button>
          </div>
        )}
      </div>

      {/* Admin filter */}
      {isAdmin && advisors.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Filter by Advisor:</label>
          <select value={selectedAdvisor} onChange={e => setSelectedAdvisor(e.target.value)} className={`rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
            <option value="all">All Advisors</option>
            {advisors.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
          </select>
        </div>
      )}

      {/* Document Dialog */}
      <Dialog open={showDocDialog} onOpenChange={setShowDocDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader><DialogTitle className="text-gray-900">{editingDoc ? "Edit Document" : "Add Compliance Document"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-600">Document Name *</label><Input value={docForm.name} onChange={e => setDocForm({ ...docForm, name: e.target.value })} placeholder="e.g. Life Insurance License" className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Advisor *</label>
              <select value={docForm.advisor_id} onChange={e => setDocForm({ ...docForm, advisor_id: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                <option value="">Select Advisor</option>
                {advisors.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Status</label>
                <select value={docForm.status} onChange={e => setDocForm({ ...docForm, status: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  <option value="current">Current</option><option value="pending">Pending</option><option value="expired">Expired</option><option value="not_required">Not Required</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-600">Expiry Date</label><Input type="date" value={docForm.expiry_date} onChange={e => setDocForm({ ...docForm, expiry_date: e.target.value })} className={inputCls} /></div>
            </div>
            <div><label className="text-sm font-medium text-gray-600">File URL</label><Input value={docForm.file_url} onChange={e => setDocForm({ ...docForm, file_url: e.target.value })} placeholder="https://..." className={inputCls} /></div>
            <button onClick={handleSaveDoc} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingDoc ? "Update" : "Create"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contract Dialog */}
      <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader><DialogTitle className="text-gray-900">{editingContract ? "Edit Contract" : "Add Carrier Contract"}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><label className="text-sm font-medium text-gray-600">Carrier Name *</label><Input value={contractForm.carrier_name} onChange={e => setContractForm({ ...contractForm, carrier_name: e.target.value })} className={inputCls} /></div>
            <div><label className="text-sm font-medium text-gray-600">Advisor *</label>
              <select value={contractForm.advisor_id} onChange={e => setContractForm({ ...contractForm, advisor_id: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                <option value="">Select Advisor</option>
                {advisors.map(a => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-600">Status</label>
                <select value={contractForm.status} onChange={e => setContractForm({ ...contractForm, status: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                  <option value="active">Active</option><option value="pending">Pending</option><option value="expired">Expired</option>
                </select>
              </div>
              <div><label className="text-sm font-medium text-gray-600">Contracted Date</label><Input type="date" value={contractForm.contracted_date} onChange={e => setContractForm({ ...contractForm, contracted_date: e.target.value })} className={inputCls} /></div>
            </div>
            <button onClick={handleSaveContract} className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>{editingContract ? "Update" : "Create"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compliance Score */}
      <Card><CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-sm font-medium text-muted-foreground">Compliance Score</p><p className="text-xs text-muted-foreground">Overall compliance health</p></div>
          <div className="text-4xl font-bold text-primary">{complianceScore}%</div>
        </div>
        <Progress value={complianceScore} className="h-3" />
        {complianceScore < 100 && (<div className="flex items-center gap-2 mt-4 text-sm text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2"><AlertCircle className="h-4 w-4 shrink-0" />Pending compliance items need attention</div>)}
      </CardContent></Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium text-muted-foreground">License Status</p><p className="text-lg font-semibold text-foreground capitalize">{licenseDoc ? licenseDoc.status : "N/A"}</p>{licenseDoc?.expiry_date && (<p className="text-xs text-muted-foreground">Expires: {new Date(licenseDoc.expiry_date).toLocaleDateString()}</p>)}</div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><FileText className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium text-muted-foreground">Active Contracts</p><p className="text-lg font-semibold text-foreground">{activeContracts}</p><p className="text-xs text-muted-foreground">{pendingContracts} pending</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-primary/10"><CheckCircle className="h-5 w-5 text-primary" /></div><div><p className="text-sm font-medium text-muted-foreground">Required Trainings</p><p className="text-lg font-semibold text-foreground">{trainingStats.complete}/{trainingStats.total}</p><p className="text-xs text-muted-foreground">Complete</p></div></div></CardContent></Card>
      </div>

      {/* Required Documents */}
      <Card><CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Required Documents</h2>
        </div>
        {filteredDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No compliance documents on file yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <div className="flex items-center gap-2">
                      {doc.expiry_date && (<p className="text-xs text-muted-foreground">{isExpired(doc.expiry_date) ? "Expired" : "Expires"}: {new Date(doc.expiry_date).toLocaleDateString()}</p>)}
                      {isAdmin && <p className="text-xs text-muted-foreground">• {getAdvisorName(doc.advisor_id)}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(doc.status)}
                  {doc.file_url && (<Button variant="ghost" size="sm" asChild><a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4 mr-1" /> Download</a></Button>)}
                  {isAdmin && (
                    <>
                      <button onClick={() => openEditDoc(doc)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this document?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteDoc(doc.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      {/* Carrier Contracting */}
      <Card><CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Carrier Contracting Status</h2>
        </div>
        {filteredContracts.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No carrier contracts on file yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {filteredContracts.map(c => (
              <div key={c.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${c.status === "active" ? "bg-green-500" : c.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.carrier_name}</p>
                    <div className="flex items-center gap-2">
                      {c.contracted_date && (<p className="text-xs text-muted-foreground">Contracted: {new Date(c.contracted_date).toLocaleDateString()}</p>)}
                      {isAdmin && <p className="text-xs text-muted-foreground">• {getAdvisorName(c.advisor_id)}</p>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(c.status)}
                  {isAdmin && (
                    <>
                      <button onClick={() => openEditContract(c)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"><Pencil className="h-3.5 w-3.5" /></button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild><button className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></AlertDialogTrigger>
                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this contract?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteContract(c.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent></Card>

      {/* Compliance Resources */}
      <Card><CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Resources</h2>
        <div className="space-y-2">
          {["State Licensing Requirements Guide", "Fiduciary Duty & Best Practices", "E&O Insurance Requirements"].map(title => (
            <a key={title} href="#" onClick={(e) => { e.preventDefault(); toast.info("Resource not available in demo"); }} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3"><FileText className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium text-foreground">{title}</p><p className="text-xs text-muted-foreground">PDF Document</p></div></div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
        </div>
      </CardContent></Card>
    </div>
  );
}
