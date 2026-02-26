import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

interface Manager {
  id: string;
  first_name: string;
  last_name: string;
  role?: string;
  is_manager?: boolean;
}

interface FormData {
  referral_source: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone: string;
  state: string;
  address: string;
  is_licensed: boolean | null;
  manager_id: string;
  consent: boolean;
}

const TOTAL_STEPS = 9;

export default function ContractingIntake() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [form, setForm] = useState<FormData>({
    referral_source: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    state: "",
    address: "",
    is_licensed: null,
    manager_id: "",
    consent: false,
  });

  useEffect(() => {
    supabase.functions
      .invoke("list-contracting-managers")
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load managers:", error);
          return;
        }
        if (Array.isArray(data)) {
          setManagers(data);
        }
      });
  }, []);

  const update = (key: keyof FormData, value: string | boolean | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canContinue = (): boolean => {
    switch (step) {
      case 0: return form.referral_source.trim().length > 0;
      case 1: return form.first_name.trim().length > 0 && form.last_name.trim().length > 0;
      case 2: return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      case 3: return form.password.length >= 8 && form.password === form.confirm_password;
      case 4: return form.phone.trim().length >= 7;
      case 5: return form.state.length > 0;
      case 6: return form.is_licensed !== null;
      case 7: return form.manager_id.length > 0;
      case 8: return form.consent;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await supabase.functions.invoke("contracting-intake", {
        body: {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          phone: form.phone.trim(),
          referral_source: form.referral_source.trim(),
          
          state: form.state,
          address: form.address.trim(),
          is_licensed: form.is_licensed,
          manager_id: form.manager_id || null,
        },
      });

      if (res.error) throw new Error(res.error.message);
      const data = res.data as { error?: string; success?: boolean };
      if (data?.error) throw new Error(data.error);

      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === TOTAL_STEPS - 1) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canContinue()) {
      e.preventDefault();
      next();
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-[hsl(160,45%,25%)] flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Application Submitted!
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Your account has been created successfully.
          </p>
          <p className="text-muted-foreground">
            You can now log in with <span className="font-semibold text-foreground">{form.email}</span> and the password you chose.
          </p>
          <Button
            onClick={() => navigate("/portal/login")}
            className="mt-8 bg-[hsl(160,45%,25%)] hover:bg-[hsl(160,45%,20%)] text-white px-8 py-3 rounded-xl text-base"
          >
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  const slideVariants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  };

  const renderStep = () => {
    const inputClass =
      "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3 text-xl text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:border-[hsl(160,45%,25%)] transition-colors";
    const selectClass =
      "w-full bg-transparent border-0 border-b-2 border-border rounded-none px-0 py-3 text-xl text-foreground focus:ring-0 focus:border-[hsl(160,45%,25%)] transition-colors appearance-none cursor-pointer";

    switch (step) {
      case 0:
        return (
          <div key="step-0" className="space-y-6" onKeyDown={handleKeyDown}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Who referred you?
            </h2>
            <p className="text-muted-foreground text-lg">Let us know how you heard about us</p>
            <Input
              autoFocus
              className={inputClass}
              placeholder="Type your answer..."
              value={form.referral_source}
              onChange={(e) => update("referral_source", e.target.value)}
            />
          </div>
        );

      case 1:
        return (
          <div key="step-1" className="space-y-6" onKeyDown={handleKeyDown}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              What is your name?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">First name</label>
                <Input
                  autoFocus
                  className={inputClass}
                  placeholder="First name"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Last name</label>
                <Input
                  className={inputClass}
                  placeholder="Last name"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div key="step-2" className="space-y-6" onKeyDown={handleKeyDown}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              What is your email?
            </h2>
            <p className="text-muted-foreground text-lg">We'll use this to set up your account</p>
            <Input
              autoFocus
              type="email"
              className={inputClass}
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        );

      case 3:
        return (
          <div key="step-3" className="space-y-6" onKeyDown={handleKeyDown}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Create your password
            </h2>
            <p className="text-muted-foreground text-lg">You'll use this to log in to your dashboard</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Password</label>
                <Input
                  autoFocus
                  type="password"
                  className={inputClass}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Confirm password</label>
                <Input
                  type="password"
                  className={inputClass}
                  placeholder="Re-enter your password"
                  value={form.confirm_password}
                  onChange={(e) => update("confirm_password", e.target.value)}
                />
              </div>
              {form.password.length > 0 && form.password.length < 8 && (
                <p className="text-sm text-destructive">Password must be at least 8 characters</p>
              )}
              {form.confirm_password.length > 0 && form.password !== form.confirm_password && (
                <p className="text-sm text-destructive">Passwords don't match</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div key="step-4" className="space-y-6" onKeyDown={handleKeyDown}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              What is your phone number?
            </h2>
            <Input
              autoFocus
              type="tel"
              className={inputClass}
              placeholder="(555) 123-4567"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        );

      case 5:
        return (
          <div key="step-4" className="space-y-6" onKeyDown={handleKeyDown}>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Where are you located?
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">State</label>
                <select
                  className={selectClass}
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                >
                  <option value="">Select your state...</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Full address (optional)</label>
                <Input
                  className={inputClass}
                  placeholder="123 Main St, City, State ZIP"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div key="step-6" className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Are you currently licensed?
            </h2>
            <div className="space-y-3 mt-4">
              {[
                { label: "Yes", value: true },
                { label: "No", value: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => update("is_licensed", opt.value)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-lg font-medium ${
                    form.is_licensed === opt.value
                      ? "border-[hsl(160,45%,25%)] bg-[hsl(160,45%,25%/0.08)] text-foreground"
                      : "border-border hover:border-muted-foreground/40 text-foreground"
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-sm font-bold mr-3">
                    {opt.label === "Yes" ? "Y" : "N"}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div key="step-7" className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Select your manager
            </h2>
            <p className="text-muted-foreground text-lg">Choose the manager you'll be working with</p>
            <div className="space-y-3 mt-4">
              {managers.length === 0 ? (
                <p className="text-muted-foreground italic">No managers available at this time.</p>
              ) : (
                managers.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => update("manager_id", m.id)}
                    className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all text-lg font-medium ${
                      form.manager_id === m.id
                        ? "border-[hsl(160,45%,25%)] bg-[hsl(160,45%,25%/0.08)] text-foreground"
                        : "border-border hover:border-muted-foreground/40 text-foreground"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-border text-sm font-bold mr-3">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {m.first_name} {m.last_name?.charAt(0)}.
                    {m.role === "admin" ? (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">(Admin)</span>
                    ) : m.is_manager ? (
                      <span className="ml-2 text-xs text-muted-foreground font-normal">(Manager)</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>
        );

      case 8:
        return (
          <div key="step-8" className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Almost there!
            </h2>
            <p className="text-muted-foreground text-lg">Please review and consent to proceed</p>
            <label className="flex items-start gap-4 cursor-pointer mt-6 p-5 rounded-xl border-2 border-border hover:border-muted-foreground/40 transition-all">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-border text-[hsl(160,45%,25%)] focus:ring-[hsl(160,45%,25%)]"
              />
              <span className="text-foreground text-base leading-relaxed">
                I consent to the collection and processing of my personal information for the purpose of onboarding and contracting with Everence Wealth. I understand I can withdraw consent at any time.
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <a href="/" className="flex items-center gap-3 no-underline">
          <img
            src="https://storage.googleapis.com/msgsndr/TLhrYb7SRrWrly615tCI/media/6993ada8dcdadb155342f28e.png"
            alt="Everence Wealth"
            className="w-8 h-8"
          />
          <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>
            Agent Application
          </span>
        </a>
        <span className="text-sm text-muted-foreground">
          {step + 1} of {TOTAL_STEPS}
        </span>
      </header>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 py-4">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step
                ? "w-8 bg-[hsl(160,45%,25%)]"
                : i < step
                ? "w-2 bg-[hsl(160,45%,25%/0.5)]"
                : "w-2 bg-border"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer nav */}
      <footer className="flex items-center justify-between px-6 py-5 border-t border-border">
        <Button
          variant="ghost"
          onClick={back}
          disabled={step === 0}
          className="text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={next}
          disabled={!canContinue() || submitting}
          className="bg-[hsl(160,45%,25%)] hover:bg-[hsl(160,45%,20%)] text-white px-8 rounded-xl"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : step === TOTAL_STEPS - 1 ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-2" />
          )}
          {submitting ? "Submitting..." : step === TOTAL_STEPS - 1 ? "Submit" : "Continue"}
        </Button>
      </footer>
    </div>
  );
}
