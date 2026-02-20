import { useEffect, useState } from "react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, CheckCircle, Clock, AlertTriangle, Plus, Pencil, Trash2, ExternalLink, Copy, FileText } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, format } from "date-fns";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

interface LicenseRow {
  id: string;
  state: string;
  licenseNumber: string;
  expirationDate: string | null;
  isResident: boolean;
  status: "active" | "expiring_soon" | "expired";
  daysLeft: number | null;
}

interface ComplianceRecord {
  eo_insurance_exp: string | null;
  aml_training_date: string | null;
  background_check_date: string | null;
  ce_hours_completed: boolean;
  ce_hours_required: number;
  ce_hours_earned: number;
}

function calcStatus(expDate: string | null): { status: "active" | "expiring_soon" | "expired"; daysLeft: number | null } {
  if (!expDate) return { status: "active", daysLeft: null };
  const days = differenceInDays(new Date(expDate), new Date());
  if (days < 0) return { status: "expired", daysLeft: days };
  if (days <= 90) return { status: "expiring_soon", daysLeft: days };
  return { status: "active", daysLeft: days };
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "active": return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    case "expiring_soon": return <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Clock className="h-3 w-3 mr-1" />Expiring Soon</Badge>;
    case "expired": return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" />Expired</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

const inputCls = "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 rounded-lg";

export default function ComplianceCenter() {
  const { portalUser } = usePortalAuth();
  const [loading, setLoading] = useState(true);
  const [advisor, setAdvisor] = useState<any>(null);
  const [nonResidentLicenses, setNonResidentLicenses] = useState<any[]>([]);
  const [complianceRecord, setComplianceRecord] = useState<ComplianceRecord | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [editingLicense, setEditingLicense] = useState<any>(null);
  const [form, setForm] = useState({ state: "", license_number: "", expiration_date: "" });

  useEffect(() => { if (portalUser) fetchAll(); }, [portalUser]);

  const fetchAll = async () => {
    setLoading(true);
    const { data: advisorData } = await supabase
      .from("advisors")
      .select("id, resident_state, resident_license_number, resident_license_exp, npn_number, ce_due_date")
      .eq("portal_user_id", portalUser!.id)
      .maybeSingle();
    setAdvisor(advisorData);
    if (!advisorData) { setLoading(false); return; }

    const [nrlRes, crRes] = await Promise.all([
      supabase.from("non_resident_licenses").select("*").eq("advisor_id", advisorData.id).order("state"),
      supabase.from("compliance_records").select("*").eq("advisor_id", advisorData.id).maybeSingle(),
    ]);
    setNonResidentLicenses(nrlRes.data ?? []);
    setComplianceRecord(crRes.data as ComplianceRecord | null);
    setLoading(false);
  };

  // Build merged license list
  const allLicenses: LicenseRow[] = [];
  if (advisor?.resident_state) {
    const { status, daysLeft } = calcStatus(advisor.resident_license_exp);
    allLicenses.push({
      id: "resident",
      state: advisor.resident_state,
      licenseNumber: advisor.npn_number || advisor.resident_license_number || "",
      expirationDate: advisor.resident_license_exp,
      isResident: true,
      status,
      daysLeft,
    });
  }
  nonResidentLicenses.forEach((l: any) => {
    const { status, daysLeft } = calcStatus(l.expiration_date);
    allLicenses.push({
      id: l.id,
      state: l.state,
      licenseNumber: l.license_number || "",
      expirationDate: l.expiration_date,
      isResident: false,
      status,
      daysLeft,
    });
  });

  const totalLicenses = allLicenses.length;
  const activeLicenses = allLicenses.filter(l => l.status === "active").length;
  const expiringSoon = allLicenses.filter(l => l.status === "expiring_soon").length;
  const hasAlert = allLicenses.some(l => l.status === "expired" || l.status === "expiring_soon");

  // CRUD handlers
  function openAdd() {
    setEditingLicense(null);
    setForm({ state: "", license_number: "", expiration_date: "" });
    setShowDialog(true);
  }
  function openEdit(l: any) {
    setEditingLicense(l);
    setForm({ state: l.state, license_number: l.license_number || "", expiration_date: l.expiration_date || "" });
    setShowDialog(true);
  }
  async function handleSave() {
    if (!form.state) { toast.error("State is required"); return; }
    const payload = { state: form.state, license_number: form.license_number || null, expiration_date: form.expiration_date || null, advisor_id: advisor.id, status: "active" };
    if (editingLicense) {
      const { error } = await supabase.from("non_resident_licenses").update(payload).eq("id", editingLicense.id);
      if (error) { toast.error("Failed to update license"); return; }
      toast.success("License updated");
    } else {
      const { error } = await supabase.from("non_resident_licenses").insert(payload);
      if (error) { toast.error("Failed to add license"); return; }
      toast.success("License added");
    }
    setShowDialog(false);
    fetchAll();
  }
  async function handleDelete(id: string) {
    const { error } = await supabase.from("non_resident_licenses").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("License deleted");
    fetchAll();
  }

  function copyText(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-8">
      {/* A. Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Shield className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Compliance</h1>
            <p className="text-muted-foreground mt-1">Manage licenses and stay compliant</p>
          </div>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add License</Button>
      </div>

      {/* B. Alert Banner */}
      {hasAlert && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">License Attention Required</p>
                <p className="text-sm text-red-700">You have licenses that are expired or expiring soon.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* C. License Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-blue-100"><Shield className="h-5 w-5 text-blue-600" /></div><div><p className="text-sm font-medium text-muted-foreground">Total Licenses</p><p className="text-2xl font-bold text-foreground">{totalLicenses}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-green-100"><CheckCircle className="h-5 w-5 text-green-600" /></div><div><p className="text-sm font-medium text-muted-foreground">Active Licenses</p><p className="text-2xl font-bold text-foreground">{activeLicenses}</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-amber-100"><Clock className="h-5 w-5 text-amber-600" /></div><div><p className="text-sm font-medium text-muted-foreground">Expiring Soon</p><p className="text-2xl font-bold text-foreground">{expiringSoon}</p></div></div></CardContent></Card>
      </div>

      {/* D. License Details Table */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">License Details</h2>
          {allLicenses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No licenses on file. Add your first license above.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>State</TableHead>
                  <TableHead>NPN Number</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allLicenses.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">
                      {l.state}
                      {l.isResident && <Badge variant="outline" className="ml-2 text-xs">Resident</Badge>}
                    </TableCell>
                    <TableCell>{l.licenseNumber || "—"}</TableCell>
                    <TableCell>{l.expirationDate ? format(new Date(l.expirationDate), "MM/dd/yyyy") : "—"}</TableCell>
                    <TableCell><StatusBadge status={l.status} /></TableCell>
                    <TableCell>
                      {l.daysLeft !== null ? (
                        <span className={l.daysLeft < 0 ? "text-red-600 font-semibold" : l.daysLeft <= 90 ? "text-amber-600 font-semibold" : "text-green-600"}>
                          {l.daysLeft < 0 ? `${Math.abs(l.daysLeft)}d overdue` : `${l.daysLeft}d`}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <a href="https://pdb.nipr.com/" target="_blank" rel="noopener noreferrer">Renew</a>
                        </Button>
                        {!l.isResident && (
                          <>
                            <button onClick={() => {
                              const nrl = nonResidentLicenses.find((x: any) => x.id === l.id);
                              if (nrl) openEdit(nrl);
                            }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Delete this license?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(l.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction></AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* E. Add/Edit License Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLicense ? "Edit License" : "Add Non-Resident License"}</DialogTitle>
            <DialogDescription>Enter the license details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">State *</label>
              <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm ${inputCls}`}>
                <option value="">Select State</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">NPN Number</label>
              <Input value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} placeholder="12345678" className={inputCls} />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Expiration Date</label>
              <Input type="date" value={form.expiration_date} onChange={e => setForm({ ...form, expiration_date: e.target.value })} className={inputCls} />
            </div>
            <Button onClick={handleSave} className="w-full">{editingLicense ? "Update" : "Add License"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* F. Compliance Records */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Records</h2>
          <p className="text-xs text-muted-foreground mb-4">Managed by your administrator</p>
          {!complianceRecord ? (
            <p className="text-sm text-muted-foreground py-4">No compliance records on file yet. Contact your admin.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground">E&O Insurance Expiration</p>
                <p className="text-sm font-semibold text-foreground mt-1">{complianceRecord.eo_insurance_exp ? format(new Date(complianceRecord.eo_insurance_exp), "MM/dd/yyyy") : "Not set"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground">AML Training Date</p>
                <p className="text-sm font-semibold text-foreground mt-1">{complianceRecord.aml_training_date ? format(new Date(complianceRecord.aml_training_date), "MM/dd/yyyy") : "Not set"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground">Background Check Date</p>
                <p className="text-sm font-semibold text-foreground mt-1">{complianceRecord.background_check_date ? format(new Date(complianceRecord.background_check_date), "MM/dd/yyyy") : "Not set"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-muted-foreground">CE Hours Progress</p>
                <div className="mt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{complianceRecord.ce_hours_earned}/{complianceRecord.ce_hours_required} hours</span>
                    {complianceRecord.ce_hours_completed && <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Complete</Badge>}
                  </div>
                  <Progress value={complianceRecord.ce_hours_required > 0 ? (complianceRecord.ce_hours_earned / complianceRecord.ce_hours_required) * 100 : 0} className="h-2" />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* G. Compliance Resources */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Resources</h2>
          <div className="space-y-4">
            {/* FastrackCE */}
            <div className="p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">FastrackCE — Continuing Education</p>
                  <p className="text-sm text-muted-foreground mt-1">Get <span className="font-bold text-blue-700">20% OFF</span> all CE courses</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-mono">BB25HOF</code>
                    <button onClick={() => copyText("BB25HOF")} className="p-1 rounded hover:bg-muted"><Copy className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.fastrackce.com/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Visit</a>
                </Button>
              </div>
            </div>

            {/* ExamFX */}
            <div className="p-4 rounded-lg border bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">ExamFX — Pre-Licensing Courses</p>
                  <p className="text-sm text-muted-foreground mt-1">Get <span className="font-bold text-emerald-700">55% OFF</span> — mention "Insurance Courses"</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Contact:</span>
                    <code className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-sm font-mono">kjenson@lifeconetwork.com</code>
                    <button onClick={() => copyText("kjenson@lifeconetwork.com")} className="p-1 rounded hover:bg-muted"><Copy className="h-3.5 w-3.5 text-muted-foreground" /></button>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.examfx.com/product-registration" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-3.5 w-3.5 mr-1" />Visit</a>
                </Button>
              </div>
            </div>

            {/* Resource links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="https://www.naic.org/state_web_map.htm" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <FileText className="h-4 w-4 text-primary" />
                <div><p className="text-sm font-medium text-foreground">State CE Requirements</p><p className="text-xs text-muted-foreground">NAIC interactive map</p></div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </a>
              <a href="https://pdb.nipr.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <Shield className="h-4 w-4 text-primary" />
                <div><p className="text-sm font-medium text-foreground">NAIC Producer Database</p><p className="text-xs text-muted-foreground">Verify license status via NIPR</p></div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
