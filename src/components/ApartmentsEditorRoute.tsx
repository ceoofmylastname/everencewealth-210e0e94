import { useState, useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ApartmentsEditorRouteProps {
  children: ReactNode;
}

export const ApartmentsEditorRoute = ({ children }: ApartmentsEditorRouteProps) => {
  const [state, setState] = useState<"loading" | "authorized" | "unauthorized">("loading");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setState("unauthorized");
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .in("role", ["admin", "apartments_editor"]);

      setState(data && data.length > 0 ? "authorized" : "unauthorized");
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state === "unauthorized") {
    return <Navigate to="/apartments/login" replace />;
  }

  return <>{children}</>;
};
