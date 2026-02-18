import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import portalBg from "@/assets/portal-login-bg.jpg";

const LOGO_URL =
  "https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png";

const features = [
  {
    title: "Personalized Financial Planning",
    desc: "Tailored strategies for every life stage",
  },
  {
    title: "Life & Annuity Portfolio Management",
    desc: "Comprehensive coverage & growth solutions",
  },
  {
    title: "Dedicated Advisor Support",
    desc: "Expert guidance whenever you need it",
  },
];

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
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        if (authError.message?.toLowerCase().includes("email not confirmed")) {
          setError(
            "Please verify your email before signing in. Check your inbox for a verification link."
          );
        } else {
          setError("Invalid email or password.");
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      const { data: portalUser, error: portalError } = await supabase
        .from("portal_users")
        .select("role, is_active")
        .eq("auth_user_id", authData.user.id)
        .maybeSingle();

      if (portalError || !portalUser) {
        const supportCode = authData.user.id.substring(0, 8).toUpperCase();
        await supabase.auth.signOut();
        setError(
          `Account setup incomplete. Please contact support with code: ${supportCode}`
        );
        setLoading(false);
        return;
      }

      if (!portalUser.is_active) {
        await supabase.auth.signOut();
        setError("Your account has been deactivated. Contact support.");
        setLoading(false);
        return;
      }

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
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── LEFT BRAND PANEL ── */}
      <motion.div
        className="relative hidden lg:flex lg:w-[55%] flex-col overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {/* Background image */}
        <img
          src={portalBg}
          alt="Everence advisor"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Deep gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(7,25,18,0.88) 0%, rgba(15,41,34,0.78) 50%, rgba(26,77,62,0.65) 100%)",
          }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Animated gold orb 1 */}
        <div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: 420,
            height: 420,
            top: "-80px",
            right: "-60px",
            background: "hsla(51,78%,65%,0.10)",
            animation: "floatA 10s ease-in-out infinite",
          }}
        />
        {/* Animated green orb 2 */}
        <div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: 320,
            height: 320,
            bottom: "60px",
            left: "-80px",
            background: "rgba(26,77,62,0.45)",
            animation: "floatB 13s ease-in-out infinite",
          }}
        />
        {/* Animated gold orb 3 (large, very faint) */}
        <div
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{
            width: 600,
            height: 600,
            top: "30%",
            left: "10%",
            background: "hsla(51,78%,65%,0.05)",
            animation: "floatC 20s ease-in-out infinite",
          }}
        />

        {/* CSS keyframes injected via style tag */}
        <style>{`
          @keyframes floatA {
            0%,100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-28px) scale(1.05); }
          }
          @keyframes floatB {
            0%,100% { transform: translate(0px, 0px); }
            33% { transform: translate(20px, -20px); }
            66% { transform: translate(-10px, 15px); }
          }
          @keyframes floatC {
            0%,100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.08) rotate(6deg); }
          }
        `}</style>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo top-left */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <img src={LOGO_URL} alt="Everence Wealth" className="h-12 w-auto" />
          </motion.div>

          {/* Bottom content */}
          <div className="mt-auto">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-white/40 mb-3">
                Client & Advisor Portal
              </p>
              <h1
                className="text-4xl xl:text-5xl font-light text-white leading-tight mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Protecting what
                <br />
                <span className="italic" style={{ color: "hsla(51,78%,65%,1)" }}>
                  matters most.
                </span>
              </h1>
              <p className="text-sm text-white/50 mb-8">
                Trusted wealth protection for families and advisors.
              </p>
            </motion.div>

            {/* Divider */}
            <motion.div
              className="w-12 h-px mb-8"
              style={{ background: "hsla(51,78%,65%,0.5)" }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            />

            {/* Feature bullets */}
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}
                >
                  <CheckCircle
                    className="mt-0.5 shrink-0 h-5 w-5"
                    style={{ color: "hsla(51,78%,65%,1)" }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{f.title}</p>
                    <p className="text-xs text-white/45">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-white/20 mt-10">
              © {new Date().getFullYear()} Everence Wealth. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── RIGHT FORM PANEL ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative"
        style={{ background: "#ffffff" }}
      >
        {/* Mobile gradient background (hidden on lg+) */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(160deg, #071912 0%, #0F2922 55%, #1A4D3E 100%)",
          }}
        />

        <motion.div
          className="relative z-10 w-full max-w-md px-8 py-10"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img
              src={LOGO_URL}
              alt="Everence Wealth"
              className="h-10 w-auto"
            />
          </div>

          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-1">
              Welcome back
            </p>
            <h2
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Sign in to your portal
            </h2>
            <div className="mt-4 h-px bg-gray-100" />
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.45 }}
              className="space-y-1.5"
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-300 outline-none transition-all focus:border-[#1A4D3E] focus:ring-2 focus:ring-[#1A4D3E]/10 bg-gray-50 focus:bg-white"
              />
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.55 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-600"
                >
                  Password
                </label>
                <a
                  href="/portal/forgot-password"
                  className="text-xs font-medium text-[#1A4D3E] hover:text-[#143d30] transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-300 outline-none transition-all focus:border-[#1A4D3E] focus:ring-2 focus:ring-[#1A4D3E]/10 bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Success banners */}
            {searchParams.get("verified") === "true" && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                ✓ Email verified! You can now sign in.
              </div>
            )}
            {searchParams.get("reset") === "success" && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                ✓ Password updated. Sign in with your new password.
              </div>
            )}

            {/* Error banner */}
            {(error || urlError) && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error ||
                  (urlError === "no-portal-account"
                    ? "No portal account found for this login."
                    : urlError)}
              </div>
            )}

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.65 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #1A4D3E 0%, #0F2922 100%)",
                  boxShadow: "0 8px 24px rgba(26,77,62,0.25)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </motion.div>
          </form>

          {/* Footer — desktop only (mobile footer is on the left panel) */}
          <p className="text-center text-xs text-gray-300 mt-10 lg:text-gray-400">
            © {new Date().getFullYear()} Everence Wealth. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
