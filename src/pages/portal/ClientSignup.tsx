import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface InvitationData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  advisor_id: string;
  status: string;
  expires_at: string;
}

export default function ClientSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError("No invitation token provided.");
      setValidating(false);
      return;
    }
    validateToken(token);
  }, [token]);

  async function validateToken(token: string) {
    try {
      const { data, error } = await supabase
        .from("client_invitations")
        .select("id, first_name, last_name, email, phone, advisor_id, status, expires_at")
        .eq("invitation_token", token)
        .maybeSingle();

      if (error || !data) {
        setTokenError("Invalid or expired invitation link.");
        return;
      }

      if (data.status !== "pending") {
        setTokenError("This invitation has already been used.");
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setTokenError("This invitation has expired. Please ask your advisor for a new one.");
        return;
      }

      setInvitation(data as InvitationData);
    } catch {
      setTokenError("Unable to validate invitation.");
    } finally {
      setValidating(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
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
    if (!invitation) return;

    setLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Failed to create account.");
        setLoading(false);
        return;
      }

      // 2. Create portal_users record
      const { error: portalError } = await supabase.from("portal_users").insert({
        auth_user_id: authData.user.id,
        role: "client",
        first_name: invitation.first_name,
        last_name: invitation.last_name,
        email: invitation.email,
        phone: invitation.phone,
        advisor_id: (await supabase
          .from("advisors")
          .select("portal_user_id")
          .eq("id", invitation.advisor_id)
          .single()
          .then(r => r.data?.portal_user_id)) || null,
      });

      if (portalError) {
        console.error("Portal user creation error:", portalError);
        setError("Account created but portal setup failed. Please contact your advisor.");
        setLoading(false);
        return;
      }

      // 3. Mark invitation as accepted
      await supabase
        .from("client_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      setSuccess(true);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(215,28%,10%)]">
        <div className="w-8 h-8 border-4 border-[hsl(42,50%,55%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(215,28%,10%)] px-4">
        <div className="w-full max-w-md text-center">
          <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Invalid Invitation</h1>
          <p className="text-white/60 mb-6">{tokenError}</p>
          <Button onClick={() => navigate("/portal/login")} variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(215,28%,10%)] px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Account Created!</h1>
          <p className="text-white/60 mb-2">Please check your email to verify your account before signing in.</p>
          <p className="text-white/40 text-sm mb-6">Once verified, you can log in to view your policies and documents.</p>
          <Button onClick={() => navigate("/portal/login")} className="bg-[hsl(160,48%,21%)] hover:bg-[hsl(42,50%,55%)] text-white">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(215,28%,10%)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-[hsl(42,50%,55%)]" />
            <span className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Everence
            </span>
          </div>
          <h1 className="text-xl font-semibold text-white/90">Create Your Account</h1>
          <p className="text-sm text-white/50 mt-1">
            Welcome, {invitation?.first_name}! Set up your password to get started.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl">
          <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-sm text-white/70">
              <span className="text-white/40">Email:</span> {invitation?.email}
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/80">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus-visible:ring-[hsl(42,50%,55%)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-white/80">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-[hsl(42,50%,55%)]"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[hsl(160,48%,21%)] hover:bg-[hsl(42,50%,55%)] text-white font-semibold"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
