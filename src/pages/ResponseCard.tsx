import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Check, User, Mail, Phone, MapPin, DollarSign, MessageSquare, Heart, Send } from "lucide-react";

/* ───────── constants ───────── */
const phoneRegex = /^\(\d{3}\)\s?\d{3}-\d{4}$/;
const TOTAL_STEPS = 8;

const maritalOptions = ["Single", "Married", "Separated", "Divorced", "Widowed"];
const incomeOptions = ["Less than $30k", "$30k – $50k", "$50k – $100k", "$100k+"];
const topicOptions = [
  "A comprehensive analysis of my current portfolio and advantages of converting to an indexed plan",
  "Tax-free retirement alternatives to IRAs, 401(k)s, etc.",
  "I want a second opinion on my current retirement plan",
];

const stepIcons = [User, User, Heart, Mail, MapPin, DollarSign, MessageSquare, Send];
const stepLabels = [
  "Your Agent",
  "Your Name",
  "About You",
  "Contact Info",
  "Your Address",
  "Financial Profile",
  "Meeting Interests",
  "Final Step",
];

/* ───────── per-step schemas ───────── */
const stepSchemas = [
  z.object({ assigned_advisor_id: z.string().min(1, "Please select an agent") }),
  z.object({
    first_name: z.string().trim().min(1, "First name is required"),
    last_name: z.string().trim().min(1, "Last name is required"),
  }),
  z.object({ marital_status: z.string().min(1, "Please select your marital status") }),
  z.object({
    email: z.string().trim().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Phone must be (000) 000-0000"),
  }),
  z.object({
    street_address: z.string().trim().min(1, "Street address is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    zip_code: z.string().trim().min(1, "Zip code is required"),
  }),
  z.object({
    income_range: z.string().min(1, "Please select your income range"),
    wants_free_consultation: z.string().min(1, "Please select an option"),
  }),
  z.object({
    meeting_topics: z.array(z.string()).min(1, "Select at least one topic"),
  }),
  z.object({}),
];

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/* ───────── component ───────── */
export default function ResponseCard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [advisors, setAdvisors] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    assigned_advisor_id: "",
    first_name: "",
    last_name: "",
    marital_status: "",
    email: "",
    phone: "",
    street_address: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
    income_range: "",
    wants_free_consultation: "",
    meeting_topics: [] as string[],
    availability: "",
    comments: "",
  });

  useEffect(() => {
    supabase
      .from("advisors")
      .select("id, first_name, last_name")
      .eq("is_active", true)
      .order("first_name")
      .then(({ data }) => { if (data) setAdvisors(data); });
  }, []);

  const set = (key: string, val: any) => setForm((p) => ({ ...p, [key]: val }));

  const selectedAdvisor = advisors.find((a) => a.id === form.assigned_advisor_id);

  const validateStep = useCallback(() => {
    const schema = stepSchemas[step];
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      setErrors(errs);
      return false;
    }
    setErrors({});
    return true;
  }, [step, form]);

  const next = () => {
    if (!validateStep()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const back = () => {
    setDirection(-1);
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const fireConfetti = () => {
    const colors = ["#1A4D3E", "#C8A96E", "#FFFFFF", "#F5E6C8", "#EDDB77"];
    confetti({ particleCount: 150, spread: 100, colors, origin: { y: 0.6 }, shapes: ["circle", "square"] });
    setTimeout(() => confetti({ particleCount: 80, spread: 120, colors, origin: { y: 0.5, x: 0.3 } }), 300);
    setTimeout(() => confetti({ particleCount: 80, spread: 120, colors, origin: { y: 0.5, x: 0.7 } }), 500);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("response_card_submissions" as any).insert({
        assigned_advisor_id: form.assigned_advisor_id,
        first_name: form.first_name,
        last_name: form.last_name,
        marital_status: form.marital_status,
        email: form.email,
        phone: form.phone,
        street_address: form.street_address || null,
        address_line_2: form.address_line_2 || null,
        city: form.city || null,
        state: form.state || null,
        zip_code: form.zip_code || null,
        income_range: form.income_range,
        wants_free_consultation: form.wants_free_consultation === "yes",
        meeting_topics: form.meeting_topics,
        availability: form.availability || null,
        comments: form.comments || null,
      });
      if (error) throw error;
      setSubmitted(true);
      setTimeout(fireConfetti, 200);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTopic = (topic: string) => {
    const current = form.meeting_topics;
    set("meeting_topics", current.includes(topic) ? current.filter((t) => t !== topic) : [...current, topic]);
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step < TOTAL_STEPS - 1) { e.preventDefault(); next(); }
  };

  /* ─── pill select helper ─── */
  const PillSelect = ({ options, value, onChange, error }: { options: string[]; value: string; onChange: (v: string) => void; error?: string }) => (
    <div>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <motion.button
            key={opt}
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onChange(opt)}
            className={`px-5 py-3.5 rounded-full text-sm font-medium border transition-all duration-200 min-h-[48px] ${
              value === opt
                ? "bg-[#C8A96E] text-white border-[#C8A96E] shadow-[0_0_20px_rgba(200,169,110,0.25)]"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:border-[#C8A96E]/40 hover:text-gray-800"
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );

  /* ─── card select (for income / topics) ─── */
  const CardSelect = ({ options, selected, onToggle, multi = false, error }: { options: string[]; selected: string | string[]; onToggle: (v: string) => void; multi?: boolean; error?: string }) => (
    <div>
      <div className="grid gap-3">
        {options.map((opt) => {
          const isSelected = multi ? (selected as string[]).includes(opt) : selected === opt;
          return (
            <motion.button
              key={opt}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(opt)}
              className={`text-left px-5 py-4 rounded-2xl border text-sm transition-all duration-200 min-h-[48px] ${
                isSelected
                  ? "bg-[#C8A96E]/10 text-[#1A4D3E] border-[#C8A96E] shadow-[0_0_25px_rgba(200,169,110,0.12)]"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? "border-[#C8A96E] bg-[#C8A96E]" : "border-gray-300"
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </span>
                {opt}
              </span>
            </motion.button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );

  /* ─── input helper ─── */
  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base sm:text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#C8A96E]/50 focus:ring-1 focus:ring-[#C8A96E]/30 transition-all min-h-[48px]";

  /* ─── step content ─── */
  const renderStep = () => {
    const StepIcon = stepIcons[step];
    const label = stepLabels[step];

    const header = (title: string, subtitle?: string) => (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A4D3E]/10 flex items-center justify-center">
            <StepIcon className="w-5 h-5 text-[#1A4D3E]" />
          </div>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{label}</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-bold text-[#1A4D3E]">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-2">{subtitle}</p>}
      </div>
    );

    switch (step) {
      case 0:
        return (
          <div onKeyDown={handleKeyDown}>
            {header("Who invited you to this presentation?", "Select the agent who invited you.")}
            <div className="grid gap-3 max-h-[50vh] overflow-y-auto pr-1" style={{ WebkitOverflowScrolling: "touch" }}>
              {advisors.map((a) => (
                <motion.button
                  key={a.id}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => set("assigned_advisor_id", a.id)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200 ${
                    form.assigned_advisor_id === a.id
                      ? "bg-[#C8A96E]/10 border-[#C8A96E] shadow-[0_0_25px_rgba(200,169,110,0.12)]"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    form.assigned_advisor_id === a.id ? "bg-[#C8A96E] text-white" : "bg-gray-200 text-gray-500"
                  }`}>
                    {a.first_name[0]}{a.last_name[0]}
                  </div>
                  <span className={`text-sm font-medium ${form.assigned_advisor_id === a.id ? "text-[#1A4D3E]" : "text-gray-600"}`}>
                    {a.first_name} {a.last_name}
                  </span>
                  {form.assigned_advisor_id === a.id && <Check className="w-5 h-5 text-[#C8A96E] ml-auto" />}
                </motion.button>
              ))}
            </div>
            {errors.assigned_advisor_id && <p className="text-red-500 text-xs mt-2">{errors.assigned_advisor_id}</p>}
          </div>
        );

      case 1:
        return (
          <div onKeyDown={handleKeyDown}>
            {header("What's your name?")}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">First Name</label>
                <input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} className={inputCls} placeholder="John" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Last Name</label>
                <input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} className={inputCls} placeholder="Doe" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            {header("What's your marital status?")}
            <PillSelect options={maritalOptions} value={form.marital_status} onChange={(v) => set("marital_status", v)} error={errors.marital_status} />
          </div>
        );

      case 3:
        return (
          <div onKeyDown={handleKeyDown}>
            {header("How can we reach you?", "We'll only use this to schedule your consultation.")}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} placeholder="john@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Phone Number</label>
                <input value={form.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} className={inputCls} placeholder="(000) 000-0000" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div onKeyDown={handleKeyDown}>
            {header("What's your address?")}
            <div className="space-y-4">
              <div>
                <input value={form.street_address} onChange={(e) => set("street_address", e.target.value)} className={inputCls} placeholder="Street Address" />
                {errors.street_address && <p className="text-red-500 text-xs mt-1">{errors.street_address}</p>}
              </div>
              <input value={form.address_line_2} onChange={(e) => set("address_line_2", e.target.value)} className={inputCls} placeholder="Apt, Suite, etc. (optional)" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputCls} placeholder="City" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                <div>
                  <input value={form.state} onChange={(e) => set("state", e.target.value)} className={inputCls} placeholder="State" />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
                <div>
                  <input value={form.zip_code} onChange={(e) => set("zip_code", e.target.value)} className={inputCls} placeholder="Zip" />
                  {errors.zip_code && <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            {header("Tell us about your financial profile")}
            <div className="space-y-6">
              <div>
                <label className="text-xs text-gray-400 mb-3 block uppercase tracking-wider">Household Income</label>
                <CardSelect options={incomeOptions} selected={form.income_range} onToggle={(v) => set("income_range", v)} error={errors.income_range} />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-3 block uppercase tracking-wider">
                  Free Consultation & Financial Analysis?
                </label>
                <div className="flex gap-3">
                  {["yes", "no"].map((v) => (
                    <motion.button
                      key={v}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => set("wants_free_consultation", v)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-all ${
                        form.wants_free_consultation === v
                          ? "bg-[#C8A96E]/10 text-[#1A4D3E] border-[#C8A96E]"
                          : "bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {v === "yes" ? "Yes, I'm interested" : "No, thanks"}
                    </motion.button>
                  ))}
                </div>
                {errors.wants_free_consultation && <p className="text-red-500 text-xs mt-2">{errors.wants_free_consultation}</p>}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            {header("What topics interest you?", "Select all that apply.")}
            <div className="space-y-6">
              <CardSelect options={topicOptions} selected={form.meeting_topics} onToggle={toggleTopic} multi error={errors.meeting_topics} />
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Best Day & Time to Meet (optional)</label>
                <textarea value={form.availability} onChange={(e) => set("availability", e.target.value)} rows={3} className={inputCls} placeholder="Please provide 2–3 available times" />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            {header("Almost done!", "Any additional comments or questions?")}
            <textarea value={form.comments} onChange={(e) => set("comments", e.target.value)} rows={4} className={inputCls} placeholder="Optional — share anything else you'd like us to know" />
          </div>
        );

      default:
        return null;
    }
  };

  /* ─── success screen ─── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center px-4">
        {/* Green gradient accents */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#1A4D3E]/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#1A4D3E]/[0.04] blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-md w-full text-center p-10 rounded-3xl border border-gray-100 bg-white shadow-[0_8px_40px_rgba(26,77,62,0.08)] relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-[#1A4D3E] flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#1A4D3E] mb-3">
            Thank you, {form.first_name}!
          </h2>
          <p className="text-gray-500 leading-relaxed">
            Your selected advisor, <span className="text-[#C8A96E] font-semibold">{selectedAdvisor?.first_name} {selectedAdvisor?.last_name}</span>, will be reaching out to you shortly.
          </p>
          <motion.a
            href="/"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block mt-8 px-8 py-3 rounded-full bg-[#C8A96E] text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(200,169,110,0.25)] transition-shadow"
          >
            Return Home
          </motion.a>
        </motion.div>
      </div>
    );
  }

  /* ─── main render ─── */
  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Green gradient accents */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-[#1A4D3E]/[0.06] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#1A4D3E]/[0.04] blur-[120px] pointer-events-none" />

      {/* Nav */}
      <div className="border-b border-gray-100 relative z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-4">
          <img
            src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
            alt="Everence Wealth"
            className="h-8 w-auto"
          />
          <span className="text-xs text-gray-400 uppercase tracking-widest">Response Card</span>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-3xl mx-auto w-full px-6 pt-6 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Step {step + 1} of {TOTAL_STEPS}</span>
          <span className="text-xs text-[#C8A96E]">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #1A4D3E, #C8A96E)" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="border-t border-gray-100 relative z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-6 py-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={back}
            disabled={step === 0}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>

          {step < TOTAL_STEPS - 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#C8A96E] text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(200,169,110,0.25)] transition-shadow"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#C8A96E] text-white font-semibold text-sm hover:shadow-[0_0_30px_rgba(200,169,110,0.25)] transition-shadow disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"} <Send className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
