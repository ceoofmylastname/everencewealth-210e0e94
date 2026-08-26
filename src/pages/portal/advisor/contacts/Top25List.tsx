import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Pin, PinOff, Trophy } from "lucide-react";
import { toast } from "sonner";
import ProfileKeyBadge from "@/components/portal/contacts/ProfileKeyBadge";
import ProfileKeyTrendArrow from "@/components/portal/contacts/ProfileKeyTrendArrow";
import { useAdvisorProfileKeyTrends } from "@/hooks/useProfileKeyTrend";
import { PROFILE_KEY_TRAITS, ProfileTraitKey, scoreColorHsl } from "@/lib/profileKey";

interface Row {
  contact_id: string;
  score: number;
  status_code: "response" | "associate" | "client" | null;
  pinned_top: boolean;
  updated_at: string;
  traits: Record<ProfileTraitKey, boolean>;
  first_name: string | null;
  last_name: string | null;
  primary_email: string | null;
}

const STATUS_RANK: Record<string, number> = { client: 3, associate: 2, response: 1 };

export default function Top25List({
  advisorId,
  readOnly = false,
  linkSuffix = "",
}: {
  advisorId: string;
  readOnly?: boolean;
  linkSuffix?: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { deltas } = useAdvisorProfileKeyTrends(advisorId);

  const load = useCallback(async () => {
    if (!advisorId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("advisor_contact_profile_key" as any)
      .select(
        "contact_id, score, status_code, pinned_top, updated_at, trait_age_25_plus, trait_married, trait_children, trait_homeowner, trait_income, trait_ambitious, trait_dissatisfied, trait_entrepreneur, contact:advisor_contacts!inner(first_name, last_name, primary_email)"
      )
      .eq("advisor_id", advisorId)
      .limit(500);
    if (error) toast.error(error.message);
    setRows(
      ((data as any[]) ?? []).map((r) => ({
        contact_id: r.contact_id,
        score: r.score ?? 0,
        status_code: r.status_code ?? null,
        pinned_top: !!r.pinned_top,
        updated_at: r.updated_at,
        traits: {
          trait_age_25_plus: !!r.trait_age_25_plus,
          trait_married: !!r.trait_married,
          trait_children: !!r.trait_children,
          trait_homeowner: !!r.trait_homeowner,
          trait_income: !!r.trait_income,
          trait_ambitious: !!r.trait_ambitious,
          trait_dissatisfied: !!r.trait_dissatisfied,
          trait_entrepreneur: !!r.trait_entrepreneur,
        },
        first_name: r.contact?.first_name ?? null,
        last_name: r.contact?.last_name ?? null,
        primary_email: r.contact?.primary_email ?? null,
      }))
    );
    setLoading(false);
  }, [advisorId]);

  useEffect(() => {
    load();
  }, [load]);

  const top = useMemo(() => {
    const sorted = [...rows].sort((a, b) => {
      if (a.pinned_top !== b.pinned_top) return a.pinned_top ? -1 : 1;
      if (b.score !== a.score) return b.score - a.score;
      const sa = a.status_code ? STATUS_RANK[a.status_code] : 0;
      const sb = b.status_code ? STATUS_RANK[b.status_code] : 0;
      if (sb !== sa) return sb - sa;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    return sorted.slice(0, 25);
  }, [rows]);

  async function togglePin(row: Row, e: React.MouseEvent) {
    e.stopPropagation();
    if (readOnly) return;
    const next = !row.pinned_top;
    setRows((prev) => prev.map((r) => (r.contact_id === row.contact_id ? { ...r, pinned_top: next } : r)));
    const { error } = await supabase
      .from("advisor_contact_profile_key" as any)
      .update({ pinned_top: next })
      .eq("contact_id", row.contact_id);
    if (error) {
      setRows((prev) => prev.map((r) => (r.contact_id === row.contact_id ? { ...r, pinned_top: !next } : r)));
      toast.error(error.message);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500 bg-white border rounded-xl">Loading Top 25...</div>;
  }

  if (top.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white border rounded-xl">
        No rated contacts yet. Fill in the Profile Key on a contact to build the Top 25.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Trophy className="w-4 h-4 text-amber-500" />
        Ranked by Profile Key score, then status (C · A · R), then most recently updated. Pinned names hold their slot.
      </div>

      {top.map((r, i) => {
        const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || "Contact";
        const color = scoreColorHsl(r.score);
        const activeTraits = PROFILE_KEY_TRAITS.filter((t) => r.traits[t.key]);
        return (
          <div
            key={r.contact_id}
            onClick={() => navigate(`/portal/advisor/contacts/${r.contact_id}${linkSuffix}`)}
            className="cursor-pointer bg-white border rounded-xl p-3 sm:p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-l-4"
            style={{ borderLeftColor: color, background: scoreColorHsl(r.score, 0.04) }}
          >
            <span
              className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
              style={{ background: scoreColorHsl(r.score, 0.14), color }}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-gray-900 truncate">{name}</span>
                <ProfileKeyBadge score={r.score} status={r.status_code} />
                <ProfileKeyTrendArrow delta={deltas[r.contact_id] ?? 0} />
                {r.pinned_top && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
              {r.primary_email && <div className="text-xs text-gray-500 truncate mt-0.5">{r.primary_email}</div>}
              <div className="flex flex-wrap gap-1 mt-2">
                {activeTraits.length === 0 ? (
                  <span className="text-[10px] text-gray-400">No traits checked</span>
                ) : (
                  activeTraits.map((t) => (
                    <span
                      key={t.key}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        color,
                        background: scoreColorHsl(r.score, 0.1),
                        borderColor: scoreColorHsl(r.score, 0.3),
                      }}
                    >
                      {t.num}. {t.label}
                    </span>
                  ))
                )}
              </div>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={(e) => togglePin(r, e)}
                aria-label={r.pinned_top ? "Unpin from Top 25" : "Pin to Top 25"}
                title={r.pinned_top ? "Unpin from Top 25" : "Pin to Top 25"}
                className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition"
              >
                {r.pinned_top ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
