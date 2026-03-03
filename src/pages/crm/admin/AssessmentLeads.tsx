import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Eye, FileText, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { QUESTIONS } from "@/lib/assessment-scoring";

interface AssessmentLead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  age_range: string | null;
  retirement_concern: string | null;
  tax_strategy_familiarity: string | null;
  savings_status: string | null;
  income_range: string | null;
  tax_diversification: string | null;
  insurance_coverage: string | null;
  market_volatility: string | null;
  retirement_plan_formality: string | null;
  legacy_planning: string | null;
  overall_score: number | null;
  score_savings: number | null;
  score_tax: number | null;
  score_protection: number | null;
  score_timeline: number | null;
  score_tier: string | null;
  recommendations: Record<string, unknown> | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

const tierColors: Record<string, string> = {
  excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  fair: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "needs-attention": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function AssessmentLeads() {
  const [leads, setLeads] = useState<AssessmentLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AssessmentLead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assessment_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) setLeads(data as unknown as AssessmentLead[]);
    setLoading(false);
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.first_name?.toLowerCase().includes(q) ||
      l.last_name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold">Assessment Leads</h1>
          <p className="text-muted-foreground text-sm">{leads.length} total submissions</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchLeads}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{leads.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">With Score</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{leads.filter((l) => l.overall_score != null).length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Needs Attention</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-red-600">{leads.filter((l) => l.score_tier === "needs-attention").length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {leads.filter((l) => new Date(l.created_at).toDateString() === new Date().toDateString()).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
              <FileText className="h-8 w-8" />
              <p>No assessment submissions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Age Range</TableHead>
                  <TableHead>Concern</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer" onClick={() => setSelected(lead)}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(lead.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="font-medium">{lead.first_name} {lead.last_name}</TableCell>
                    <TableCell className="text-sm">{lead.email}</TableCell>
                    <TableCell className="text-sm">{lead.phone || "—"}</TableCell>
                    <TableCell className="text-sm">{lead.age_range || "—"}</TableCell>
                    <TableCell className="text-sm max-w-[160px] truncate">{lead.retirement_concern || "—"}</TableCell>
                    <TableCell className="font-semibold">{lead.overall_score ?? "—"}</TableCell>
                    <TableCell>
                      {lead.score_tier ? (
                        <Badge className={tierColors[lead.score_tier] || ""}>{lead.score_tier}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelected(lead); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">{selected.first_name} {selected.last_name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selected.email} · {selected.phone || "No phone"}</p>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Score overview */}
                {selected.overall_score != null && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-3xl font-bold">{selected.overall_score}</p>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      {selected.score_tier && (
                        <Badge className={`text-lg px-3 py-1 ${tierColors[selected.score_tier] || ""}`}>{selected.score_tier}</Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">Tier</p>
                    </div>
                  </div>
                )}

                {/* Category scores */}
                {(selected.score_savings != null || selected.score_tax != null || selected.score_protection != null || selected.score_timeline != null) && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Category Scores</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Savings", value: selected.score_savings },
                        { label: "Tax", value: selected.score_tax },
                        { label: "Protection", value: selected.score_protection },
                        { label: "Timeline", value: selected.score_timeline },
                      ].map((s) => (
                        <div key={s.label} className="flex justify-between border rounded px-3 py-2 text-sm">
                          <span className="text-muted-foreground">{s.label}</span>
                          <span className="font-semibold">{s.value ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Answers */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Assessment Answers ({QUESTIONS.length} Questions)</h4>
                  <div className="space-y-3">
                    {QUESTIONS.map((q, idx) => {
                      const answer = (selected as unknown as Record<string, unknown>)[q.id] as string | null;
                      return (
                        <div key={q.id} className="rounded-lg border p-3">
                          <p className="text-xs text-muted-foreground mb-1">Q{idx + 1}</p>
                          <p className="text-sm font-medium mb-1">{q.question}</p>
                          <p className={`text-sm ${answer ? "font-semibold" : "text-muted-foreground italic"}`}>
                            {answer || "Not answered"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                {selected.recommendations && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40">
                      {JSON.stringify(selected.recommendations, null, 2)}
                    </pre>
                  </div>
                )}

                {/* UTM */}
                {(selected.utm_source || selected.utm_medium || selected.utm_campaign) && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">UTM Tracking</h4>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      {selected.utm_source && <p>Source: {selected.utm_source}</p>}
                      {selected.utm_medium && <p>Medium: {selected.utm_medium}</p>}
                      {selected.utm_campaign && <p>Campaign: {selected.utm_campaign}</p>}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Submitted: {format(new Date(selected.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
