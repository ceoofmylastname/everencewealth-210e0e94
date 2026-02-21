import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useContractingAuth } from "@/hooks/useContractingAuth";
import { FileText, Download, Upload, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

const BRAND = "#1A4D3E";

interface Doc {
  id: string;
  agent_id: string;
  step_id: string | null;
  file_name: string;
  file_path: string;
  file_size: number | null;
  created_at: string;
  agent_name?: string;
  step_name?: string;
}

export default function ContractingDocuments() {
  const { contractingAgent, canViewAll, canManage, contractingRole, portalUser, loading: authLoading } = useContractingAuth();
  const isManagerOnly = contractingRole === "manager";
  const [docs, setDocs] = useState<Doc[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [steps, setSteps] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAgent, setFilterAgent] = useState("all");
  const [filterStep, setFilterStep] = useState("all");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading) fetchData();
  }, [authLoading, portalUser?.id]);

  async function fetchData() {
    try {
      let agentsQuery = canViewAll
        ? supabase.from("contracting_agents").select("id, first_name, last_name")
        : Promise.resolve({ data: [] as any[] });
      if (isManagerOnly && portalUser?.id && canViewAll) {
        agentsQuery = supabase.from("contracting_agents").select("id, first_name, last_name").eq("manager_id", portalUser.id);
      }

      const [docsRes, agentsRes, stepsRes] = await Promise.all([
        supabase.from("contracting_documents").select("*").order("created_at", { ascending: false }),
        agentsQuery,
        supabase.from("contracting_steps").select("id, title"),
      ]);

      const agentMap = new Map<string, string>();
      if (agentsRes.data) {
        for (const a of agentsRes.data) {
          agentMap.set(a.id, `${a.first_name} ${a.last_name}`);
          setAgents(agentsRes.data.map((a: any) => ({ id: a.id, name: `${a.first_name} ${a.last_name}` })));
        }
      }

      const stepMap = new Map<string, string>();
      if (stepsRes.data) {
        for (const s of stepsRes.data) stepMap.set(s.id, s.title);
        setSteps(stepsRes.data.map((s: any) => ({ id: s.id, title: s.title })));
      }

      if (docsRes.data) {
        setDocs(docsRes.data.map((d: any) => ({
          ...d,
          agent_name: agentMap.get(d.agent_id) || "Unknown",
          step_name: d.step_id ? stepMap.get(d.step_id) : "General",
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function downloadDoc(doc: Doc) {
    try {
      const { data, error } = await supabase.storage
        .from("contracting-documents")
        .createSignedUrl(doc.file_path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const agentId = canViewAll && filterAgent !== "all" ? filterAgent : contractingAgent?.id;
      if (!agentId) throw new Error("No agent selected");

      const path = `${agentId}/general/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("contracting-documents").upload(path, file);
      if (uploadError) throw uploadError;

      await supabase.from("contracting_documents").insert({
        agent_id: agentId,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        uploaded_by: contractingAgent?.id || agentId,
      });

      toast.success("Document uploaded");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const filtered = docs.filter(d => {
    if (search && !d.file_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAgent !== "all" && d.agent_id !== filterAgent) return false;
    if (filterStep !== "all" && d.step_id !== filterStep) return false;
    return true;
  });

  function formatSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} documents</p>
        </div>
        <label>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          <Button asChild disabled={uploading} style={{ background: BRAND }} className="text-white hover:opacity-90 cursor-pointer">
            <span><Upload className="h-4 w-4 mr-2" />{uploading ? "Uploading..." : "Upload"}</span>
          </Button>
        </label>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="pl-9" />
        </div>
        {canViewAll && (
          <Select value={filterAgent} onValueChange={setFilterAgent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Select value={filterStep} onValueChange={setFilterStep}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Steps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Steps</SelectItem>
            {steps.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No documents found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BRAND}10` }}>
                  <FileText className="h-5 w-5" style={{ color: BRAND }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</p>
                  <p className="text-xs text-gray-400">
                    {canViewAll && <>{doc.agent_name} • </>}
                    {doc.step_name} • {formatSize(doc.file_size)} • {format(new Date(doc.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => downloadDoc(doc)} className="shrink-0 text-gray-400 hover:text-gray-700">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
