import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export interface PortalUser {
  id: string;
  auth_user_id: string;
  role: "client" | "advisor" | "admin";
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  advisor_id: string | null;
  is_active: boolean;
}

export function usePortalAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          // Use setTimeout to avoid Supabase auth deadlock
          setTimeout(() => fetchPortalUser(session.user.id), 0);
        } else {
          setPortalUser(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchPortalUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchPortalUser(authUserId: string) {
    try {
      const { data, error } = await supabase
        .from("portal_users")
        .select("*")
        .eq("auth_user_id", authUserId)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      setPortalUser(data as PortalUser | null);
    } catch (err) {
      console.error("Error fetching portal user:", err);
      setPortalUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setPortalUser(null);
    setSession(null);
  }

  return { session, portalUser, loading, signOut };
}
