import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

interface ContactLead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
  language: string;
  comment: string | null;
  source: string | null;
  created_at: string | null;
  page_url: string | null;
}

export function ContactLeadsTab({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("id, full_name, email, phone, language, comment, source, created_at, page_url")
      .eq("source", "contact_page")
      .order("created_at", { ascending: false });

    const results = data ?? [];
    setLeads(results);
    onCountChange?.(results.length);
    setLoading(false);
  }

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (l.email?.toLowerCase().includes(search.toLowerCase()));
    const matchLang = langFilter === "all" || l.language === langFilter;
    return matchSearch && matchLang;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] mt-4">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1A4D3E]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={langFilter} onValueChange={setLangFilter}>
          <SelectTrigger className="w-40 border-gray-200 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-4 border-[#1A4D3E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No contact submissions found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Language</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Message</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                <TableCell className="font-medium text-gray-900">{l.full_name}</TableCell>
                <TableCell className="text-gray-500">{l.email || "—"}</TableCell>
                <TableCell className="text-gray-500">{l.phone}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full text-xs px-2.5 py-0.5 font-medium ${l.language === "en" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
                    {l.language === "en" ? "English" : l.language === "es" ? "Spanish" : l.language}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs">
                  {l.comment ? (
                    <div>
                      <button
                        onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                        className="flex items-center gap-1 text-left text-gray-600 hover:text-gray-900"
                      >
                        <span className={expandedId === l.id ? "" : "line-clamp-1"}>
                          {l.comment}
                        </span>
                        {l.comment.length > 60 && (
                          expandedId === l.id ? <ChevronUp className="h-3 w-3 flex-shrink-0" /> : <ChevronDown className="h-3 w-3 flex-shrink-0" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-gray-500 whitespace-nowrap">
                  {l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
