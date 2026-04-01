import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Eye, CheckCircle2, Clock } from "lucide-react";

interface Submission {
  id: string;
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
}

export default function ResponseCardSubmissions() {
  const { portalUser } = usePortalAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [portalUser]);

  async function loadSubmissions() {
    const { data } = await supabase
      .from("response_card_submissions" as any)
      .select("*")
      .order("submitted_at", { ascending: false });
    setSubmissions((data as any[]) ?? []);
    setLoading(false);
  }

  async function toggleReviewed(id: string, current: boolean) {
    await supabase
      .from("response_card_submissions" as any)
      .update({ reviewed: !current })
      .eq("id", id);
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, reviewed: !current } : s))
    );
  }

  const unreviewed = submissions.filter((s) => !s.reviewed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Response Card Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">Submissions assigned to you from presentations</p>
        </div>
        {unreviewed > 0 && (
          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1">
            {unreviewed} unreviewed
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl border">
          No submissions yet
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
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
                        {s.email} · {s.phone} · {s.income_range}
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
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant={s.reviewed ? "outline" : "default"}
                        onClick={() => toggleReviewed(s.id, s.reviewed)}
                        className={s.reviewed ? "" : "bg-[#1A4D3E] hover:bg-[#143d30]"}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {s.reviewed ? "Mark Unreviewed" : "Mark Reviewed"}
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
