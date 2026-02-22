import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, CheckCircle, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import portalBg from "@/assets/portal-login-bg.jpg";

const LOGO_URL =
  "https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png";

const features = [
  { title: "Personalized Financial Planning", desc: "Tailored strategies for every life stage" },
  { title: "Life & Annuity Portfolio Management", desc: "Comprehensive coverage & growth solutions" },
  { title: "Dedicated Advisor Support", desc: "Expert guidance whenever you need it" },
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
          setError("Please verify your email before signing in. Check your inbox for a verification link.");
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
        await supabase.auth.signOut();
        setError("No account found. If you recently applied, please wait for manager approval.");
        setLoading(false);
        return;
      }

      if (!portalUser.is_active) {
        await supabase.auth.signOut();
        setError("Your account is pending approval from your manager. You'll receive an email once approved.");
        setLoading(false);
        return;
      }

      // Log login activity (fire-and-forget)
      supabase.from("contracting_agents").select("id").eq("auth_user_id", authData.user.id).maybeSingle().then(({ data: cAgent }) => {
        if (cAgent) {
          supabase.from("contracting_activity_logs").insert({
            agent_id: cAgent.id,
            performed_by: cAgent.id,
            action: "login",
            activity_type: "login",
            description: "Agent logged in",
            metadata: { role: portalUser.role },
          }).then(null, err => console.error("Activity log error:", err));
        }
      });

      if (portalUser.role === "advisor" || portalUser.role === "admin") {
        // Check if they're a contracting agent still in onboarding
        const { data: contractingAgent } = await supabase
          .from("contracting_agents")
          .select("pipeline_stage")
          .eq("auth_user_id", authData.user.id)
          .maybeSingle();

        if (contractingAgent && contractingAgent.pipeline_stage !== "completed") {
          navigate("/portal/advisor/contracting/dashboard", { replace: true });
        } else {
          navigate("/portal/advisor/dashboard", { replace: true });
        }
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
    <>
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
        @keyframes shimmer {
          0% { opacity: 0.4; transform: translateX(-100%) skewX(-12deg); }
          100% { opacity: 0; transform: translateX(300%) skewX(-12deg); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.6; }
        }
      `}</style>

      <div className="flex h-screen w-screen overflow-hidden">

        {/* ── LEFT BRAND PANEL (desktop only) ── */}
        <motion.div
          className="relative hidden lg:flex lg:w-[55%] flex-col overflow-hidden"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <img src={portalBg} alt="Everence advisor" className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(7,25,18,0.88) 0%, rgba(15,41,34,0.78) 50%, rgba(26,77,62,0.65) 100%)" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
          <div className="absolute rounded-full blur-3xl pointer-events-none" style={{ width: 420, height: 420, top: "-80px", right: "-60px", background: "hsla(51,78%,65%,0.10)", animation: "floatA 10s ease-in-out infinite" }} />
          <div className="absolute rounded-full blur-3xl pointer-events-none" style={{ width: 320, height: 320, bottom: "60px", left: "-80px", background: "rgba(26,77,62,0.45)", animation: "floatB 13s ease-in-out infinite" }} />
          <div className="absolute rounded-full blur-3xl pointer-events-none" style={{ width: 600, height: 600, top: "30%", left: "10%", background: "hsla(51,78%,65%,0.05)", animation: "floatC 20s ease-in-out infinite" }} />

          <div className="relative z-10 flex flex-col h-full px-12 py-10">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
              <img src={LOGO_URL} alt="Everence Wealth" className="h-12 w-auto" />
            </motion.div>
            <div className="mt-auto">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-white/40 mb-3">Client & Advisor Portal</p>
                <h1 className="text-4xl xl:text-5xl font-light text-white leading-tight mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Protecting what<br />
                  <span className="italic" style={{ color: "hsla(51,78%,65%,1)" }}>matters most.</span>
                </h1>
                <p className="text-sm text-white/50 mb-8">Trusted wealth protection for families and advisors.</p>
              </motion.div>
              <motion.div className="w-12 h-px mb-8" style={{ background: "hsla(51,78%,65%,0.5)" }} initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.7 }} />
              <div className="space-y-4">
                {features.map((f, i) => (
                  <motion.div key={f.title} className="flex items-start gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 + i * 0.12 }}>
                    <CheckCircle className="mt-0.5 shrink-0 h-5 w-5" style={{ color: "hsla(51,78%,65%,1)" }} />
                    <div>
                      <p className="text-sm font-semibold text-white">{f.title}</p>
                      <p className="text-xs text-white/45">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-xs text-white/20 mt-10">© {new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">

          {/* MOBILE: Full bleed background image + layered overlays */}
          <div className="absolute inset-0 lg:hidden">
            <img src={portalBg} alt="" className="w-full h-full object-cover object-top" />
            {/* Dark vignette overlay */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(4,14,10,0.75) 0%, rgba(7,25,18,0.55) 40%, rgba(4,14,10,0.90) 100%)" }} />
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            {/* Gold orb top-right */}
            <div className="absolute rounded-full blur-3xl pointer-events-none" style={{ width: 280, height: 280, top: "-60px", right: "-60px", background: "hsla(51,78%,65%,0.12)", animation: "floatA 10s ease-in-out infinite" }} />
            {/* Green orb bottom-left */}
            <div className="absolute rounded-full blur-3xl pointer-events-none" style={{ width: 240, height: 240, bottom: "-40px", left: "-60px", background: "rgba(26,77,62,0.5)", animation: "floatB 14s ease-in-out infinite" }} />
          </div>

          {/* Desktop white background */}
          <div className="absolute inset-0 hidden lg:block bg-white" />

          {/* Mobile top brand strip */}
          <div className="relative z-10 w-full lg:hidden flex flex-col items-center pt-14 pb-6 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-5"
            >
              {/* Pulsing ring behind logo */}
              <div className="absolute inset-0 rounded-full" style={{ background: "hsla(51,78%,65%,0.15)", animation: "pulse-ring 3s ease-in-out infinite", margin: "-12px" }} />
              <img src={LOGO_URL} alt="Everence Wealth" className="relative h-16 w-auto drop-shadow-2xl" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <p className="text-xs font-semibold tracking-[0.22em] uppercase mb-1" style={{ color: "hsla(51,78%,65%,0.8)" }}>
                Client & Advisor Portal
              </p>
              <h1 className="text-2xl font-light text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Protecting what{" "}
                <span className="italic" style={{ color: "hsla(51,78%,65%,1)" }}>matters most.</span>
              </h1>
            </motion.div>
          </div>

          {/* Form card */}
          <motion.div
            className="relative z-10 w-full px-5 lg:px-8 lg:max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.3 }}
          >
            {/* Mobile: glassmorphism card */}
            <div
              className="lg:hidden rounded-3xl px-6 py-8 mb-4"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              {/* Mobile header inside card */}
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/40 mb-1">Welcome back</p>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Sign in to your portal
                </h2>
                <div className="mt-3 h-px" style={{ background: "linear-gradient(90deg, hsla(51,78%,65%,0.5), transparent)" }} />
              </div>

              {/* Mobile form fields */}
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="space-y-1.5">
                  <label htmlFor="email-m" className="block text-xs font-semibold tracking-wide text-white/60 uppercase">Email address</label>
                  <input
                    id="email-m"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    }}
                    onFocus={e => { e.target.style.border = "1px solid hsla(51,78%,65%,0.5)"; e.target.style.background = "rgba(255,255,255,0.12)"; }}
                    onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pass-m" className="block text-xs font-semibold tracking-wide text-white/60 uppercase">Password</label>
                    <a href="/portal/forgot-password" className="text-xs font-medium transition-colors" style={{ color: "hsla(51,78%,65%,0.8)" }}>
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="pass-m"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full h-12 px-4 pr-12 rounded-xl text-sm text-white placeholder:text-white/25 outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                      onFocus={e => { e.target.style.border = "1px solid hsla(51,78%,65%,0.5)"; e.target.style.background = "rgba(255,255,255,0.12)"; }}
                      onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.background = "rgba(255,255,255,0.08)"; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>

                {/* Banners */}
                {searchParams.get("verified") === "true" && (
                  <div className="rounded-xl px-4 py-3 text-xs text-emerald-300" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>✓ Email verified! You can now sign in.</div>
                )}
                {searchParams.get("reset") === "success" && (
                  <div className="rounded-xl px-4 py-3 text-xs text-emerald-300" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>✓ Password updated. Sign in with your new password.</div>
                )}
                {(error || urlError) && (
                  <div className="rounded-xl px-4 py-3 text-xs text-red-300" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                    {error || (urlError === "no-portal-account" ? "No portal account found for this login." : urlError)}
                  </div>
                )}

                {/* Mobile Submit button */}
                <motion.button
                  type="button"
                  onClick={handleLogin as unknown as React.MouseEventHandler}
                  disabled={loading}
                  className="w-full h-13 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 relative overflow-hidden mt-2"
                  style={{
                    background: "linear-gradient(135deg, hsla(51,78%,55%,1) 0%, hsla(42,70%,45%,1) 100%)",
                    color: "#071912",
                    boxShadow: "0 8px 32px hsla(51,78%,55%,0.35), 0 2px 8px rgba(0,0,0,0.3)",
                    paddingTop: "13px",
                    paddingBottom: "13px",
                  }}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Shimmer */}
                  <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)", animation: "shimmer 2.5s ease-in-out infinite" }} />
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
                  ) : (
                    <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Desktop form (no glass card) */}
            <form onSubmit={handleLogin} className="hidden lg:block space-y-5">
              <div className="mb-8">
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-400 mb-1">Welcome back</p>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Sign in to your portal
                </h2>
                <div className="mt-4 h-px bg-gray-100" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email-d" className="block text-sm font-medium text-gray-600">Email address</label>
                <input id="email-d" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-300 outline-none transition-all focus:border-[#1A4D3E] bg-gray-50 focus:bg-white" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="pass-d" className="block text-sm font-medium text-gray-600">Password</label>
                  <a href="/portal/forgot-password" className="text-xs font-medium text-[#1A4D3E] hover:text-[#143d30] transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <input id="pass-d" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-300 outline-none transition-all focus:border-[#1A4D3E] bg-gray-50 focus:bg-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {searchParams.get("verified") === "true" && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Email verified! You can now sign in.</div>
              )}
              {searchParams.get("reset") === "success" && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">✓ Password updated. Sign in with your new password.</div>
              )}
              {(error || urlError) && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error || (urlError === "no-portal-account" ? "No portal account found for this login." : urlError)}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #1A4D3E 0%, #0F2922 100%)", boxShadow: "0 8px 24px rgba(26,77,62,0.25)" }}>
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</> : "Sign In"}
              </button>
              <p className="text-center text-xs text-gray-400 pt-2">© {new Date().getFullYear()} Everence Wealth. All rights reserved.</p>
            </form>
          </motion.div>

          {/* Mobile footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="relative z-10 text-center text-xs text-white/20 mt-4 pb-6 lg:hidden"
          >
            © {new Date().getFullYear()} Everence Wealth. All rights reserved.
          </motion.p>
        </div>
      </div>
    </>
  );
}
