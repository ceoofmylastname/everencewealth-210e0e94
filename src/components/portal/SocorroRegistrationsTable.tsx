import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegistrationWithAdvisor {
  id: string;
  advisor_id: string;
  availability_slot_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  selected_date: string;
  selected_time: string;
  ghl_webhook_sent: boolean;
  email_sent: boolean;
  created_at: string;
  advisor_name?: string;
}

interface SocorroRegistrationsTableProps {
  advisorId?: string;
}

export default function SocorroRegistrationsTable({ advisorId }: SocorroRegistrationsTableProps) {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<RegistrationWithAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, [advisorId]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      // Fetch registrations
      let query = supabase
        .from("socorro_workshop_registrations" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (advisorId) {
        query = query.eq("advisor_id", advisorId);
      }

      const { data: regs, error } = await query;
      if (error) throw error;

      // Fetch all advisors to map names
      const { data: advisors } = await supabase
        .from("socorro_workshop_advisors" as any)
        .select("id, first_name, last_name");

      const advisorMap = new Map<string, string>();
      if (advisors) {
        for (const a of advisors as any[]) {
          advisorMap.set(a.id, `${a.first_name} ${a.last_name}`);
        }
      }

      const enriched = ((regs ?? []) as any[]).map((r) => ({
        ...r,
        advisor_name: advisorMap.get(r.advisor_id) || "Unknown",
      })) as RegistrationWithAdvisor[];

      setRegistrations(enriched);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRegistration = async (id: string) => {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("socorro_workshop_registrations" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Registration deleted" });
      setRegistrations((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      (r.advisor_name || "").toLowerCase().includes(q)
    );
  });

  const downloadCsv = () => {
    if (!filtered.length) return;
    const headers = ["Name", "Email", "Phone", "Advisor", "Date", "Time", "Registered At", "Email Sent", "GHL Sent"];
    const rows = filtered.map((r) =>
      [
        `"${r.first_name} ${r.last_name}"`,
        `"${r.email}"`,
        `"${r.phone || ""}"`,
        `"${r.advisor_name || ""}"`,
        r.selected_date,
        r.selected_time,
        new Date(r.created_at).toLocaleString(),
        r.email_sent ? "Yes" : "No",
        r.ghl_webhook_sent ? "Yes" : "No",
      ].join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `socorro_registrations_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading registrations…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search registrations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={downloadCsv} disabled={!filtered.length}>
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </Button>
        <span className="text-sm text-gray-400 ml-auto">
          {filtered.length} registration{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-gray-400 text-sm">No registrations found.</p>
      ) : (
        <div className="border rounded-xl overflow-x-auto shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {r.first_name} {r.last_name}
                  </TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.phone || "—"}</TableCell>
                  <TableCell className="text-sm text-gray-600">{r.advisor_name}</TableCell>
                  <TableCell>{r.selected_date}</TableCell>
                  <TableCell>{r.selected_time}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {confirmDeleteId === r.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 px-2 text-xs"
                          onClick={() => deleteRegistration(r.id)}
                          disabled={deletingId === r.id}
                        >
                          {deletingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(r.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
