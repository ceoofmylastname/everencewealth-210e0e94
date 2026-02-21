import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "./usePortalAuth";

export type ContractingRole = "agent" | "manager" | "contracting" | "admin" | null;

export interface ContractingAgent {
  id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  contracting_role: string;
  pipeline_stage: string;
  status: string;
  created_at: string;
}

export function useContractingAuth() {
  const { session, portalUser } = usePortalAuth();
  const [contractingAgent, setContractingAgent] = useState<ContractingAgent | null>(null);
  const [contractingRole, setContractingRole] = useState<ContractingRole>(null);
  const [isAutoDetectedManager, setIsAutoDetectedManager] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setContractingAgent(null);
      setContractingRole(null);
      setIsAutoDetectedManager(false);
      setLoading(false);
      return;
    }

    async function fetch() {
      try {
        // 1. Check if user has a contracting_agents row
        const { data, error } = await supabase
          .from("contracting_agents")
          .select("*")
          .eq("auth_user_id", session!.user.id)
          .maybeSingle();

        if (error) throw error;
        setContractingAgent(data as ContractingAgent | null);
        setContractingRole((data?.contracting_role as ContractingRole) ?? null);

        // 2. If no contracting role found, check if this user is a manager
        //    by seeing if any contracting_agents have their portal_users.id as manager_id
        if (!data?.contracting_role && portalUser?.id) {
          const { count, error: managerError } = await supabase
            .from("contracting_agents")
            .select("id", { count: "exact", head: true })
            .eq("manager_id", portalUser.id);

          if (!managerError && count && count > 0) {
            setIsAutoDetectedManager(true);
          }
        }
      } catch (err) {
        console.error("Error fetching contracting agent:", err);
        setContractingAgent(null);
        setContractingRole(null);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [session?.user?.id, portalUser?.id]);

  // Portal admins get admin-level access even without a contracting_agents row
  // Advisors with recruits get auto-detected as managers
  const effectiveRole: ContractingRole =
    contractingRole ??
    (portalUser?.role === "admin" ? "admin" : null) ??
    (isAutoDetectedManager ? "manager" : null);

  const canManage = effectiveRole === "contracting" || effectiveRole === "admin";
  const canViewAll = canManage || effectiveRole === "manager";

  return {
    contractingAgent,
    contractingRole: effectiveRole,
    canManage,
    canViewAll,
    loading,
    portalUser,
  };
}
