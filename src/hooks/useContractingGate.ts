import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePortalAuth } from "./usePortalAuth";

const SURELC_STEP_ID = "1e83a6c7-2d4f-4d09-b04f-4ee86fc47ac5";
const UNGATED_STAGES = ["bundle_selected", "carrier_selection", "contracting_submitted", "contracting_approved", "completed"];

export function useContractingGate() {
  const { session, portalUser } = usePortalAuth();
  const [isGated, setIsGated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) {
      setIsGated(false);
      setLoading(false);
      return;
    }

    async function check() {
      try {
        // 1. Get contracting_agents row for this user
        const { data: agent, error } = await supabase
          .from("contracting_agents")
          .select("id, contracting_role, pipeline_stage, is_licensed, dashboard_access_granted")
          .eq("auth_user_id", session!.user.id)
          .maybeSingle();

        if (error) throw error;

        // No contracting row -> regular advisor, not gated
        if (!agent) {
          setIsGated(false);
          return;
        }

        // Admin-granted full dashboard access bypasses all gating
        if (agent.dashboard_access_granted) {
          setIsGated(false);
          return;
        }

        // Managers, admins, contracting staff are never gated
        if (["manager", "admin", "contracting"].includes(agent.contracting_role)) {
          setIsGated(false);
          return;
        }

        // Portal admins are never gated
        if (portalUser?.role === "admin") {
          setIsGated(false);
          return;
        }

        // Unlicensed agents (ExamFX path) are always gated
        if (agent.is_licensed === false) {
          setIsGated(true);
          return;
        }

        // If pipeline_stage is past surelc_setup, not gated
        if (UNGATED_STAGES.includes(agent.pipeline_stage)) {
          setIsGated(false);
          return;
        }

        // Check if SureLC step is completed
        const { data: step } = await supabase
          .from("contracting_agent_steps")
          .select("status")
          .eq("agent_id", agent.id)
          .eq("step_id", SURELC_STEP_ID)
          .maybeSingle();

        if (step?.status === "completed") {
          setIsGated(false);
        } else {
          setIsGated(true);
        }
      } catch (err) {
        console.error("Error checking contracting gate:", err);
        setIsGated(false);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, [session?.user?.id, portalUser?.role]);

  return { isGated, loading };
}
