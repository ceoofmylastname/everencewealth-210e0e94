import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SocorroAvailabilitySlot } from "@/types/socorro";

export function useSocorroAvailability(advisorId: string | undefined) {
  return useQuery<SocorroAvailabilitySlot[]>({
    queryKey: ["socorro-availability", advisorId],
    enabled: !!advisorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("socorro_advisor_availability" as any)
        .select("*")
        .eq("advisor_id", advisorId!)
        .order("event_date")
        .order("time_slot");
      if (error) throw error;
      return (data ?? []) as unknown as SocorroAvailabilitySlot[];
    },
  });
}
