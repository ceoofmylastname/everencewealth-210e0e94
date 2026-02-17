import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const LOGO_URL = "https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/admin");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/admin`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created! Please check your email to verify your account.");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Signed in successfully!");
        navigate("/admin");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = activeTab === "signin" ? handleSignIn : handleSignUp;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#0B1F18" }}>
      {/* Mesh gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full opacity-40" style={{ background: "radial-gradient(circle, #1A4D3E 0%, transparent 70%)", filter: "blur(120px)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #C5A059 0%, transparent 70%)", filter: "blur(120px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Everence Wealth" className="mx-auto h-14 w-auto mb-5" />
          <h1 className="text-2xl font-bold tracking-wide text-white">Everence Wealth</h1>
          <p className="text-sm text-white/50 mt-1 tracking-widest uppercase">Content Management System</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-8">
          {/* Tabs */}
          <div className="flex mb-6 rounded-lg bg-white/[0.05] p-1">
            {(["signin", "signup"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[#C5A059] text-[#0B1F18] shadow-lg"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                {tab === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-[#C5A059] focus-visible:border-[#C5A059]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-white/70 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 pr-10 focus-visible:ring-[#C5A059] focus-visible:border-[#C5A059]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {activeTab === "signup" && (
                <p className="text-xs text-white/40 mt-1">Minimum 8 characters</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full font-semibold bg-[#C5A059] hover:bg-[#d4b06a] text-[#0B1F18] transition-colors"
              disabled={loading}
            >
              {loading
                ? activeTab === "signin" ? "Signing in..." : "Creating account..."
                : activeTab === "signin" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-8">
          © {new Date().getFullYear()} Everence Wealth. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
