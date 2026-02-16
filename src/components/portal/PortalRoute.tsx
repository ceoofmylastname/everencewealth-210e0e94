import { Navigate } from "react-router-dom";
import { usePortalAuth } from "@/hooks/usePortalAuth";

interface PortalRouteProps {
  children: React.ReactNode;
}

export function PortalRoute({ children }: PortalRouteProps) {
  const { session, portalUser, loading } = usePortalAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/portal/login" replace />;
  }

  if (!portalUser) {
    return <Navigate to="/portal/login?error=no-portal-account" replace />;
  }

  return <>{children}</>;
}
