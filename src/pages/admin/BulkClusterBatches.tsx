import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, FlaskConical, Rocket, Pause, RefreshCw, Shield, AlertTriangle, CheckCircle2, Clock, SkipForward } from "lucide-react";
import { Link } from "react-router-dom";

type BatchStatus = "queued" | "running" | "paused" | "completed" | "failed";

interface Classification {
  id: number;
  name: string;
  topic: string;
  action: "build" | "skip";
  reason?: string;
  money: string;
  compliance_class: "wealth_standard" | "recruiting_no_income_claims";
}

interface ResultRow {
  id: number;
  name: string;
  topic: string;
  job_id: string | null;
  status: "built" | "skipped" | "failed" | "timeout" | "flagged";
  duration_sec: number;
  flagged_count?: number;
  error?: string;
}

interface BatchJob {
  id: string;
  manifest_path: string;
  mode: "dry_run" | "live";
  limit_count: number | null;
  start_from: number | null;
  force_rebuild: boolean;
  status: BatchStatus;
  total_entries: number;
  build_count: number;
  skip_count: number;
  fail_count: number;
  flagged_count: number;
  current_index: number;
  current_topic: string | null;
  current_job_id: string | null;
  classifications: Classification[];
  results: ResultRow[];
  dedupe_summary: { themes: number; topics: number; primary_keywords: number } | null;
  error: string | null;
  started_at: string | null;
  updated_at: string;
  completed_at: string | null;
  created_at: string;
}

const BulkClusterBatches = () => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const selected = useMemo(() => jobs.find((j) => j.id === selectedId) ?? jobs[0] ?? null, [jobs, selectedId]);

  const loadJobs = async () => {
    const { data, error } = await supabase
      .from("cluster_batch_jobs" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      toast.error(`Failed to load jobs: ${error.message}`);
    } else {
      setJobs((data ?? []) as unknown as BatchJob[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
    const channel = supabase
      .channel("cluster_batch_jobs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cluster_batch_jobs" },
        () => loadJobs(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trigger = async (mode: "dry_run" | "live", limit?: number, start_from?: number) => {
    setTriggering(true);
    try {
      const { data, error } = await supabase.functions.invoke("bulk-build-clusters", {
        body: { mode, limit, start_from },
      });
      if (error) throw error;
      const d = data as { batch_job_id?: string; error?: string };
      if (d.error) throw new Error(d.error);
      toast.success(`${mode === "dry_run" ? "Dry run" : "Live run"} started`);
      if (d.batch_job_id) setSelectedId(d.batch_job_id);
      loadJobs();
    } catch (err) {
      toast.error(`Trigger failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTriggering(false);
    }
  };

  const setStatus = async (id: string, status: BatchStatus) => {
    const { error } = await supabase
      .from("cluster_batch_jobs" as never)
      .update({ status } as never)
      .eq("id", id);
    if (error) toast.error(`Failed to update: ${error.message}`);
    else toast.success(`Status set to ${status}`);
  };

  const resume = async (id: string) => {
    // Flip to running, then re-fire worker at current_index
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    await setStatus(id, "running");
    try {
      await supabase.functions.invoke("build-cluster-step", {
        body: { batch_job_id: id, classification_index: job.current_index },
      });
      toast.success("Worker re-fired");
    } catch (err) {
      toast.error(`Resume failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const elapsedStr = (j: BatchJob) => {
    if (!j.started_at) return "—";
    const end = j.completed_at ? new Date(j.completed_at).getTime() : Date.now();
    const sec = Math.round((end - new Date(j.started_at).getTime()) / 1000);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const statusBadge = (status: BatchStatus) => {
    const map: Record<BatchStatus, string> = {
      queued: "bg-muted text-muted-foreground",
      running: "bg-primary text-primary-foreground",
      paused: "bg-yellow-500 text-white",
      completed: "bg-green-600 text-white",
      failed: "bg-destructive text-destructive-foreground",
    };
    return <Badge className={map[status]}>{status}</Badge>;
  };

  const rowStatusIcon = (s: ResultRow["status"]) => {
    switch (s) {
      case "built": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "flagged": return <Shield className="h-4 w-4 text-yellow-600" />;
      case "skipped": return <SkipForward className="h-4 w-4 text-muted-foreground" />;
      case "failed":
      case "timeout": return <AlertTriangle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Cluster Batches</h1>
          <p className="text-muted-foreground mt-1">
            Run the 75-cluster manifest unattended via the batch orchestrator. Workers self-chain — no key handling required.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Trigger New Batch</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" disabled={triggering} onClick={() => trigger("dry_run", 5)}>
              <FlaskConical className="h-4 w-4 mr-2" /> Dry Run (limit 5)
            </Button>
            <Button variant="outline" disabled={triggering} onClick={() => trigger("dry_run")}>
              <FlaskConical className="h-4 w-4 mr-2" /> Dry Run (full manifest)
            </Button>
            <Button variant="default" disabled={triggering} onClick={() => trigger("live", 5)}>
              <Play className="h-4 w-4 mr-2" /> Smoke Test — Live (limit 5)
            </Button>
            <Button variant="default" disabled={triggering} onClick={() => trigger("live", undefined, 6)}>
              <Rocket className="h-4 w-4 mr-2" /> Full Overnight Run (start_from=6)
            </Button>
            <Button variant="ghost" onClick={loadJobs}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Recent Batches</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!loading && jobs.length === 0 && (
                <p className="text-sm text-muted-foreground">No batches yet.</p>
              )}
              {jobs.map((j) => (
                <button
                  key={j.id}
                  onClick={() => setSelectedId(j.id)}
                  className={`w-full text-left p-3 rounded border transition-colors ${selected?.id === j.id ? "border-primary bg-accent" : "border-border hover:bg-accent/50"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{j.id.slice(0, 8)}</span>
                    {statusBadge(j.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">{j.mode}</Badge>
                    <span className="text-muted-foreground">
                      {j.current_index}/{j.total_entries} · {new Date(j.created_at).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Batch Detail</CardTitle>
                {selected && selected.status === "running" && (
                  <Button size="sm" variant="outline" onClick={() => setStatus(selected.id, "paused")}>
                    <Pause className="h-4 w-4 mr-2" /> Pause
                  </Button>
                )}
                {selected && selected.status === "paused" && (
                  <Button size="sm" variant="default" onClick={() => resume(selected.id)}>
                    <Play className="h-4 w-4 mr-2" /> Resume
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selected && <p className="text-sm text-muted-foreground">Select a batch to view details.</p>}
              {selected && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div><div className="text-muted-foreground">Status</div><div>{statusBadge(selected.status)}</div></div>
                    <div><div className="text-muted-foreground">Mode</div><div className="font-medium">{selected.mode}</div></div>
                    <div><div className="text-muted-foreground">Progress</div><div className="font-medium">{selected.current_index} / {selected.total_entries}</div></div>
                    <div><div className="text-muted-foreground">Elapsed</div><div className="font-medium flex items-center gap-1"><Clock className="h-3 w-3" />{elapsedStr(selected)}</div></div>
                    <div><div className="text-muted-foreground">Built</div><div className="font-medium text-green-600">{selected.build_count}</div></div>
                    <div><div className="text-muted-foreground">Skipped</div><div className="font-medium">{selected.skip_count}</div></div>
                    <div><div className="text-muted-foreground">Failed</div><div className="font-medium text-destructive">{selected.fail_count}</div></div>
                    <div><div className="text-muted-foreground">Flagged</div><div className="font-medium text-yellow-600">{selected.flagged_count}</div></div>
                  </div>

                  {selected.dedupe_summary && (
                    <div className="text-xs text-muted-foreground">
                      Dedupe index: {selected.dedupe_summary.themes} themes · {selected.dedupe_summary.topics} topics · {selected.dedupe_summary.primary_keywords} primary keywords
                    </div>
                  )}

                  {selected.current_topic && selected.status === "running" && (
                    <div className="p-3 rounded bg-accent text-sm">
                      <span className="text-muted-foreground">Current:</span> <span className="font-medium">{selected.current_topic}</span>
                      {selected.current_job_id && (
                        <span className="text-xs font-mono text-muted-foreground ml-2">job {selected.current_job_id.slice(0, 8)}</span>
                      )}
                    </div>
                  )}

                  {selected.error && (
                    <div className="p-3 rounded bg-destructive/10 text-destructive text-sm">{selected.error}</div>
                  )}

                  {selected.flagged_count > 0 && (
                    <Link to="/admin/compliance-review" className="text-sm text-primary underline">
                      Review {selected.flagged_count} flagged article(s) →
                    </Link>
                  )}

                  <Separator />

                  <div>
                    <h3 className="text-sm font-semibold mb-2">Results ({selected.results?.length ?? 0})</h3>
                    <div className="max-h-96 overflow-auto border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left px-3 py-2">#</th>
                            <th className="text-left px-3 py-2">Status</th>
                            <th className="text-left px-3 py-2">Topic</th>
                            <th className="text-left px-3 py-2">Duration</th>
                            <th className="text-left px-3 py-2">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selected.results ?? []).map((r, i) => (
                            <tr key={`${r.id}-${i}`} className="border-t">
                              <td className="px-3 py-2 font-mono text-xs">{r.id}</td>
                              <td className="px-3 py-2">
                                <span className="flex items-center gap-1">{rowStatusIcon(r.status)} {r.status}</span>
                              </td>
                              <td className="px-3 py-2">{r.topic}</td>
                              <td className="px-3 py-2 text-muted-foreground">{r.duration_sec ? `${r.duration_sec}s` : "—"}</td>
                              <td className="px-3 py-2 text-xs text-muted-foreground">
                                {r.flagged_count ? `🚩 ${r.flagged_count} flagged` : ""}
                                {r.error ? r.error : ""}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <details className="text-sm">
                    <summary className="cursor-pointer font-semibold">Full classification list ({selected.classifications?.length ?? 0})</summary>
                    <div className="mt-2 max-h-64 overflow-auto border rounded">
                      <table className="w-full text-xs">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="text-left px-2 py-1">#</th>
                            <th className="text-left px-2 py-1">Action</th>
                            <th className="text-left px-2 py-1">Topic</th>
                            <th className="text-left px-2 py-1">Money</th>
                            <th className="text-left px-2 py-1">Class</th>
                            <th className="text-left px-2 py-1">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selected.classifications ?? []).map((c) => (
                            <tr key={c.id} className="border-t">
                              <td className="px-2 py-1 font-mono">{c.id}</td>
                              <td className="px-2 py-1">
                                <Badge variant={c.action === "build" ? "default" : "outline"} className="text-xs">{c.action}</Badge>
                              </td>
                              <td className="px-2 py-1">{c.topic}</td>
                              <td className="px-2 py-1 text-muted-foreground">{c.money}</td>
                              <td className="px-2 py-1 text-muted-foreground">{c.compliance_class}</td>
                              <td className="px-2 py-1 text-muted-foreground">{c.reason ?? ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BulkClusterBatches;