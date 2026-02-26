import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { TOUR_STEPS } from "./tour/TourSteps";
import { TourCard } from "./tour/TourCard";
import { TourArrow } from "./tour/TourArrow";

const BRAND_GREEN = "#1A4D3E";
const BRAND_GOLD = "#C9A84C";
const LS_KEY = "portal_tour_completed";
const PAD = 10;
const RADIUS = 16;

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

  useEffect(() => {
    if (!isAdvisor) return;
    if (!localStorage.getItem(LS_KEY)) setVisible(true);
  }, [isAdvisor]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (visible && isMobile && setMobileOpen) setMobileOpen(true);
  }, [visible, isMobile, setMobileOpen]);

  const measure = useCallback(() => {
    if (!visible) return;
    const current = TOUR_STEPS[step];
    const el = document.querySelector(`[data-tour-group="${current.group}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      rafRef.current = requestAnimationFrame(() => {
        setRect(getGroupRect(current.group));
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
    if (step === TOUR_STEPS.length - 1) return dismiss();
    setStep((s) => s + 1);
  }, [step, dismiss]);

  if (!visible || !rect) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  // Rounded inset clip-path for spotlight cutout
  const t = rect.top - PAD;
  const l = rect.left - PAD;
  const w = rect.width + PAD * 2;
  const h = rect.height + PAD * 2;
  const clipPath = `inset(0 0 0 0) subtract inset(${t}px calc(100% - ${l + w}px) calc(100% - ${t + h}px) ${l}px round ${RADIUS}px)`;
  // Fallback: use SVG mask for broader support
  const maskId = "tour-spotlight-mask";

  // Tooltip position
  const tooltipStyle: React.CSSProperties = isMobile
    ? { position: "fixed", bottom: 16, left: 12, right: 12, zIndex: 110 }
    : { position: "fixed", top: rect.top - PAD, left: rect.left + rect.width + PAD + 20, zIndex: 110, width: 320 };

  // Arrow endpoints (desktop only)
  const arrowFrom = {
    x: rect.left + rect.width + PAD,
    y: rect.top + rect.height / 2,
  };
  const arrowTo = {
    x: rect.left + rect.width + PAD + 20,
    y: rect.top + 40,
  };

  return (
    <>
      {/* SVG overlay with rounded cutout */}
      <svg className="fixed inset-0 z-[100] pointer-events-none" width="100%" height="100%">
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={l}
              y={t}
              width={w}
              height={h}
              rx={RADIUS}
              ry={RADIUS}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Click-to-dismiss overlay (transparent, over the masked area) */}
      <div
        className="fixed inset-0 z-[100]"
        onClick={dismiss}
        style={{ background: "transparent" }}
      />

      {/* Spotlight border — animated gold+green rounded rect */}
      <motion.div
        className="fixed z-[102] pointer-events-none"
        animate={{ top: t, left: l, width: w, height: h }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          borderRadius: RADIUS,
          border: `2px solid ${BRAND_GOLD}`,
          boxShadow: `0 0 24px ${BRAND_GOLD}33, 0 0 48px ${BRAND_GREEN}22, inset 0 0 12px ${BRAND_GOLD}11`,
        }}
      />

      {/* Pulse ring */}
      <motion.div
        className="fixed z-[101] pointer-events-none"
        animate={{ top: t - 4, left: l - 4, width: w + 8, height: h + 8 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        style={{
          borderRadius: RADIUS + 4,
          border: `1px solid ${BRAND_GOLD}22`,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />

      {/* SVG arrow connector (desktop only) */}
      {!isMobile && (
        <TourArrow
          fromX={arrowFrom.x}
          fromY={arrowFrom.y}
          toX={arrowTo.x}
          toY={arrowTo.y}
          step={step}
        />
      )}

      {/* Tooltip card */}
      <TourCard
        step={step}
        total={TOUR_STEPS.length}
        current={current}
        isLast={isLast}
        style={tooltipStyle}
        onNext={next}
        onSkip={dismiss}
      />
    </>
  );
}
