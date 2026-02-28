import React, { useState, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import { useParams } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Check,
  Mail,
  Phone,
  Calendar,
  Clock,
  Users,
  Monitor,
  Shield,
  Award,
  Loader2,
  ChevronDown,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";
import workshopHeroBg from "@/assets/workshop-hero-bg.jpg";

// ── Inline keyframes for workshop page ──
const workshopStyles = `
@keyframes ws-gradient-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes ws-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-12px) rotate(1deg); }
  66% { transform: translateY(-6px) rotate(-1deg); }
}
@keyframes ws-float-slow {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
@keyframes ws-pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(237,219,119,0.15); }
  50% { box-shadow: 0 0 40px rgba(237,219,119,0.35), 0 0 80px rgba(237,219,119,0.1); }
}
@keyframes ws-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes ws-orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -20px) scale(1.05); }
  50% { transform: translate(-10px, -35px) scale(0.95); }
  75% { transform: translate(-25px, -10px) scale(1.02); }
}
@keyframes ws-text-gradient {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
`;

// ── Zod schema ──
const registrationSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50),
  last_name: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
});
type RegistrationData = z.infer<typeof registrationSchema>;

// ── Animation Variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};
const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1 },
};
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const fadeUpSpring = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 18 } },
};
const scaleUpRotate = {
  hidden: { opacity: 0, scale: 0.7, rotate: -5 },
  visible: { opacity: 1, scale: 1, rotate: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
};

// ── Floating Orb Background ──
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(circle, #EDDB77, transparent 70%)", animation: "ws-orb-drift 15s ease-in-out infinite" }} />
      <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{ background: "radial-gradient(circle, #56B4A0, transparent 70%)", animation: "ws-orb-drift 20s ease-in-out infinite reverse" }} />
      <div className="absolute -bottom-20 right-1/4 w-[300px] h-[300px] rounded-full opacity-[0.04]"
        style={{ background: "radial-gradient(circle, #EDDB77, transparent 70%)", animation: "ws-orb-drift 18s ease-in-out infinite 3s" }} />
    </div>
  );
}

// ── Glassmorphism Card wrapper ──
function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative overflow-hidden ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        ...style,
      }}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)", animation: "ws-shimmer 8s ease-in-out infinite" }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── 3D Tilt Card ──
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div className={className} style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </motion.div>
  );
}

// ── Success Confetti Component ──
function SuccessConfetti() {
  useEffect(() => {
    const duration = 3000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ["#EDDB77", "#10B981", "#1A4D3E", "#FFD700", "#ffffff"] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ["#EDDB77", "#10B981", "#1A4D3E", "#FFD700", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 150, damping: 15 }} className="text-center py-10 px-4">
      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
        className="w-28 h-28 mx-auto mb-6 flex items-center justify-center rounded-full relative"
        style={{ background: "linear-gradient(135deg, #10B981, #059669)", boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1] }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Check className="w-14 h-14 text-white" strokeWidth={3} />
        </motion.div>
        <motion.div className="absolute inset-0 rounded-full"
          initial={{ boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.6)" }}
          animate={{ boxShadow: "0 0 0 24px rgba(16, 185, 129, 0)" }}
          transition={{ duration: 1.2, delay: 0.3 }} />
      </motion.div>
      <motion.h3 initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
        Congratulations! 🎉
      </motion.h3>
      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="text-base sm:text-lg mb-1 font-medium" style={{ color: "#1A4D3E" }}>
        You're all set!
      </motion.p>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="text-sm" style={{ color: "#4A5565" }}>
        Check your email for confirmation details and a calendar invite.
      </motion.p>
    </motion.div>
  );
}

// ── Main Component ──
const WorkshopLanding: React.FC = () => {
  const params = useParams<{ slug?: string; lang?: string }>();
  const slug = params.slug || params.lang;

  // Step 1: Resolve slug → advisor_id
  const { data: slugData, isLoading: slugLoading, error: slugError } = useQuery({
    queryKey: ["workshop-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisor_slugs")
        .select("advisor_id")
        .eq("slug", slug!)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Step 2: Get advisor
  const advisorId = slugData?.advisor_id;
  const { data: advisor, isLoading: advisorLoading } = useQuery({
    queryKey: ["workshop-advisor", advisorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advisors")
        .select("id, first_name, last_name, email, phone, photo_url, title")
        .eq("id", advisorId!)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!advisorId,
  });

  // Step 3: Get upcoming workshops
  const { data: workshops, isLoading: workshopsLoading } = useQuery({
    queryKey: ["workshop-list", advisorId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("advisor_id", advisorId!)
        .in("status", ["scheduled", "published"])
        .gte("workshop_date", today)
        .order("workshop_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!advisorId,
  });

  // Workshop selection
  const [selectedIdx, setSelectedIdx] = useState(0);
  const workshop = workshops?.[selectedIdx] ?? null;

  // Registration count
  const { data: regCount } = useQuery({
    queryKey: ["workshop-reg-count", workshop?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("workshop_registrations")
        .select("id", { count: "exact", head: true })
        .eq("workshop_id", workshop!.id);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!workshop?.id,
  });

  const seatsRemaining = useMemo(() => {
    if (!workshop) return null;
    const max = (workshop as any).max_attendees ?? 50;
    return Math.max(0, max - (regCount ?? 0));
  }, [workshop, regCount]);

  const isFull = seatsRemaining !== null && seatsRemaining <= 0;

  // ── Form State ──
  const [form, setForm] = useState<RegistrationData>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleChange = (field: keyof RegistrationData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown || submitting || isFull || !workshop || !advisorId) return;

    const result = registrationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegistrationData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const regId = crypto.randomUUID();
      const { error } = await supabase.from("workshop_registrations").insert({
        id: regId,
        workshop_id: workshop.id,
        advisor_id: advisorId,
        first_name: result.data.first_name,
        last_name: result.data.last_name,
        email: result.data.email,
        phone: result.data.phone || null,
        source_url: window.location.href,
        lead_status: "registered",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("You're already registered for this workshop");
        } else {
          throw error;
        }
      } else {
        setSubmitted(true);
        setForm({ first_name: "", last_name: "", email: "", phone: "" });
        toast.success("You're registered! Check your email for confirmation.");
        setCooldown(true);
        setTimeout(() => setCooldown(false), 30000);

        // Send confirmation email (fire-and-forget)
        supabase.functions.invoke("send-workshop-confirmation", {
          body: { registration_id: regId },
        }).catch((e) => console.error("Confirmation email error:", e));
      }
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  const isLoading = slugLoading || advisorLoading || workshopsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A4D3E 0%, #0F2F27 100%)", fontFamily: "GeistSans, system-ui, sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-10 h-10 animate-spin text-white/80" />
          <p className="text-sm text-white/60">Loading workshop…</p>
        </motion.div>
      </div>
    );
  }

  // 404
  if (slugError || !slugData || !advisor) {
    return <NotFound />;
  }

  // No upcoming workshops
  if (!workshops || workshops.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A4D3E 0%, #0F2F27 100%)", fontFamily: "'Inter', GeistSans, system-ui, sans-serif" }}>
        <style>{workshopStyles}</style>
        <FloatingOrbs />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md px-6 relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: "rgba(237,219,119,0.1)", border: "1px solid rgba(237,219,119,0.2)", animation: "ws-float-slow 6s ease-in-out infinite" }}>
            <Calendar className="w-10 h-10" style={{ color: "#EDDB77" }} />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">No Upcoming Workshops</h1>
          <p className="text-lg mb-2 text-white/70">
            {advisor.first_name} {advisor.last_name} doesn't have any upcoming workshops scheduled.
          </p>
          <p className="text-white/50">Check back soon!</p>
        </motion.div>
      </div>
    );
  }

  // ── Format helpers ──
  const advisorName = `${advisor.first_name} ${advisor.last_name}`;
  const workshopDate = workshop?.workshop_date
    ? format(new Date(workshop.workshop_date + "T00:00:00"), "EEEE, MMMM d, yyyy")
    : "";
  const rawTime = (workshop as any)?.workshop_time ?? "18:00:00";
  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  const workshopTime = formatTime(rawTime);
  const rawTimezone = (workshop as any)?.timezone ?? "PST";
  const workshopTimezone = (() => {
    try {
      const abbr = new Intl.DateTimeFormat("en-US", { timeZone: rawTimezone, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value;
      return abbr || rawTimezone;
    } catch {
      return rawTimezone;
    }
  })();
  const workshopDuration = (workshop as any)?.duration_minutes ?? 60;

  return (
    <>
      <Helmet>
        <title>{`${advisorName} - Tax-Free Retirement Workshop | Everence Wealth`}</title>
        <meta
          name="description"
          content={`Join ${advisorName} for a complimentary workshop on building tax-free retirement wealth. Learn strategies to eliminate taxes and protect against market volatility.`}
        />
        <meta property="og:title" content={`${advisorName} - Tax-Free Retirement Workshop`} />
        <meta
          property="og:description"
          content={`Join ${advisorName} for a complimentary workshop on building tax-free retirement wealth.`}
        />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Inject workshop-specific keyframes */}
      <style>{workshopStyles}</style>

      <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', GeistSans, system-ui, sans-serif" }}>

        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden min-h-[100vh] flex flex-col" style={{ background: "linear-gradient(160deg, #0F2F27 0%, #1A4D3E 40%, #153D32 70%, #0F2F27 100%)" }}>
          {/* Background image overlay */}
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url(${workshopHeroBg})`, backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "overlay" }} />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(26,77,62,0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(15,47,39,0.6) 0%, transparent 50%)" }} />
          {/* Floating orbs */}
          <FloatingOrbs />
          {/* Mesh gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #EDDB77, #56B4A0, #EDDB77, transparent)" }} />

          <div className="relative z-10 flex-1 flex flex-col">
            {/* Header */}
            <header className="border-b border-white/[0.06]" style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", background: "rgba(15,47,39,0.3)" }}>
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <img src="https://everencewealth-beta.vercel.app/logo-icon.png" alt="Everence Wealth logo" className="h-10 sm:h-12 brightness-0 invert drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                {seatsRemaining !== null && seatsRemaining > 0 && seatsRemaining <= 15 && (
                  <motion.div initial={{ opacity: 0, scale: 0.8, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide"
                    style={{ background: "linear-gradient(135deg, rgba(220,38,38,0.2), rgba(220,38,38,0.1))", color: "#FCA5A5", border: "1px solid rgba(220,38,38,0.2)", backdropFilter: "blur(8px)" }}>
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" /></span>
                    {seatsRemaining} spots left
                  </motion.div>
                )}
              </div>
            </header>

            {/* Hero Content */}
            <div className="flex-1 flex items-center">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                  {/* Left: Hero text */}
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="overflow-hidden min-w-0">
                    {/* Date badge with glow */}
                    <motion.div variants={fadeLeft} transition={{ type: "spring", stiffness: 100, damping: 15 }}
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-8"
                      style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", border: "1px solid rgba(237,219,119,0.15)", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.2)" }}>
                      <Calendar className="w-4 h-4" style={{ color: "#EDDB77" }} />
                      <span className="text-sm font-semibold text-white/90 tracking-wide">{workshopDate}</span>
                    </motion.div>

                    {/* Animated Gradient Headline */}
                    <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-extrabold leading-[1.1] mb-6 break-words text-white tracking-tight">
                      Build Your{" "}
                      <span className="relative inline-block pb-1">
                        Tax-Free
                        <motion.svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"
                          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, delay: 0.8 }}>
                          <motion.path d="M2 8.5C30 3 70 2 100 5.5C130 9 170 4 198 6" stroke="url(#underline-gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.8 }} />
                          <defs><linearGradient id="underline-gradient" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse"><stop stopColor="#EDDB77" /><stop offset="1" stopColor="#C4A84D" /></linearGradient></defs>
                        </motion.svg>
                      </span>{" "}
                      <span className="inline-block" style={{ background: "linear-gradient(90deg, #EDDB77, #fff, #EDDB77, #C4A84D, #EDDB77)", backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "ws-text-gradient 4s linear infinite" }}>
                        Retirement
                      </span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
                      className="text-base sm:text-lg md:text-xl mb-10 text-white/65 max-w-lg leading-relaxed font-light">
                      Join a complimentary workshop and discover proven strategies to eliminate taxes, protect your wealth, and retire with confidence.
                    </motion.p>

                    {/* Quick info pills — premium glassmorphism */}
                    <motion.div variants={fadeUp} transition={{ delay: 0.5 }} className="flex flex-wrap gap-3 mb-10">
                      {[
                        { icon: Clock, text: `${workshopTime} ${workshopTimezone}` },
                        { icon: Monitor, text: "Live Online" },
                        { icon: Clock, text: `${workshopDuration} min` },
                      ].map(({ icon: Icon, text }, i) => (
                        <motion.div key={text} whileHover={{ scale: 1.05, y: -2 }} transition={{ type: "spring", stiffness: 400 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm cursor-default"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", boxShadow: "0 2px 12px -2px rgba(0,0,0,0.15)" }}>
                          <Icon className="w-3.5 h-3.5" style={{ color: "#EDDB77" }} />
                          <span className="text-white/80 font-medium">{text}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Advisor mini card — with pulsing glow */}
                    <motion.div variants={fadeUp} transition={{ delay: 0.6 }}
                      className="inline-flex items-center gap-4 px-5 py-3 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
                      {advisor.photo_url ? (
                        <div className="relative" style={{ animation: "ws-pulse-glow 3s ease-in-out infinite" }}>
                          <div className="w-14 h-14 rounded-full p-[2px]" style={{ background: "linear-gradient(135deg, #EDDB77, #C4A84D)" }}>
                            <img src={advisor.photo_url} alt={advisorName} className="w-full h-full rounded-full object-cover" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                          style={{ background: "linear-gradient(135deg, rgba(237,219,119,0.2), rgba(196,168,77,0.1))", border: "1px solid rgba(237,219,119,0.3)" }}>
                          {advisor.first_name?.[0]}{advisor.last_name?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-[15px]">{advisorName}</p>
                        <p className="text-sm font-medium" style={{ color: "#EDDB77" }}>{advisor.title || "Wealth Strategist"}</p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Right: 3D Registration Form Card */}
                  <motion.div variants={fadeRight} initial="hidden" animate="visible"
                    transition={{ type: "spring", stiffness: 60, damping: 18, delay: 0.4 }}>
                    <TiltCard>
                      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden"
                        style={{
                          background: "rgba(255,255,255,0.97)",
                          border: "1px solid rgba(255,255,255,0.4)",
                          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
                        }}>
                        {/* Top accent gradient bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: "linear-gradient(90deg, #1A4D3E, #EDDB77, #1A4D3E)", backgroundSize: "200% 100%", animation: "ws-gradient-flow 3s ease-in-out infinite" }} />

                        <AnimatePresence mode="wait">
                          {submitted ? (
                            <SuccessConfetti />
                          ) : (
                            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl sm:text-2xl font-bold" style={{ color: "#1A4D3E" }}>Reserve Your Spot</h3>
                                <div className="flex -space-x-1">
                                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[#EDDB77] text-[#EDDB77]" />)}
                                </div>
                              </div>
                              <p className="text-sm mb-6 flex items-center gap-2" style={{ color: "#64748B" }}>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase" style={{ background: "rgba(16,185,129,0.1)", color: "#059669" }}>FREE</span>
                                {workshopDuration} minutes · No obligation
                              </p>

                              {isFull && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                  className="p-4 mb-6 text-center rounded-xl" style={{ background: "linear-gradient(135deg, #FEF2F2, #FFF5F5)", border: "1px solid #FECACA", color: "#DC2626" }}>
                                  <strong>This workshop is full.</strong>
                                </motion.div>
                              )}

                              {/* Multiple workshops selector */}
                              {workshops.length > 1 && (
                                <div className="mb-5">
                                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A4D3E" }}>Select a date:</label>
                                  <div className="relative">
                                    <select value={selectedIdx} onChange={(e) => { setSelectedIdx(Number(e.target.value)); setSubmitted(false); }}
                                      className="w-full appearance-none px-4 py-3 text-base border-2 rounded-xl bg-white pr-10 outline-none transition-all focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E]"
                                      style={{ borderColor: "#E5E7EB", color: "#1A4D3E" }}>
                                      {workshops.map((w: any, i: number) => (
                                        <option key={w.id} value={i}>{w.title} — {format(new Date(w.workshop_date + "T00:00:00"), "MMM d, yyyy")}</option>
                                      ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "#4A5565" }} />
                                  </div>
                                </div>
                              )}

                              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A4D3E" }}>
                                      First Name <span style={{ color: "#DC2626" }}>*</span>
                                    </label>
                                    <input type="text" value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} disabled={isFull}
                                      className="w-full px-4 py-3 text-base border-2 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E] hover:border-[#1A4D3E]/30"
                                      style={{ borderColor: errors.first_name ? "#DC2626" : "#E5E7EB", color: "#1A4D3E" }} aria-required="true" aria-invalid={!!errors.first_name} />
                                    {errors.first_name && <p className="text-xs mt-1" style={{ color: "#DC2626" }} role="alert">{errors.first_name}</p>}
                                  </div>
                                  <div>
                                    <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A4D3E" }}>
                                      Last Name <span style={{ color: "#DC2626" }}>*</span>
                                    </label>
                                    <input type="text" value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} disabled={isFull}
                                      className="w-full px-4 py-3 text-base border-2 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E] hover:border-[#1A4D3E]/30"
                                      style={{ borderColor: errors.last_name ? "#DC2626" : "#E5E7EB", color: "#1A4D3E" }} aria-required="true" aria-invalid={!!errors.last_name} />
                                    {errors.last_name && <p className="text-xs mt-1" style={{ color: "#DC2626" }} role="alert">{errors.last_name}</p>}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#1A4D3E" }}>
                                    Email <span style={{ color: "#DC2626" }}>*</span>
                                  </label>
                                  <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} disabled={isFull}
                                    className="w-full px-4 py-3 text-base border-2 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E] hover:border-[#1A4D3E]/30"
                                    style={{ borderColor: errors.email ? "#DC2626" : "#E5E7EB", color: "#1A4D3E" }} aria-required="true" aria-invalid={!!errors.email} />
                                  {errors.email && <p className="text-xs mt-1" style={{ color: "#DC2626" }} role="alert">{errors.email}</p>}
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#64748B" }}>
                                    Phone <span className="text-xs" style={{ color: "#9CA3AF" }}>(optional)</span>
                                  </label>
                                  <input type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} disabled={isFull}
                                    className="w-full px-4 py-3 text-base border-2 rounded-xl outline-none transition-all duration-200 focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E] hover:border-[#1A4D3E]/30"
                                    style={{ borderColor: "#E5E7EB", color: "#1A4D3E" }} />
                                </div>

                                {/* Premium Submit Button */}
                                <motion.button type="submit" disabled={submitting || isFull || cooldown}
                                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px -5px rgba(26, 77, 62, 0.5)" }}
                                  whileTap={{ scale: 0.98 }}
                                  className="relative w-full py-4 text-base sm:text-lg font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                                  style={{ background: "linear-gradient(135deg, #1A4D3E, #0F2F27)", boxShadow: "0 6px 20px -4px rgba(26, 77, 62, 0.45)" }}>
                                  {/* Shimmer effect on button */}
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{ background: "linear-gradient(105deg, transparent 40%, rgba(237,219,119,0.1) 45%, rgba(237,219,119,0.15) 50%, rgba(237,219,119,0.1) 55%, transparent 60%)", animation: "ws-shimmer 2s ease-in-out infinite" }} />
                                  <span className="relative z-10">
                                    {submitting ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Registering…
                                      </span>
                                    ) : (
                                      <span className="flex items-center justify-center gap-2">
                                        Reserve My Spot <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                      </span>
                                    )}
                                  </span>
                                </motion.button>
                              </form>

                              <p className="text-xs text-center mt-4 flex items-center justify-center gap-1.5" style={{ color: "#9CA3AF" }}>
                                <Shield className="w-3.5 h-3.5" /> Your information is secure and will never be shared.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </TiltCard>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ── WHAT YOU'LL LEARN ── */}
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg, #F8FAFB 0%, #FFFFFF 100%)" }}>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #1A4D3E, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #EDDB77, transparent 70%)" }} />
          {/* Top divider line */}
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(26,77,62,0.1) 50%, transparent 90%)" }} />

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-24 sm:py-32">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.div variants={fadeUp} className="text-center mb-16">
                <motion.span variants={scaleIn} className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-4 px-5 py-2 rounded-full"
                  style={{ color: "#1A4D3E", background: "linear-gradient(135deg, rgba(26,77,62,0.08), rgba(26,77,62,0.04))", border: "1px solid rgba(26,77,62,0.08)" }}>
                  <Sparkles className="w-3.5 h-3.5" /> Workshop Curriculum
                </motion.span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: "#0F2F27" }}>
                  What You'll{" "}
                  <span style={{ background: "linear-gradient(135deg, #1A4D3E, #2D8B6E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Learn</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-4xl mx-auto">
                {[
                  { title: "Eliminate Taxes", desc: "Discover how to eliminate taxes on retirement income using proven strategies", icon: "💰" },
                  { title: "Protect Your Wealth", desc: "Shield your assets from market volatility with stable growth vehicles", icon: "🛡️" },
                  { title: "Three Tax Buckets", desc: "Master the Three Tax Buckets strategy for optimal retirement planning", icon: "📊" },
                  { title: "Living Benefits", desc: "Access living benefits you can use before age 59½ without penalties", icon: "✨" },
                ].map((item, i) => (
                  <motion.div key={item.title} variants={fadeUpSpring} transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -6, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                    className="group relative p-7 sm:p-8 rounded-2xl cursor-default"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03), 0 12px 32px -8px rgba(26,77,62,0.08)",
                    }}>
                    {/* Hover gradient accent */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                      style={{ background: "linear-gradient(135deg, rgba(26,77,62,0.02), rgba(237,219,119,0.03))" }} />
                    <div className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100"
                      style={{ background: "linear-gradient(90deg, #1A4D3E, #EDDB77)", transformOrigin: "left" }} />

                    <div className="relative flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{ background: "linear-gradient(135deg, #1A4D3E, #2D6B5A)", boxShadow: "0 6px 16px -4px rgba(26,77,62,0.35)" }}>
                        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <h3 className="font-bold text-base mb-1.5 tracking-tight" style={{ color: "#0F2F27" }}>{item.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── WORKSHOP DETAILS + ADVISOR ── */}
        <section className="bg-white relative">
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(0,0,0,0.04) 50%, transparent 90%)" }} />
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-24 sm:py-32">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
              <motion.div variants={fadeUp} className="text-center mb-16">
                <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase mb-4 px-5 py-2 rounded-full"
                  style={{ color: "#1A4D3E", background: "linear-gradient(135deg, rgba(26,77,62,0.08), rgba(26,77,62,0.04))", border: "1px solid rgba(26,77,62,0.08)" }}>
                  <Calendar className="w-3.5 h-3.5" /> Event Information
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: "#0F2F27" }}>
                  Workshop{" "}
                  <span style={{ background: "linear-gradient(135deg, #1A4D3E, #2D8B6E)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Details</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
                {/* Details Card - 3 columns */}
                <motion.div variants={fadeUp} className="lg:col-span-3 p-8 sm:p-10 rounded-2xl"
                  style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 2px 8px rgba(0,0,0,0.03), 0 12px 32px -8px rgba(26,77,62,0.08)" }}>
                  <div className="space-y-6">
                    {[
                      { icon: Calendar, label: "Date", text: workshopDate },
                      { icon: Clock, label: "Time", text: `${workshopTime} ${workshopTimezone}` },
                      { icon: Clock, label: "Duration", text: `${workshopDuration} minutes` },
                      { icon: Monitor, label: "Format", text: "Live Online Workshop via Zoom" },
                    ].map(({ icon: Icon, label, text }) => (
                      <div key={label} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
                          style={{ background: "linear-gradient(135deg, rgba(26,77,62,0.08), rgba(26,77,62,0.04))" }}>
                          <Icon className="w-5 h-5" style={{ color: "#1A4D3E" }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold tracking-[0.15em] uppercase mb-0.5" style={{ color: "#94A3B8" }}>{label}</p>
                          <span className="text-[15px] font-semibold" style={{ color: "#1E293B" }}>{text}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Advisor Card - 2 columns */}
                <motion.div variants={scaleUpRotate}
                  className="lg:col-span-2 p-8 sm:p-10 rounded-2xl relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #1A4D3E, #0F2F27)", boxShadow: "0 12px 40px -10px rgba(26,77,62,0.4)" }}>
                  {/* Decorative glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #EDDB77, transparent)" }} />

                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-6" style={{ color: "rgba(237,219,119,0.7)" }}>Your Host</p>

                  <div className="relative flex flex-col items-center text-center">
                    {advisor.photo_url ? (
                      <div className="relative mb-5" style={{ animation: "ws-pulse-glow 3s ease-in-out infinite" }}>
                        <div className="w-28 h-28 rounded-full p-[3px]" style={{ background: "linear-gradient(135deg, #EDDB77, #C4A84D)" }}>
                          <img src={advisor.photo_url} alt={advisorName} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] flex-shrink-0" style={{ background: "#22C55E", borderColor: "#1A4D3E" }} />
                      </div>
                    ) : (
                      <div className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-5"
                        style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(237,219,119,0.3)" }}>
                        {advisor.first_name?.[0]}{advisor.last_name?.[0]}
                      </div>
                    )}

                    <h4 className="text-xl font-bold text-white mb-1">{advisorName}</h4>
                    <p className="text-sm font-medium mb-6" style={{ color: "#EDDB77" }}>{advisor.title || "Wealth Strategist"}</p>

                    <div className="w-full space-y-2.5">
                      <a href={`mailto:${advisor.email}`}
                        className="flex items-center justify-center gap-2.5 text-sm py-3 rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-[1.02]"
                        style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Mail className="w-4 h-4" style={{ color: "#EDDB77" }} /> {advisor.email}
                      </a>
                      {advisor.phone && (
                        <a href={`tel:${advisor.phone}`}
                          className="flex items-center justify-center gap-2.5 text-sm py-3 rounded-xl transition-all duration-200 hover:bg-white/10 hover:scale-[1.02]"
                          style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <Phone className="w-4 h-4" style={{ color: "#EDDB77" }} /> {advisor.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── TRUST INDICATORS ── */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #0F2F27 0%, #1A4D3E 50%, #0F2F27 100%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${workshopHeroBg})`, backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "overlay" }} />
          <FloatingOrbs />
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(237,219,119,0.3), transparent)" }} />

          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: Shield, label: "Independent Fiduciary", desc: "Your interests always come first" },
                { icon: Award, label: "Nationwide Coverage", desc: "Licensed in 50 states" },
                { icon: Users, label: "75+ Carrier Partners", desc: "Access to the best products" },
              ].map(({ icon: Icon, label, desc }, i) => (
                <motion.div key={label} variants={scaleIn} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300 } }}
                  className="flex flex-col items-center gap-4 p-8 rounded-2xl cursor-default"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(237,219,119,0.15), rgba(237,219,119,0.05))", border: "1px solid rgba(237,219,119,0.15)", animation: "ws-float-slow 6s ease-in-out infinite", animationDelay: `${i * 0.5}s` }}>
                    <Icon className="w-7 h-7" style={{ color: "#EDDB77" }} />
                  </div>
                  <span className="text-white font-bold text-base tracking-wide">{label}</span>
                  <span className="text-white/50 text-sm leading-relaxed">{desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── FOOTER ── */}
        <footer className="relative" style={{ background: "#0F2F27" }}>
          <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(237,219,119,0.2), transparent)" }} />
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <img src="https://everencewealth-beta.vercel.app/logo-icon.png" alt="Everence Wealth" className="h-8 brightness-0 invert opacity-40" />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              © {new Date().getFullYear()} Everence Wealth. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default WorkshopLanding;

