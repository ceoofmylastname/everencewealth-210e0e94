import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Trash2, Eye, CheckCircle2, Clock, Filter } from "lucide-react";

interface Submission {
  id: string;
  assigned_advisor_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  marital_status: string;
  street_address: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  income_range: string;
  wants_free_consultation: boolean;
  meeting_topics: string[];
  availability: string | null;
  comments: string | null;
  reviewed: boolean;
  submitted_at: string;
  advisor_name?: string;
}

interface AdvisorOption {
  id: string;
  name: string;
}

export default function AdminResponseCards() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [advisorMap, setAdvisorMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAdvisor, setFilterAdvisor] = useState("");
  const [filterIncome, setFilterIncome] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [subRes, advRes] = await Promise.all([
      supabase.from("response_card_submissions" as any).select("*").order("submitted_at", { ascending: false }),
      supabase.from("advisors").select("id, first_name, last_name").eq("is_active", true),
    ]);
    const map: Record<string, string> = {};
    (advRes.data ?? []).forEach((a: any) => { map[a.id] = `${a.first_name} ${a.last_name}`; });
    setAdvisorMap(map);
    setSubmissions((subRes.data as any[]) ?? []);
    setLoading(false);
  }

  async function deleteSubmission(id: string) {
    await supabase.from("response_card_submissions" as any).delete().eq("id", id);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  }

  const advisorOptions: AdvisorOption[] = useMemo(() => {
    const ids = [...new Set(submissions.map((s) => s.assigned_advisor_id))];
    return ids.map((id) => ({ id, name: advisorMap[id] || "Unknown" })).sort((a, b) => a.name.localeCompare(b.name));
  }, [submissions, advisorMap]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filterAdvisor && s.assigned_advisor_id !== filterAdvisor) return false;
      if (filterIncome && s.income_range !== filterIncome) return false;
      return true;
    });
  }, [submissions, filterAdvisor, filterIncome]);

  const perAdvisor = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach((s) => {
      const name = advisorMap[s.assigned_advisor_id] || "Unknown";
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [submissions, advisorMap]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Response Card Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">All submissions across all agents</p>
        </div>
        <Badge className="bg-[#F0F5F3] text-[#1A4D3E] border-[#1A4D3E]/20 text-sm px-3 py-1">
          {submissions.length} total
        </Badge>
      </div>

      {/* Per-agent breakdown */}
      {perAdvisor.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {perAdvisor.slice(0, 8).map(([name, count]) => (
            <div key={name} className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-500 truncate">{name}</p>
              <p className="text-lg font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="h-4 w-4 text-gray-400" />
        <select
          value={filterAdvisor}
          onChange={(e) => setFilterAdvisor(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Agents</option>
          {advisorOptions.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          value={filterIncome}
          onChange={(e) => setFilterIncome(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">All Income</option>
          {["Less than $30k", "$30k – $50k", "$50k – $100k", "$100k+"].map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">No submissions found</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const expanded = expandedId === s.id;
            return (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : s.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {s.reviewed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        Agent: {advisorMap[s.assigned_advisor_id] || "Unknown"} · {s.income_range}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(s.submitted_at).toLocaleDateString()}
                    </span>
                    {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <Detail label="Email" value={s.email} />
                      <Detail label="Phone" value={s.phone} />
                      <Detail label="Marital Status" value={s.marital_status} />
                      <Detail label="Income Range" value={s.income_range} />
                      <Detail label="Free Consultation" value={s.wants_free_consultation ? "Yes" : "No"} />
                      <Detail label="Assigned Agent" value={advisorMap[s.assigned_advisor_id] || "Unknown"} />
                      <Detail label="Submitted" value={new Date(s.submitted_at).toLocaleString()} />
                    </div>
                    {(s.street_address || s.city) && (
                      <Detail
                        label="Address"
                        value={[s.street_address, s.address_line_2, [s.city, s.state, s.zip_code].filter(Boolean).join(", ")].filter(Boolean).join("\n")}
                      />
                    )}
                    {s.meeting_topics?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Meeting Topics</p>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                          {s.meeting_topics.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    )}
                    {s.availability && <Detail label="Availability" value={s.availability} />}
                    {s.comments && <Detail label="Comments" value={s.comments} />}
                    <div className="pt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm("Delete this submission?")) deleteSubmission(s.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 whitespace-pre-line">{value}</p>
    </div>
  );
}
