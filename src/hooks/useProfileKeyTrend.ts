import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface TrendPoint {
  score: number;
  created_at: string;
}

/**
 * Score history for a single contact (used for the sparkline on the
 * Profile Key card).
 */
export function useContactProfileKeyTrend(contactId: string | undefined, days = 30) {
  const [points, setPoints] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data } = await supabase
        .from("advisor_contact_profile_key_history" as any)
        .select("score, created_at")
        .eq("contact_id", contactId)
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled) return;
      setPoints(((data as any[]) ?? []).map((r) => ({ score: r.score, created_at: r.created_at })));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [contactId, days]);

  const delta = useMemo(() => {
    if (points.length < 2) return 0;
    return points[points.length - 1].score - points[0].score;
  }, [points]);

  return { points, delta, loading, days };
}

export interface AdvisorTrends {
  /** contact_id -> score change over the window */
  deltas: Record<string, number>;
  /** contacts whose score increased in the last 7 days */
  heatedUpThisWeek: number;
  loading: boolean;
}

/**
 * Aggregate score movement for every contact in an advisor's book. Used for
 * the trend arrows in the contacts table / Top 25 and the dashboard summary.
 */
export function useAdvisorProfileKeyTrends(advisorId: string | undefined, days = 30): AdvisorTrends {
  const [rows, setRows] = useState<{ contact_id: string; score: number; created_at: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!advisorId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data } = await supabase
        .from("advisor_contact_profile_key_history" as any)
        .select("contact_id, score, created_at")
        .eq("advisor_id", advisorId)
        .gte("created_at", since)
        .order("created_at", { ascending: true })
        .limit(2000);
      if (cancelled) return;
      setRows((data as any[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [advisorId, days]);

  const { deltas, heatedUpThisWeek } = useMemo(() => {
    const first: Record<string, number> = {};
    const last: Record<string, number> = {};
    const weekFirst: Record<string, number> = {};
    const weekLast: Record<string, number> = {};
    const weekAgo = Date.now() - 7 * 86400000;

    for (const r of rows) {
      if (!(r.contact_id in first)) first[r.contact_id] = r.score;
      last[r.contact_id] = r.score;
      if (new Date(r.created_at).getTime() >= weekAgo) {
        if (!(r.contact_id in weekFirst)) weekFirst[r.contact_id] = r.score;
        weekLast[r.contact_id] = r.score;
      }
    }

    const d: Record<string, number> = {};
    for (const id of Object.keys(last)) d[id] = last[id] - first[id];

    let hot = 0;
    for (const id of Object.keys(weekLast)) {
      if (weekLast[id] > weekFirst[id]) hot += 1;
    }
    return { deltas: d, heatedUpThisWeek: hot };
  }, [rows]);

  return { deltas, heatedUpThisWeek, loading };
}
