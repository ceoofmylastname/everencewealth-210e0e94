import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, ClipboardList, MessageSquare,
  Building2, Newspaper, TrendingUp,
  Wrench, GraduationCap, Megaphone, Calendar,
  Briefcase, GitBranch, FolderOpen, Settings,
  Shield, Send, X, ArrowRight, Sparkles,
} from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const BRAND_GOLD = "#C9A84C";
const LS_KEY = "portal_tour_completed";

interface TourStep {
  title: string;
  subtitle: string;
  description: string;
  icons: { icon: React.ElementType; label: string }[];
  gradient: string;
}

const steps: TourStep[] = [
  {
    title: "Welcome to Your Portal",
    subtitle: "Portal",
    description:
      "Your command center. The Dashboard gives you a full snapshot of your business. Clients lets you invite and manage clients. Policies tracks all active coverage. CNA helps you understand each client's needs. Messages keeps the conversation going.",
    icons: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users, label: "Clients" },
      { icon: FileText, label: "Policies" },
      { icon: ClipboardList, label: "CNA" },
      { icon: MessageSquare, label: "Messages" },
    ],
    gradient: "from-emerald-500/10 to-teal-500/10",
  },
  {
    title: "Market Intelligence",
    subtitle: "Market",
    description:
      "Stay ahead of the industry. Browse Carriers, read the latest News, and track your Performance — all in one place.",
    icons: [
      { icon: Building2, label: "Carriers" },
      { icon: Newspaper, label: "News" },
      { icon: TrendingUp, label: "Performance" },
    ],
    gradient: "from-blue-500/10 to-indigo-500/10",
  },
  {
    title: "Resources & Growth",
    subtitle: "Resources",
    description:
      "Everything you need to grow. Access quoting Tools, complete Training courses, grab Marketing materials, and manage your Schedule.",
    icons: [
      { icon: Wrench, label: "Tools" },
      { icon: GraduationCap, label: "Training" },
      { icon: Megaphone, label: "Marketing" },
      { icon: Calendar, label: "Schedule" },
    ],
    gradient: "from-amber-500/10 to-orange-500/10",
  },
  {
    title: "Agent Contracting",
    subtitle: "Contracting",
    description:
      "Onboard new agents seamlessly. Track the full pipeline from application to completion, manage documents, and monitor analytics.",
    icons: [
      { icon: Briefcase, label: "Dashboard" },
      { icon: GitBranch, label: "Pipeline" },
      { icon: Users, label: "Agents" },
      { icon: FolderOpen, label: "Files" },
      { icon: TrendingUp, label: "Analytics" },
      { icon: Settings, label: "Settings" },
    ],
    gradient: "from-violet-500/10 to-purple-500/10",
  },
  {
    title: "Compliance & Settings",
    subtitle: "Compliance",
    description:
      "Stay compliant and organized. Monitor licensing, manage documents, invite clients, and configure your settings.",
    icons: [
      { icon: Shield, label: "Compliance" },
      { icon: FolderOpen, label: "Documents" },
      { icon: Send, label: "Invite Client" },
      { icon: Settings, label: "Settings" },
    ],
    gradient: "from-rose-500/10 to-pink-500/10",
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export function PortalOnboardingTour({ isAdvisor }: { isAdvisor: boolean }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (!isAdvisor) return;
    const done = localStorage.getItem(LS_KEY);
    if (!done) setVisible(true);
  }, [isAdvisor]);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(LS_KEY, "true");
  }, []);

  const next = useCallback(() => {
    if (step === steps.length - 1) return dismiss();
    setDir(1);
    setStep((s) => s + 1);
  }, [step, dismiss]);

  const goTo = useCallback(
    (i: number) => {
      setDir(i > step ? 1 : -1);
      setStep(i);
    },
    [step]
  );

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Close tour"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        {/* Animated content area */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-6 sm:p-8"
            >
              {/* Step badge */}
              <div className="flex items-center gap-2 mb-5">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white"
                  style={{ background: BRAND_GREEN }}
                >
                  <Sparkles className="h-3 w-3" />
                  {current.subtitle}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {step + 1} / {steps.length}
                </span>
              </div>

              {/* Title */}
              <h2
                className="text-2xl sm:text-3xl font-bold mb-3 font-serif leading-tight"
                style={{ color: BRAND_GREEN }}
              >
                {current.title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                {current.description}
              </p>

              {/* Icon grid */}
              <div
                className={`grid gap-3 ${
                  current.icons.length <= 3
                    ? "grid-cols-3"
                    : current.icons.length <= 4
                    ? "grid-cols-2 sm:grid-cols-4"
                    : "grid-cols-3 sm:grid-cols-3"
                }`}
              >
                {current.icons.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl bg-gradient-to-br ${current.gradient} border border-gray-100`}
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ background: BRAND_GREEN }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 flex flex-col gap-4">
          {/* Dots */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to step ${i + 1}`}
                className="transition-all duration-300"
                style={{
                  width: i === step ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? BRAND_GREEN : "#E5E7EB",
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={dismiss}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium min-h-[44px] px-2"
            >
              Skip Tour
            </button>
            <button
              onClick={next}
              className="flex items-center gap-2 px-6 min-h-[44px] rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.97]"
              style={{
                background: isLast
                  ? `linear-gradient(135deg, ${BRAND_GREEN}, ${BRAND_GOLD})`
                  : BRAND_GREEN,
              }}
            >
              {isLast ? "Get Started" : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
