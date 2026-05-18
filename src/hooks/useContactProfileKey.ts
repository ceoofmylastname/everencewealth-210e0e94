import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  EMPTY_PROFILE_KEY,
  ProfileKeyRow,
  ProfileStatus,
  ProfileTraitKey,
} from "@/lib/profileKey";

export function useContactProfileKey(contactId: string | undefined, advisorId: string | undefined) {
  const [row, setRow] = useState<ProfileKeyRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contactId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("advisor_contact_profile_key" as any)
        .select("*")
        .eq("contact_id", contactId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        toast.error(error.message);
      }
      setRow(((data as any) as ProfileKeyRow) ?? (advisorId ? EMPTY_PROFILE_KEY(contactId, advisorId) : null));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [contactId, advisorId]);

  const persist = useCallback(
    async (next: ProfileKeyRow) => {
      const { error } = await supabase
        .from("advisor_contact_profile_key" as any)
        .upsert(
          {
            contact_id: next.contact_id,
            advisor_id: next.advisor_id,
            trait_age_25_plus: next.trait_age_25_plus,
            trait_married: next.trait_married,
            trait_children: next.trait_children,
            trait_homeowner: next.trait_homeowner,
            trait_income: next.trait_income,
            trait_ambitious: next.trait_ambitious,
            trait_dissatisfied: next.trait_dissatisfied,
            trait_entrepreneur: next.trait_entrepreneur,
            status_code: next.status_code,
          },
          { onConflict: "contact_id" }
        )
        .select("*")
        .maybeSingle();
      if (error) {
        toast.error(error.message);
        return false;
      }
      return true;
    },
    []
  );

  const toggleTrait = useCallback(
    async (trait: ProfileTraitKey) => {
      if (!row) return;
      const next: ProfileKeyRow = {
        ...row,
        [trait]: !row[trait],
      } as ProfileKeyRow;
      // recompute score locally for snappy UI
      next.score =
        (next.trait_age_25_plus ? 1 : 0) +
        (next.trait_married ? 1 : 0) +
        (next.trait_children ? 1 : 0) +
        (next.trait_homeowner ? 1 : 0) +
        (next.trait_income ? 1 : 0) +
        (next.trait_ambitious ? 1 : 0) +
        (next.trait_dissatisfied ? 1 : 0) +
        (next.trait_entrepreneur ? 1 : 0);
      const prev = row;
      setRow(next);
      const ok = await persist(next);
      if (!ok) setRow(prev);
    },
    [row, persist]
  );

  const setStatus = useCallback(
    async (status: ProfileStatus) => {
      if (!row) return;
      const next: ProfileKeyRow = { ...row, status_code: row.status_code === status ? null : status };
      const prev = row;
      setRow(next);
      const ok = await persist(next);
      if (!ok) setRow(prev);
    },
    [row, persist]
  );

  return { row, loading, toggleTrait, setStatus };
}