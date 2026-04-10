import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Detects password recovery tokens in the URL hash and redirects
 * to the portal reset password page. This handles the case where
 * Supabase Auth redirects to the homepage with recovery tokens
 * instead of the intended /portal/reset-password route.
 */
export function AuthRecoveryRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      // Redirect to the reset password page, preserving the hash tokens
      navigate(`/portal/reset-password${hash}`, { replace: true });
    }
  }, [navigate, location]);

  return null;
}
