import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PortalResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Primary fix: check if Supabase already established a session from the recovery URL.
    // This handles the race condition where the token is exchanged before onAuthStateChange is registered.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    // Backup: listen for the PASSWORD_RECOVERY event (fires if getSession() hadn't caught it yet)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });

    // Secondary fallback: raw hash check (works if token hasn't been exchanged yet)
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        await supabase.auth.signOut();
        navigate("/portal/login?reset=success", { replace: true });
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
          <h1 className="text-xl font-semibold text-white/90">Set New Password</h1>
          <p className="text-sm text-white/50 mt-1">Enter your new password below</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">
          {!ready ? (
            <div className="text-center space-y-3">
              <p className="text-white/60 text-sm">Verifying your reset link...</p>
              <p className="text-white/40 text-xs">If this takes too long, your link may have expired. Please request a new one.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
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
                <p className="text-xs text-white/40">Minimum 8 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-white/80">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus-visible:ring-[hsl(42,50%,55%)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {password && confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Passwords match
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[hsl(160,48%,21%)] hover:bg-[hsl(42,50%,55%)] text-white font-semibold transition-colors"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-white/30 mt-6">
          © {new Date().getFullYear()} Everence Wealth. All rights reserved.
        </p>
      </div>
    </div>
  );
}
