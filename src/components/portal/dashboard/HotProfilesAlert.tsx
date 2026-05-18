import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProfileKeyBadge from "@/components/portal/contacts/ProfileKeyBadge";
import { scoreColorHsl } from "@/lib/profileKey";

interface HotRow {
  contact_id: string;
  score: number;
  status_code: "response" | "associate" | "client" | null;
  contact: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    primary_email: string | null;
  } | null;
}

const CARD = "bg-white rounded-2xl border border-gray-200/80 shadow-sm";

export default function HotProfilesAlert({ advisorId, threshold = 4 }: { advisorId: string; threshold?: number }) {
  const [rows, setRows] = useState<HotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!advisorId) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("advisor_contact_profile_key" as any)
        .select("contact_id, score, status_code, contact:advisor_contacts!inner(id, first_name, last_name, primary_email)")
        .eq("advisor_id", advisorId)
        .gte("score", threshold)
        .order("score", { ascending: false })
        .limit(8);
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, [advisorId, threshold]);

  const urgent = rows.filter((r) => r.score >= 7).length;
  const watch = rows.filter((r) => r.score >= 4 && r.score < 7).length;

  return (
    <div
      className={`${CARD} overflow-hidden`}
      style={{
        boxShadow: `0 4px 20px -8px ${scoreColorHsl(8, 0.35)}`,
        borderColor: scoreColorHsl(8, 0.25),
      }}
    >
      <div
        className="flex items-center justify-between p-5 border-b-2"
        style={{
          background: `linear-gradient(90deg, ${scoreColorHsl(8, 0.12)}, ${scoreColorHsl(6, 0.06)}, white)`,
          borderBottomColor: scoreColorHsl(8, 0.4),
        }}
      >
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span
            className="h-8 w-8 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: scoreColorHsl(8) }}
          >
            <Flame className="h-4 w-4 text-white" />
          </span>
          Hot Profiles
          {rows.length > 0 && (
            <span
              className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-white text-xs font-bold"
              style={{ background: scoreColorHsl(8) }}
            >
              {rows.length}
            </span>
          )}
        </h2>
        <Link to="/portal/advisor/contacts" className="text-xs font-semibold hover:underline" style={{ color: scoreColorHsl(8) }}>
          All
        </Link>
      </div>
      <div className="p-5 space-y-2">
        {!loading && rows.length > 0 && (
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold pb-1">
            {urgent > 0 && <span style={{ color: scoreColorHsl(8) }}>{urgent} urgent (7+)</span>}
            {urgent > 0 && watch > 0 && <span className="text-gray-300"> · </span>}
            {watch > 0 && <span style={{ color: scoreColorHsl(4) }}>{watch} watch (4–6)</span>}
          </p>
        )}
        {loading ? (
          <div className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No contacts scored {threshold}+ yet. Rate your contacts to surface priorities.</p>
        ) : (
          rows.map((r) => {
            const name = [r.contact?.first_name, r.contact?.last_name].filter(Boolean).join(" ") || "Contact";
            const color = scoreColorHsl(r.score);
            return (
              <Link key={r.contact_id} to={`/portal/advisor/contacts/${r.contact_id}`} className="block">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg border border-l-4 transition-colors hover:bg-gray-50"
                  style={{
                    background: scoreColorHsl(r.score, 0.05),
                    borderLeftColor: color,
                    borderColor: scoreColorHsl(r.score, 0.2),
                  }}
                >
                  <ProfileKeyBadge score={r.score} status={r.status_code} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                    {r.contact?.primary_email && (
                      <p className="text-xs text-gray-500 truncate">{r.contact.primary_email}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}