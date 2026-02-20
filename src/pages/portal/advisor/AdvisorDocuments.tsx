import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FolderOpen, Upload, Download, Trash2, Search, FileIcon, Filter } from "lucide-react";
import { toast } from "sonner";

interface Doc {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  document_type: string;
  is_client_visible: boolean;
  client_id: string;
  policy_id: string | null;
  uploaded_by: string;
  created_at: string;
  client?: { first_name: string; last_name: string };
}

interface ClientOption { id: string; first_name: string; last_name: string; }

/** Extract the storage path from a file_url (backward-compatible with full URLs). */
function getStoragePath(fileUrl: string): string {
  const marker = "/portal-documents/";
  const idx = fileUrl.indexOf(marker);
  if (idx !== -1) return fileUrl.substring(idx + marker.length);
  return fileUrl;
}

export default function AdvisorDocuments() {
  const { portalUser } = usePortalAuth();
  const [searchParams] = useSearchParams();
  const clientFilter = searchParams.get("client");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ client_id: clientFilter || "", document_type: "general", is_client_visible: true });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploaderNames, setUploaderNames] = useState<Record<string, string>>({});
  const [advisorFilter, setAdvisorFilter] = useState<string>("all");
  const [uploaders, setUploaders] = useState<{ id: string; name: string }[]>([]);

  const isAdmin = portalUser?.role === "admin";

  useEffect(() => {
    if (!portalUser) return;
    loadData();
  }, [portalUser, clientFilter]);

  async function loadData() {
    // Load clients
    let clientQuery = supabase
      .from("portal_users")
      .select("id, first_name, last_name")
      .eq("role", "client")
      .eq("is_active", true)
      .order("last_name");

    if (!isAdmin) {
      clientQuery = clientQuery.eq("advisor_id", portalUser!.id);
    }

    const { data: clientData } = await clientQuery;
    setClients((clientData as ClientOption[]) ?? []);

    // Load documents
    let query = supabase
      .from("portal_documents")
      .select("*, client:portal_users!portal_documents_client_id_fkey(first_name, last_name)")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("uploaded_by", portalUser!.id);
    }

    if (clientFilter) query = query.eq("client_id", clientFilter);

    const { data, error } = await query;
    if (error) console.error(error);
    const docList = (data as Doc[]) ?? [];
    setDocs(docList);

    // For admin: fetch uploader names
    if (isAdmin && docList.length > 0) {
      const uploaderIds = [...new Set(docList.map((d) => d.uploaded_by))];
      const { data: userData } = await supabase
        .from("portal_users")
        .select("id, first_name, last_name")
        .in("id", uploaderIds);

      const nameMap: Record<string, string> = {};
      const uploaderList: { id: string; name: string }[] = [];
      userData?.forEach((u: any) => {
        const name = `${u.first_name} ${u.last_name}`;
        nameMap[u.id] = name;
        uploaderList.push({ id: u.id, name });
      });
      setUploaderNames(nameMap);
      setUploaders(uploaderList);
    }

    setLoading(false);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error("Select a file"); return; }
    if (!uploadForm.client_id) { toast.error("Select a client"); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${portalUser!.id}/${uploadForm.client_id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("portal-documents").upload(path, file);
    if (uploadError) { toast.error(uploadError.message); setUploading(false); return; }

    const { error: dbError } = await supabase.from("portal_documents").insert({
      file_name: file.name,
      file_url: path,
      file_size: file.size,
      document_type: uploadForm.document_type,
      is_client_visible: uploadForm.is_client_visible,
      client_id: uploadForm.client_id,
      uploaded_by: portalUser!.id,
    });

    if (dbError) { toast.error(dbError.message); }
    else {
      toast.success("Document uploaded");

      if (uploadForm.is_client_visible) {
        await supabase.from("portal_notifications").insert({
          user_id: uploadForm.client_id,
          title: "New Document Available",
          message: `A new ${uploadForm.document_type.replace(/_/g, " ")} document "${file.name}" has been uploaded to your account.`,
          notification_type: "document",
          link: "/portal/client/documents",
        });
      }

      loadData();
      if (fileRef.current) fileRef.current.value = "";
      setSelectedFileName("");
    }
    setUploading(false);
  }

  async function handleDelete(doc: Doc) {
    if (!confirm(`Delete "${doc.file_name}"?`)) return;
    await supabase.from("portal_documents").delete().eq("id", doc.id);
    const storagePath = getStoragePath(doc.file_url);
    await supabase.storage.from("portal-documents").remove([storagePath]);
    toast.success("Document deleted");
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  }

  async function toggleVisibility(doc: Doc) {
    const { error } = await supabase.from("portal_documents").update({ is_client_visible: !doc.is_client_visible }).eq("id", doc.id);
    if (error) { toast.error(error.message); return; }
    setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, is_client_visible: !d.is_client_visible } : d));
  }

  async function handleDownload(doc: Doc) {
    const storagePath = getStoragePath(doc.file_url);
    const { data, error } = await supabase.storage.from("portal-documents").createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) { toast.error("Failed to generate download link"); return; }
    window.open(data.signedUrl, "_blank");
  }

  const filtered = docs.filter((d) => {
    const matchesSearch = d.file_name.toLowerCase().includes(search.toLowerCase());
    const matchesUploader = !isAdmin || advisorFilter === "all" || d.uploaded_by === advisorFilter;
    return matchesSearch && matchesUploader;
  });
  const fmtSize = (n: number | null) => n ? `${(n / 1024).toFixed(0)} KB` : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Documents</h1>

      {/* Upload section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="font-medium text-foreground">Upload Document</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={uploadForm.client_id} onValueChange={(v) => setUploadForm((f) => ({ ...f, client_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={uploadForm.document_type} onValueChange={(v) => setUploadForm((f) => ({ ...f, document_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="policy_document">Policy Document</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="illustration">Illustration</SelectItem>
                  <SelectItem value="statement">Statement</SelectItem>
                  <SelectItem value="id_verification">ID Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Client Visible</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch checked={uploadForm.is_client_visible} onCheckedChange={(v) => setUploadForm((f) => ({ ...f, is_client_visible: v }))} />
                <span className="text-sm text-muted-foreground">{uploadForm.is_client_visible ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="file" ref={fileRef} className="hidden" onChange={() => setSelectedFileName(fileRef.current?.files?.[0]?.name || "")} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              {selectedFileName || "Choose File"}
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />{uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document list header */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {isAdmin && uploaders.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              className="text-sm border rounded-lg p-2 bg-background"
              value={advisorFilter}
              onChange={(e) => setAdvisorFilter(e.target.value)}
            >
              <option value="all">All Uploaders</option>
              {uploaders.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No documents yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.client ? `${doc.client.first_name} ${doc.client.last_name}` : "—"} • {doc.document_type.replace(/_/g, " ")} • {fmtSize(doc.file_size)}
                      {doc.is_client_visible ? " • Client visible" : ""}
                      {isAdmin && uploaderNames[doc.uploaded_by] && (
                        <> • <span className="text-blue-600 font-medium">↑ {uploaderNames[doc.uploaded_by]}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => toggleVisibility(doc)} title={doc.is_client_visible ? "Hide from client" : "Show to client"}>
                    {doc.is_client_visible ? "👁" : "🔒"}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(doc)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
