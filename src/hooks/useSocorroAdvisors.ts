import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SocorroAdvisor } from "@/types/socorro";

export function useSocorroAdvisors() {
  return useQuery<SocorroAdvisor[]>({
    queryKey: ["socorro-advisors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .select("*")
        .eq("is_approved", true)
        .order("last_name");
      if (error) throw error;
      return (data ?? []) as unknown as SocorroAdvisor[];
    },
  });
}

export function useSocorroAdvisor(advisorId: string | undefined) {
  return useQuery<SocorroAdvisor | null>({
    queryKey: ["socorro-advisor", advisorId],
    enabled: !!advisorId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("socorro_workshop_advisors" as any)
        .select("*")
        .eq("id", advisorId!)
        .eq("is_approved", true)
        .single();
      if (error) throw error;
      return data as unknown as SocorroAdvisor;
    },
  });
}
