import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Search } from "lucide-react";
import type { SocorroRegistration } from "@/types/socorro";

interface SocorroRegistrationsTableProps {
  advisorId?: string; // if omitted, shows all registrations (admin view)
}

export default function SocorroRegistrationsTable({ advisorId }: SocorroRegistrationsTableProps) {
  const [registrations, setRegistrations] = useState<SocorroRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, [advisorId]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("socorro_workshop_registrations" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (advisorId) {
        query = query.eq("advisor_id", advisorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRegistrations((data ?? []) as unknown as SocorroRegistration[]);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = registrations.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.first_name.toLowerCase().includes(q) ||
      r.last_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  });

  const downloadCsv = () => {
    if (!filtered.length) return;
    const headers = ["Date", "Time", "First Name", "Last Name", "Email", "Phone", "Registered At", "Email Sent", "GHL Sent"];
    const rows = filtered.map((r) =>
      [
        r.selected_date,
        r.selected_time,
        `"${r.first_name}"`,
        `"${r.last_name}"`,
        `"${r.email}"`,
        `"${r.phone || ""}"`,
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
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Registered</TableHead>
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
                  <TableCell>{r.selected_date}</TableCell>
                  <TableCell>{r.selected_time}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {new Date(r.created_at).toLocaleDateString()}
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
