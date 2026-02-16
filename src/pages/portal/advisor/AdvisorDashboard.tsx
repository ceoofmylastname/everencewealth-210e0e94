import { usePortalAuth } from "@/hooks/usePortalAuth";
import { Button } from "@/components/ui/button";
import { Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdvisorDashboard() {
  const { portalUser, signOut } = usePortalAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
            Advisor Portal
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </header>
      <main className="max-w-4xl mx-auto p-8">
        <div className="rounded-2xl border bg-card p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome, {portalUser?.first_name} {portalUser?.last_name}
          </h1>
          <p className="text-muted-foreground">
            Your advisor dashboard is ready. Features will be added in upcoming phases.
          </p>
          <div className="mt-6 flex gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Role: {portalUser?.role}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
