import { useState, useEffect } from "react";
import { usePortalAuth } from "@/hooks/usePortalAuth";
import { supabase } from "@/integrations/supabase/client";
import SocorroAvailabilityManager from "@/components/portal/SocorroAvailabilityManager";
import SocorroRegistrationsTable from "@/components/portal/SocorroRegistrationsTable";
import { Loader2 } from "lucide-react";

export default function SocorroWorkshopManage() {
  const { portalUser } = usePortalAuth();
  const [socorroAdvisorId, setSocorroAdvisorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!portalUser?.auth_user_id) return;
    (async () => {
      const { data } = await supabase
        .from("socorro_workshop_advisors" as any)
        .select("id")
        .eq("auth_user_id", portalUser.auth_user_id)
        .single();
      setSocorroAdvisorId((data as any)?.id ?? null);
      setLoading(false);
    })();
  }, [portalUser?.auth_user_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (!socorroAdvisorId) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Socorro ISD Workshop</h1>
        <p className="text-gray-500">
          Your account is not linked to a Socorro workshop advisor profile. Please contact an admin to get set up.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Socorro ISD Workshop</h1>
        <p className="text-sm text-gray-500">Manage your availability and view your registrations for the workshop week.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">My Availability</h2>
        <SocorroAvailabilityManager advisorId={socorroAdvisorId} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-4">My Registrations</h2>
        <SocorroRegistrationsTable advisorId={socorroAdvisorId} />
      </section>
    </div>
  );
}
