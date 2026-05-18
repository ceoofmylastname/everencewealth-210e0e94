import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "@/hooks/usePortalAuth";

export interface ManagedAdvisor {
  advisor_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

/**
 * Returns the list of advisors the currently authenticated user manages
 * (via contracting_agents.manager_id == portal_users.id). Empty for non-managers.
 */
export function useManagedAdvisors() {
  const { session, loading: authLoading } = usePortalAuth();
  const [managed, setManaged] = useState<ManagedAdvisor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!session?.user) {
        setManaged([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.rpc("get_managed_advisor_ids", {
        _auth_uid: session.user.id,
      });
      if (!cancelled) {
        if (error) console.error("get_managed_advisor_ids", error);
        setManaged(((data as ManagedAdvisor[]) || []));
        setLoading(false);
      }
    }
    if (!authLoading) run();
    return () => {
      cancelled = true;
    };
  }, [session, authLoading]);

  return { managed, loading: authLoading || loading };
}
