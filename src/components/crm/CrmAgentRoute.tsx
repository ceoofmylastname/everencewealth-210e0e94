import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CrmAgentRouteProps {
  children: React.ReactNode;
}

export function CrmAgentRoute({ children }: CrmAgentRouteProps) {
  const location = useLocation();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ["crm-agent-auth", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from("crm_agents")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching agent:", error);
        return null;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  if (sessionLoading || agentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  if (!agent) {
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  if (!agent.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Account Deactivated
          </h1>
          <p className="text-muted-foreground">
            Your account has been deactivated. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
