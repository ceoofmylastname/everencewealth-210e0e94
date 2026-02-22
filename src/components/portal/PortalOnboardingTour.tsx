import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileText, ClipboardList, MessageSquare,
  Building2, Newspaper, TrendingUp,
  Wrench, GraduationCap, Megaphone, Calendar,
  Briefcase, GitBranch, FolderOpen, Settings,
  Shield, Send, ArrowRight, Sparkles,
} from "lucide-react";

const BRAND_GREEN = "#1A4D3E";
const BRAND_GOLD = "#C9A84C";
const LS_KEY = "portal_tour_completed";
const PADDING = 6;

interface TourStep {
  group: string;
  title: string;
  description: string;
  icons: { icon: React.ElementType; label: string }[];
}

const steps: TourStep[] = [
  {
    group: "Portal",
    title: "Your Command Center",
    description:
      "Dashboard gives you a full snapshot. Clients lets you invite and manage clients. Policies tracks coverage. CNA helps understand needs. Messages keeps conversations going.",
    icons: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users, label: "Clients" },
      { icon: FileText, label: "Policies" },
      { icon: ClipboardList, label: "CNA" },
      { icon: MessageSquare, label: "Messages" },
    ],
  },
  {
    group: "Market",
    title: "Market Intelligence",
    description:
      "Stay ahead of the industry. Browse Carriers, read the latest News, and track your Performance — all in one place.",
    icons: [
      { icon: Building2, label: "Carriers" },
      { icon: Newspaper, label: "News" },
      { icon: TrendingUp, label: "Performance" },
    ],
  },
  {
    group: "Resources",
    title: "Resources & Growth",
    description:
      "Access quoting Tools, complete Training courses, grab Marketing materials, and manage your Schedule.",
    icons: [
      { icon: Wrench, label: "Tools" },
      { icon: GraduationCap, label: "Training" },
      { icon: Megaphone, label: "Marketing" },
      { icon: Calendar, label: "Schedule" },
    ],
  },
  {
    group: "Contracting",
    title: "Agent Contracting",
    description:
      "Onboard new agents seamlessly. Track the full pipeline, manage documents, and monitor analytics.",
    icons: [
      { icon: Briefcase, label: "Dashboard" },
      { icon: GitBranch, label: "Pipeline" },
      { icon: Users, label: "Agents" },
      { icon: FolderOpen, label: "Files" },
      { icon: TrendingUp, label: "Analytics" },
      { icon: Settings, label: "Settings" },
    ],
  },
  {
    group: "Compliance",
    title: "Compliance & Settings",
    description:
      "Monitor licensing, manage documents, invite clients, and configure your settings.",
    icons: [
      { icon: Shield, label: "Compliance" },
      { icon: FolderOpen, label: "Documents" },
      { icon: Send, label: "Invite Client" },
      { icon: Settings, label: "Settings" },
    ],
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getGroupRect(group: string): Rect | null {
  const el = document.querySelector(`[data-tour-group="${group}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function buildClipPath(rect: Rect | null): string {
  if (!rect) return "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
  const t = rect.top - PADDING;
  const l = rect.left - PADDING;
  const r = rect.left + rect.width + PADDING;
  const b = rect.top + rect.height + PADDING;
  // outer rectangle with a rectangular hole
  return `polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
    ${l}px ${t}px, ${l}px ${b}px, ${r}px ${b}px, ${r}px ${t}px, ${l}px ${t}px
  )`;
}

interface Props {
  isAdvisor: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export function PortalOnboardingTour({ isAdvisor, setMobileOpen }: Props) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef(0);

  // Check visibility
  useEffect(() => {
    if (!isAdvisor) return;
    const done = localStorage.getItem(LS_KEY);
    if (!done) setVisible(true);
  }, [isAdvisor]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Open sidebar on mobile when tour starts
  useEffect(() => {
    if (visible && isMobile && setMobileOpen) {
      setMobileOpen(true);
    }
  }, [visible, isMobile, setMobileOpen]);

  // Measure target element position
  const measure = useCallback(() => {
    if (!visible) return;
    const current = steps[step];
    const el = document.querySelector(`[data-tour-group="${current.group}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      // small delay to let scroll settle
      rafRef.current = requestAnimationFrame(() => {
        const newRect = getGroupRect(current.group);
        setRect(newRect);
      });
    }
  }, [step, visible]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      cancelAnimationFrame(rafRef.current);
    };
  }, [measure]);

  const dismiss = useCallback(() => {
    setVisible(false);
    localStorage.setItem(LS_KEY, "true");
    if (isMobile && setMobileOpen) setMobileOpen(false);
  }, [isMobile, setMobileOpen]);

  const next = useCallback(() => {
    if (step === steps.length - 1) return dismiss();
    setStep((s) => s + 1);
  }, [step, dismiss]);

  if (!visible || !rect) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  // Tooltip position: right of spotlight on desktop, below on mobile
  const tooltipStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: rect.top + rect.height + PADDING + 12,
        left: 12,
        right: 12,
        zIndex: 110,
      }
    : {
        position: "fixed",
        top: rect.top - PADDING,
        left: rect.left + rect.width + PADDING + 16,
        zIndex: 110,
        width: 340,
      };

  return (
    <>
      {/* Overlay with cutout */}
      <motion.div
        className="fixed inset-0 z-[100]"
        style={{
          background: "rgba(0,0,0,0.55)",
          clipPath: buildClipPath(rect),
          transition: "clip-path 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={dismiss}
      />

      {/* Spotlight glow border */}
      <motion.div
        className="fixed z-[101] pointer-events-none rounded-lg"
        animate={{
          top: rect.top - PADDING,
          left: rect.left - PADDING,
          width: rect.width + PADDING * 2,
          height: rect.height + PADDING * 2,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          border: `2px solid ${BRAND_GREEN}`,
          boxShadow: `0 0 20px ${BRAND_GREEN}44, 0 0 40px ${BRAND_GREEN}22`,
        }}
      />

      {/* Pulse ring */}
      <motion.div
        className="fixed z-[101] pointer-events-none rounded-lg"
        animate={{
          top: rect.top - PADDING - 4,
          left: rect.left - PADDING - 4,
          width: rect.width + PADDING * 2 + 8,
          height: rect.height + PADDING * 2 + 8,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          border: `1px solid ${BRAND_GREEN}33`,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          style={tooltipStyle}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="p-5">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white"
                style={{ background: BRAND_GREEN }}
              >
                <Sparkles className="h-3 w-3" />
                {current.group}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {step + 1} / {steps.length}
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-lg font-bold font-serif mb-1.5"
              style={{ color: BRAND_GREEN }}
            >
              {current.title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              {current.description}
            </p>

            {/* Icon row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {current.icons.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 border border-gray-100"
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: BRAND_GREEN }} />
                  <span className="text-[11px] font-medium text-gray-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === step ? 20 : 6,
                    height: 6,
                    background: i === step ? BRAND_GREEN : "#E5E7EB",
                  }}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={dismiss}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
              >
                Skip Tour
              </button>
              <button
                onClick={next}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
                style={{
                  background: isLast
                    ? `linear-gradient(135deg, ${BRAND_GREEN}, ${BRAND_GOLD})`
                    : BRAND_GREEN,
                }}
              >
                {isLast ? "Get Started" : "Next"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
