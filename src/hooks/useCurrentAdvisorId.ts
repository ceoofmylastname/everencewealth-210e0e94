import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";

/**
 * Resolves the current authenticated user's `advisors.id` (the value used by
 * RLS via get_advisor_id_for_auth). This is distinct from portal_users.id.
 */
export function useCurrentAdvisorId() {
  const { session, portalUser, loading: authLoading } = usePortalAuth();
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!session?.user) {
        setAdvisorId(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("advisors")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();
      if (!cancelled) {
        setAdvisorId((data as { id: string } | null)?.id ?? null);
        setLoading(false);
      }
    }
    if (!authLoading) run();
    return () => {
      cancelled = true;
    };
  }, [session, authLoading]);

  return { advisorId, portalUser, loading: authLoading || loading };
}
