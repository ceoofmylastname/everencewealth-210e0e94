import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Download, FileIcon } from "lucide-react";
import { toast } from "sonner";

interface Doc {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  document_type: string;
  created_at: string;
}

/** Extract the storage path from a file_url (backward-compatible with full URLs). */
function getStoragePath(fileUrl: string): string {
  const marker = "/portal-documents/";
  const idx = fileUrl.indexOf(marker);
  if (idx !== -1) return fileUrl.substring(idx + marker.length);
  return fileUrl;
}

export default function ClientDocuments() {
  const { portalUser } = usePortalAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser) return;
    loadDocs();
  }, [portalUser]);

  async function loadDocs() {
    const { data, error } = await supabase
      .from("portal_documents")
      .select("id, file_name, file_url, file_size, document_type, created_at")
      .eq("client_id", portalUser!.id)
      .eq("is_client_visible", true)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    setDocs((data as Doc[]) ?? []);
    setLoading(false);
  }

  async function handleDownload(doc: Doc) {
    const storagePath = getStoragePath(doc.file_url);
    const { data, error } = await supabase.storage.from("portal-documents").createSignedUrl(storagePath, 3600);
    if (error || !data?.signedUrl) { toast.error("Failed to generate download link"); return; }
    window.open(data.signedUrl, "_blank");
  }

  const fmtSize = (n: number | null) => n ? `${(n / 1024).toFixed(0)} KB` : "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
        My Documents
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <Card><CardContent className="py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No documents available yet.</p>
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <FileIcon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.document_type.replace(/_/g, " ")} • {fmtSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownload(doc)}>
                  <Download className="h-4 w-4 mr-1" />Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
