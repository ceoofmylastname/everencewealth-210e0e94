import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const urlError = searchParams.get("error");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      // Check portal_users for this auth user
      const { data: portalUser, error: portalError } = await supabase
        .from("portal_users")
        .select("role, is_active")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();

      if (portalError || !portalUser) {
        await supabase.auth.signOut();
        setError("You do not have a portal account. Contact your advisor.");
        setLoading(false);
        return;
      }

      if (!portalUser.is_active) {
        await supabase.auth.signOut();
        setError("Your account has been deactivated. Contact support.");
        setLoading(false);
        return;
      }

      // Redirect based on role
      if (portalUser.role === "advisor" || portalUser.role === "admin") {
        navigate("/portal/advisor/dashboard", { replace: true });
      } else {
        navigate("/portal/client/dashboard", { replace: true });
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(215,28%,10%)] px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-[hsl(42,50%,55%)]" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Everence
            </span>
          </div>
          <h1 className="text-xl font-semibold text-white/90">Client & Advisor Portal</h1>
          <p className="text-sm text-white/50 mt-1">Sign in to access your account</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/80">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-[hsl(42,50%,55%)]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus-visible:ring-[hsl(42,50%,55%)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {(error || urlError) && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
                {error || (urlError === "no-portal-account" ? "No portal account found for this login." : urlError)}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(160,48%,21%)] hover:bg-[hsl(42,50%,55%)] text-white font-semibold transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          © {new Date().getFullYear()} Everence Wealth. All rights reserved.
        </p>
      </div>
    </div>
  );
}
