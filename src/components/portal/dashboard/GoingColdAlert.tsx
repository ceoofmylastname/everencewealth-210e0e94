import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Snowflake } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProfileKeyBadge from "@/components/portal/contacts/ProfileKeyBadge";

interface ColdRow {
  contact_id: string;
  score: number;
  status_code: "response" | "associate" | "client" | null;
  updated_at: string;
  contact: { first_name: string | null; last_name: string | null } | null;
}

const CARD = "bg-white rounded-2xl border border-gray-200/80 shadow-sm";
const STALE_DAYS = 14;

/**
 * Contacts rated 4+ with no Profile Key activity for two weeks.
 */
export default function GoingColdAlert({ advisorId }: { advisorId: string }) {
  const [rows, setRows] = useState<ColdRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!advisorId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const cutoff = new Date(Date.now() - STALE_DAYS * 86400000).toISOString();
      const { data } = await supabase
        .from("advisor_contact_profile_key" as any)
        .select("contact_id, score, status_code, updated_at, contact:advisor_contacts!inner(first_name, last_name)")
        .eq("advisor_id", advisorId)
        .gte("score", 4)
        .lt("updated_at", cutoff)
        .order("updated_at", { ascending: true })
        .limit(6);
      if (cancelled) return;
      setRows((data as any) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [advisorId]);

  if (loading || rows.length === 0) return null;

  return (
    <div className={`${CARD} overflow-hidden border-sky-200`}>
      <div className="flex items-center justify-between p-5 border-b-2 border-sky-200 bg-gradient-to-r from-sky-50 to-white">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-sm">
            <Snowflake className="h-4 w-4 text-white" />
          </span>
          Going Cold
          <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-sky-500 text-white text-xs font-bold">
            {rows.length}
          </span>
        </h2>
        <Link to="/portal/advisor/contacts?tab=top25" className="text-xs font-semibold text-sky-700 hover:underline">
          Top 25
        </Link>
      </div>
      <div className="p-5 space-y-2">
        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold pb-1">
          Rated 4+ with no activity in {STALE_DAYS} days
        </p>
        {rows.map((r) => {
          const name = [r.contact?.first_name, r.contact?.last_name].filter(Boolean).join(" ") || "Contact";
          const days = Math.floor((Date.now() - new Date(r.updated_at).getTime()) / 86400000);
          return (
            <Link key={r.contact_id} to={`/portal/advisor/contacts/${r.contact_id}`} className="block">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-sky-100 bg-sky-50/40 hover:bg-sky-50 border-l-4 border-l-sky-400 transition-colors">
                <ProfileKeyBadge score={r.score} status={r.status_code} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500">Untouched for {days} days</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
