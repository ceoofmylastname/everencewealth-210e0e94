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
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import workshopHeroBg from "@/assets/workshop-hero-bg.jpg";

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
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardShadow = "shadow-[0_8px_30px_-4px_rgba(26,77,62,0.15)]";
const cardHoverShadow = "hover:shadow-[0_16px_40px_-4px_rgba(26,77,62,0.25)]";

// ── Success Confetti Component ──
function SuccessConfetti() {
  useEffect(() => {
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      // Left side burst
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#EDDB77", "#10B981", "#1A4D3E", "#FFD700", "#ffffff"],
      });
      // Right side burst
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#EDDB77", "#10B981", "#1A4D3E", "#FFD700", "#ffffff"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      className="text-center py-10 px-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
        className="w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full relative"
        style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.6)" }}
          animate={{ boxShadow: "0 0 0 20px rgba(16, 185, 129, 0)" }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl sm:text-3xl font-bold mb-2"
        style={{ color: "#1A4D3E" }}
      >
        Congratulations! 🎉
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="text-base sm:text-lg mb-1 font-medium"
        style={{ color: "#1A4D3E" }}
      >
        You're all set!
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-sm"
        style={{ color: "#4A5565" }}
      >
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
      const { error } = await supabase.from("workshop_registrations").insert({
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
        toast.success("You're registered!");
        setCooldown(true);
        setTimeout(() => setCooldown(false), 30000);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1A4D3E 0%, #0F2F27 100%)", fontFamily: "GeistSans, system-ui, sans-serif" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md px-6">
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
  // Headline and subheadline are hardcoded for brand consistency

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
      </Helmet>

      <div className="min-h-screen bg-white" style={{ fontFamily: "GeistSans, system-ui, sans-serif" }}>
        
        {/* ── HERO SECTION ── */}
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1A4D3E 0%, #0F2F27 100%)" }}>
          {/* Background image overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${workshopHeroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "overlay",
            }}
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A4D3E]/90 via-[#1A4D3E]/70 to-transparent" />

          <div className="relative z-10">
            {/* Header */}
            <header className="border-b border-white/10">
              <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                <img
                  src="https://everencewealth-beta.vercel.app/logo-icon.png"
                  alt="Everence Wealth logo"
                  className="h-10 sm:h-12 brightness-0 invert"
                />
                {seatsRemaining !== null && seatsRemaining > 0 && seatsRemaining <= 15 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: "rgba(220, 38, 38, 0.2)", color: "#FCA5A5" }}
                  >
                    <Sparkles className="w-3 h-3" />
                    {seatsRemaining} spots left
                  </motion.div>
                )}
              </div>
            </header>

            {/* Hero Content */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                
                {/* Left: Hero text */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="overflow-hidden min-w-0"
                >
                  {/* Date badge */}
                  <motion.div
                    variants={fadeLeft}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                    style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    <Calendar className="w-4 h-4 text-[#EDDB77]" />
                    <span className="text-sm font-medium text-white/90">{workshopDate}</span>
                  </motion.div>

                  {/* Headline */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-5 break-words text-white"
                  >
                    Build Your{" "}
                    <span className="relative inline-block pb-1">Tax-Free<svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><path d="M2 8.5C30 3 70 2 100 5.5C130 9 170 4 198 6" stroke="#EDDB77" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg></span>{" "}
                    <span className="bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient-shift_3s_ease-in-out_infinite] bg-gradient-to-r from-[#EDDB77] via-white to-[#EDDB77]">Retirement</span>
                  </motion.h1>

                  {/* Subheadline */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                    className="text-base sm:text-lg md:text-xl mb-8 text-white/70 max-w-lg"
                  >
                    Join a complimentary workshop and discover proven strategies to eliminate taxes, protect your wealth, and retire with confidence.
                  </motion.p>

                  {/* Quick info pills */}
                  <motion.div variants={fadeUp} transition={{ delay: 0.5 }} className="flex flex-wrap gap-3 mb-8">
                    {[
                      { icon: Clock, text: `${workshopTime} ${workshopTimezone}` },
                      { icon: Monitor, text: "Live Online" },
                      { icon: Clock, text: `${workshopDuration} min` },
                    ].map(({ icon: Icon, text }) => (
                      <div
                        key={text}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                      >
                        <Icon className="w-3.5 h-3.5 text-[#EDDB77]" />
                        <span className="text-white/80">{text}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Advisor mini card in hero */}
                  <motion.div
                    variants={fadeUp}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-4"
                  >
                    {advisor.photo_url ? (
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full p-[2px]" style={{ background: "linear-gradient(135deg, #EDDB77, #C4A84D)" }}>
                          <img
                            src={advisor.photo_url}
                            alt={`${advisorName}`}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                      >
                        {advisor.first_name?.[0]}{advisor.last_name?.[0]}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">{advisorName}</p>
                      <p className="text-sm text-[#EDDB77]">{advisor.title || "Wealth Strategist"}</p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Right: Registration Form */}
                <motion.div
                  variants={fadeRight}
                  initial="hidden"
                  animate="visible"
                  transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.3 }}
                >
                  <div
                    className={`p-6 sm:p-8 rounded-2xl ${cardShadow} backdrop-blur-sm`}
                    style={{
                      background: "rgba(255,255,255,0.97)",
                      border: "1px solid rgba(255,255,255,0.3)",
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {submitted ? (
                        <SuccessConfetti />
                      ) : (
                        <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <h3 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: "#1A4D3E" }}>
                            Reserve Your Spot
                          </h3>
                          <p className="text-sm mb-6" style={{ color: "#4A5565" }}>
                            Free · {workshopDuration} minutes · No obligation
                          </p>

                          {isFull && (
                            <div className="p-4 mb-6 text-center rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
                              <strong>This workshop is full.</strong>
                            </div>
                          )}

                          {/* Multiple workshops selector */}
                          {workshops.length > 1 && (
                            <div className="mb-5">
                              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A4D3E" }}>
                                Select a date:
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedIdx}
                                  onChange={(e) => { setSelectedIdx(Number(e.target.value)); setSubmitted(false); }}
                                  className="w-full appearance-none px-4 py-3 text-base border rounded-xl bg-white pr-10 outline-none transition-all focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E]"
                                  style={{ borderColor: "#E5E7EB", color: "#1A4D3E" }}
                                >
                                  {workshops.map((w: any, i: number) => (
                                    <option key={w.id} value={i}>
                                      {w.title} — {format(new Date(w.workshop_date + "T00:00:00"), "MMM d, yyyy")}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "#4A5565" }} />
                              </div>
                            </div>
                          )}

                          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {/* First & Last Name side by side */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A4D3E" }}>
                                  First Name <span style={{ color: "#DC2626" }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  value={form.first_name}
                                  onChange={(e) => handleChange("first_name", e.target.value)}
                                  disabled={isFull}
                                  className="w-full px-4 py-3 text-base border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E]"
                                  style={{ borderColor: errors.first_name ? "#DC2626" : "#E5E7EB", color: "#1A4D3E" }}
                                  aria-required="true"
                                  aria-invalid={!!errors.first_name}
                                />
                                {errors.first_name && <p className="text-xs mt-1" style={{ color: "#DC2626" }} role="alert">{errors.first_name}</p>}
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A4D3E" }}>
                                  Last Name <span style={{ color: "#DC2626" }}>*</span>
                                </label>
                                <input
                                  type="text"
                                  value={form.last_name}
                                  onChange={(e) => handleChange("last_name", e.target.value)}
                                  disabled={isFull}
                                  className="w-full px-4 py-3 text-base border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E]"
                                  style={{ borderColor: errors.last_name ? "#DC2626" : "#E5E7EB", color: "#1A4D3E" }}
                                  aria-required="true"
                                  aria-invalid={!!errors.last_name}
                                />
                                {errors.last_name && <p className="text-xs mt-1" style={{ color: "#DC2626" }} role="alert">{errors.last_name}</p>}
                              </div>
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-sm font-medium mb-1.5" style={{ color: "#1A4D3E" }}>
                                Email <span style={{ color: "#DC2626" }}>*</span>
                              </label>
                              <input
                                type="email"
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                disabled={isFull}
                                className="w-full px-4 py-3 text-base border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E]"
                                style={{ borderColor: errors.email ? "#DC2626" : "#E5E7EB", color: "#1A4D3E" }}
                                aria-required="true"
                                aria-invalid={!!errors.email}
                              />
                              {errors.email && <p className="text-xs mt-1" style={{ color: "#DC2626" }} role="alert">{errors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                              <label className="block text-sm font-medium mb-1.5" style={{ color: "#4A5565" }}>
                                Phone <span className="text-xs" style={{ color: "#9CA3AF" }}>(optional)</span>
                              </label>
                              <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                                disabled={isFull}
                                className="w-full px-4 py-3 text-base border rounded-xl outline-none transition-all focus:ring-2 focus:ring-[#1A4D3E]/20 focus:border-[#1A4D3E]"
                                style={{ borderColor: "#E5E7EB", color: "#1A4D3E" }}
                              />
                            </div>

                            {/* Submit */}
                            <motion.button
                              type="submit"
                              disabled={submitting || isFull || cooldown}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full py-3.5 text-base sm:text-lg font-bold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background: "linear-gradient(135deg, #1A4D3E, #0F2F27)",
                                boxShadow: "0 4px 15px -3px rgba(26, 77, 62, 0.4)",
                              }}
                            >
                              {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  Registering…
                                </span>
                              ) : (
                                "Reserve My Spot →"
                              )}
                            </motion.button>
                          </form>

                          <p className="text-xs text-center mt-4" style={{ color: "#9CA3AF" }}>
                            🔒 Your information is secure and will never be shared.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHAT YOU'LL LEARN ── */}
        <section className="relative overflow-hidden" style={{ background: "#FAFBFC" }}>
          {/* Subtle geometric accent */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #1A4D3E, transparent)" }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, #EDDB77, transparent)" }} />
          
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div variants={fadeUp} className="text-center mb-14">
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3 px-4 py-1.5 rounded-full" style={{ color: "#1A4D3E", background: "rgba(26,77,62,0.08)" }}>
                  Workshop Curriculum
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: "#0F2F27" }}>
                  What You'll Learn
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
                {[
                  { title: "Eliminate Taxes", desc: "Discover how to eliminate taxes on retirement income using proven strategies", num: "01" },
                  { title: "Protect Your Wealth", desc: "Shield your assets from market volatility with stable growth vehicles", num: "02" },
                  { title: "Three Tax Buckets", desc: "Master the Three Tax Buckets strategy for optimal retirement planning", num: "03" },
                  { title: "Living Benefits", desc: "Access living benefits you can use before age 59½ without penalties", num: "04" },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative p-6 sm:p-7 rounded-2xl cursor-default transition-all duration-300"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(26,77,62,0.08)",
                    }}
                  >
                    {/* Top accent line */}
                    <div className="absolute top-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(90deg, #1A4D3E, #EDDB77)" }} />
                    
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{ background: "linear-gradient(135deg, #1A4D3E, #2D6B5A)", boxShadow: "0 4px 12px -2px rgba(26,77,62,0.3)" }}>
                        <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[15px] sm:text-base mb-1.5 tracking-tight" style={{ color: "#0F2F27" }}>{item.title}</h3>
                        <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── WORKSHOP DETAILS ── */}
        <section className="bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <motion.div variants={fadeUp} className="text-center mb-14">
                <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3 px-4 py-1.5 rounded-full" style={{ color: "#1A4D3E", background: "rgba(26,77,62,0.08)" }}>
                  Event Information
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold" style={{ color: "#0F2F27" }}>
                  Workshop Details
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
                {/* Details Card - 3 columns */}
                <motion.div
                  variants={fadeUp}
                  className="lg:col-span-3 p-8 sm:p-10 rounded-2xl transition-all duration-300"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(26,77,62,0.08)",
                  }}
                >
                  <div className="space-y-5">
                    {[
                      { icon: Calendar, label: "Date", text: workshopDate },
                      { icon: Clock, label: "Time", text: `${workshopTime} ${workshopTimezone}` },
                      { icon: Clock, label: "Duration", text: `${workshopDuration} minutes` },
                      { icon: Monitor, label: "Format", text: "Live Online Workshop via Zoom" },
                    ].map(({ icon: Icon, label, text }) => (
                      <div key={label} className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, rgba(26,77,62,0.08), rgba(26,77,62,0.04))" }}>
                          <Icon className="w-5 h-5" style={{ color: "#1A4D3E" }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-0.5" style={{ color: "#94A3B8" }}>{label}</p>
                          <span className="text-[15px] font-medium" style={{ color: "#1E293B" }}>{text}</span>
                        </div>
                      </div>
                    ))}
                    {seatsRemaining !== null && (
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: seatsRemaining <= 10 ? "rgba(220,38,38,0.08)" : "linear-gradient(135deg, rgba(26,77,62,0.08), rgba(26,77,62,0.04))" }}>
                          <Users className="w-5 h-5" style={{ color: seatsRemaining <= 10 ? "#DC2626" : "#1A4D3E" }} />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-0.5" style={{ color: "#94A3B8" }}>Availability</p>
                          <span className="text-[15px] font-semibold" style={{ color: seatsRemaining <= 10 ? "#DC2626" : "#1E293B" }}>
                            {seatsRemaining > 0 ? `${seatsRemaining} seats remaining` : "This workshop is full"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Advisor Card - 2 columns */}
                <motion.div
                  variants={scaleIn}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="lg:col-span-2 p-8 sm:p-10 rounded-2xl transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #1A4D3E, #0F2F27)",
                    boxShadow: "0 8px 32px -8px rgba(26,77,62,0.35)",
                  }}
                >
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: "rgba(237,219,119,0.7)" }}>Your Host</p>
                  
                  <div className="flex flex-col items-center text-center">
                    {advisor.photo_url ? (
                      <div className="relative mb-5">
                        <div className="w-28 h-28 rounded-full p-[3px]" style={{ background: "linear-gradient(135deg, #EDDB77, #C4A84D)" }}>
                          <img
                            src={advisor.photo_url}
                            alt={advisorName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        </div>
                        {/* Online indicator */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[3px] flex-shrink-0" style={{ background: "#22C55E", borderColor: "#1A4D3E" }} />
                      </div>
                    ) : (
                      <div
                        className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-5"
                        style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(237,219,119,0.3)" }}
                      >
                        {advisor.first_name?.[0]}{advisor.last_name?.[0]}
                      </div>
                    )}
                    
                    <h4 className="text-xl font-bold text-white mb-1">{advisorName}</h4>
                    <p className="text-sm font-medium mb-6" style={{ color: "#EDDB77" }}>{advisor.title || "Wealth Strategist"}</p>
                    
                    <div className="w-full space-y-2.5">
                      <a href={`mailto:${advisor.email}`} className="flex items-center justify-center gap-2.5 text-sm py-2.5 rounded-xl transition-all hover:bg-white/10" style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <Mail className="w-4 h-4" style={{ color: "#EDDB77" }} /> {advisor.email}
                      </a>
                      {advisor.phone && (
                        <a href={`tel:${advisor.phone}`} className="flex items-center justify-center gap-2.5 text-sm py-2.5 rounded-xl transition-all hover:bg-white/10" style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
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
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1A4D3E 0%, #0F2F27 100%)" }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${workshopHeroBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              mixBlendMode: "overlay",
            }}
          />
          <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              {[
                { icon: Shield, label: "Independent Fiduciary", desc: "Your interests always come first" },
                { icon: Award, label: "Established 1998", desc: "25+ years of trusted service" },
                { icon: Users, label: "75+ Carrier Partners", desc: "Access to the best products" },
              ].map(({ icon: Icon, label, desc }) => (
                <motion.div
                  key={label}
                  variants={scaleIn}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(237,219,119,0.15)" }}>
                    <Icon className="w-7 h-7" style={{ color: "#EDDB77" }} />
                  </div>
                  <span className="text-white font-semibold text-base tracking-wide">{label}</span>
                  <span className="text-white/50 text-sm">{desc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── FOOTER ── */}
        <footer className="border-t" style={{ borderColor: "#F0F0F0" }}>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 text-center">
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              © {new Date().getFullYear()} Everence Wealth. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default WorkshopLanding;
