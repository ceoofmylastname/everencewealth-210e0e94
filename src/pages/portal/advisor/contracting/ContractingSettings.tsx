import { useEffect, useState } from "react";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Loader2, Plus, Trash2, Save, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const BRAND = "#1A4D3E";

const PIPELINE_STAGES = [
  { key: "intake_submitted", label: "Intake Submitted" },
  { key: "agreement_pending", label: "Agreement Pending" },
  { key: "surelc_setup", label: "SureLC Setup" },
  { key: "bundle_selected", label: "Bundle Selected" },
  { key: "carrier_selection", label: "Carrier Selection" },
  { key: "contracting_submitted", label: "Contracting Submitted" },
  { key: "contracting_approved", label: "Contracting Approved" },
  { key: "completed", label: "Completed" },
];

interface Bundle {
  id: string;
  name: string;
  description: string | null;
  carrier_ids: string[];
  product_types: string[];
  is_active: boolean;
}

export default function ContractingSettings() {
  const { canManage, loading } = useContractingAuth();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);
  const [showNewBundle, setShowNewBundle] = useState(false);
  const [newBundle, setNewBundle] = useState({ name: "", description: "", product_types: "" });

  useEffect(() => {
    if (!loading && canManage) fetchBundles();
    else if (!loading) setBundlesLoading(false);
  }, [loading, canManage]);

  async function fetchBundles() {
    try {
      const { data } = await supabase.from("contracting_bundles").select("*").order("name");
      if (data) setBundles(data as Bundle[]);
    } catch (err) {
      console.error(err);
    } finally {
      setBundlesLoading(false);
    }
  }

  async function createBundle() {
    try {
      const { error } = await supabase.from("contracting_bundles").insert({
        name: newBundle.name,
        description: newBundle.description || null,
        product_types: newBundle.product_types.split(",").map(s => s.trim()).filter(Boolean),
      });
      if (error) throw error;
      toast.success("Bundle created");
      setShowNewBundle(false);
      setNewBundle({ name: "", description: "", product_types: "" });
      fetchBundles();
    } catch (err: any) {
      toast.error(err.message || "Failed to create bundle");
    }
  }

  async function deleteBundle(id: string) {
    try {
      await supabase.from("contracting_bundles").delete().eq("id", id);
      setBundles(prev => prev.filter(b => b.id !== id));
      toast.success("Bundle deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed");
    }
  }

  if (loading || bundlesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Settings className="h-10 w-10 mb-3" />
        <p className="text-lg font-medium">Access Restricted</p>
        <p className="text-sm">Only admins and contracting managers can access settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-[#1A4D3E]" />
        <h1 className="text-2xl font-bold text-gray-900">Contracting Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline Stages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Stages</CardTitle>
            <CardDescription>The onboarding pipeline follows these stages in order.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {PIPELINE_STAGES.map((stage, i) => (
                <li key={stage.key} className="flex items-center gap-3 text-sm">
                  <span className="h-6 w-6 rounded-full bg-[#1A4D3E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-700">{stage.label}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Bundle Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" /> Bundle Management
            </CardTitle>
            <CardDescription>Create and manage carrier bundles for agent onboarding.</CardDescription>
          </div>
          <Button onClick={() => setShowNewBundle(true)} style={{ background: BRAND }} className="text-white hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> New Bundle
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showNewBundle && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Create Bundle</h3>
              <Input placeholder="Bundle name" value={newBundle.name} onChange={e => setNewBundle(p => ({ ...p, name: e.target.value }))} />
              <Input placeholder="Description (optional)" value={newBundle.description} onChange={e => setNewBundle(p => ({ ...p, description: e.target.value }))} />
              <Input placeholder="Product types (comma-separated)" value={newBundle.product_types} onChange={e => setNewBundle(p => ({ ...p, product_types: e.target.value }))} />
              <div className="flex gap-2">
                <Button onClick={createBundle} disabled={!newBundle.name.trim()} style={{ background: BRAND }} className="text-white">
                  <Save className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button variant="ghost" onClick={() => setShowNewBundle(false)}>
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {bundles.map(bundle => (
              <div key={bundle.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{bundle.name}</h3>
                  {bundle.description && <p className="text-xs text-gray-500 mt-1">{bundle.description}</p>}
                  {bundle.product_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {bundle.product_types.map(pt => (
                        <span key={pt} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${BRAND}15`, color: BRAND }}>
                          {pt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteBundle(bundle.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {bundles.length === 0 && !showNewBundle && (
              <div className="text-center py-8 text-gray-400 text-sm">No bundles yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
