import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

interface Doc { id: string; file_name: string; storage_path: string; mime_type: string | null; size_bytes: number | null; created_at: string; }

export default function ContactDocumentsTab({ contactId, advisorId }: { contactId: string; advisorId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, [contactId]);
  async function load() {
    const { data } = await supabase.from("advisor_contact_documents").select("*").eq("contact_id", contactId).order("created_at", { ascending: false });
    setDocs((data as Doc[]) || []);
  }
  async function upload(file: File) {
    setUploading(true);
    const path = `${advisorId}/${contactId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("advisor-contact-docs").upload(path, file);
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { error } = await supabase.from("advisor_contact_documents").insert({
      contact_id: contactId, advisor_id: advisorId, file_name: file.name,
      storage_path: path, mime_type: file.type, size_bytes: file.size,
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Uploaded");
    load();
  }
  async function download(d: Doc) {
    const { data, error } = await supabase.storage.from("advisor-contact-docs").createSignedUrl(d.storage_path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  }
  async function remove(d: Doc) {
    if (!confirm("Delete this file?")) return;
    await supabase.storage.from("advisor-contact-docs").remove([d.storage_path]);
    await supabase.from("advisor_contact_documents").delete().eq("id", d.id);
    load();
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <input ref={fileRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} style={{ backgroundColor: "#1A4D3E" }}>
          <Upload className="w-4 h-4 mr-1" /> {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      {docs.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center text-gray-500 text-sm">No documents uploaded.</div>
      ) : docs.map((d) => (
        <div key={d.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <div className="font-medium">{d.file_name}</div>
              <div className="text-xs text-gray-500">{((d.size_bytes ?? 0) / 1024).toFixed(1)} KB · {new Date(d.created_at).toLocaleString()}</div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => download(d)}><Download className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => remove(d)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}
