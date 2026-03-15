import { useState, useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Monitor } from "lucide-react";
import { RevealProvider, useRevealQueue } from "./RevealContext";
import HUD from "./HUD";
import { sound } from "./sounds/SoundEngine";

// Lazy load all 26 slides
const slides = [
  lazy(() => import("./slides/Slide01_Hero")),
  lazy(() => import("./slides/Slide02_WhatDoesRetirementNeed")),
  lazy(() => import("./slides/Slide03_WaysToInvest")),
  lazy(() => import("./slides/Slide04_OurMission")),
  lazy(() => import("./slides/Slide05_CarrierLogos")),
  lazy(() => import("./slides/Slide06_WarrenBuffett")),
  lazy(() => import("./slides/Slide07_CompoundInterest")),
  lazy(() => import("./slides/Slide08_DarrenHardy")),
  lazy(() => import("./slides/Slide09_RetirementGap")),
  lazy(() => import("./slides/Slide10_SixtyMinutes")),
  lazy(() => import("./slides/Slide11_HiddenFees")),
  lazy(() => import("./slides/Slide12_LossImpact")),
  
  lazy(() => import("./slides/Slide14_IndexingSolution")),
  lazy(() => import("./slides/Slide15_SideBySide")),
  lazy(() => import("./slides/Slide16_PerformanceChart")),
  lazy(() => import("./slides/Slide17_TaxBucketsIntro")),
  lazy(() => import("./slides/Slide18_ThreeBuckets")),
  lazy(() => import("./slides/Slide19_TaxDeepDive")),
  lazy(() => import("./slides/Slide20_TaxComparison")),
  lazy(() => import("./slides/Slide21_BridgingTheGap")),
  lazy(() => import("./slides/Slide22_PlanAdvantage")),
  lazy(() => import("./slides/Slide23_PlanBenefits")),
  lazy(() => import("./slides/Slide24_GreatRetirementTransfer")),
  lazy(() => import("./slides/Slide25_TheOpportunity")),
  lazy(() => import("./slides/Slide26_Legacy")),
];

const SLIDE_TITLES = [
  "Hero",
  "Retirement Account Needs",
  "Ways to Invest",
  "Our Mission",
  "Carrier Partners",
  "Warren Buffett's Rules",
  "Compound Interest",
  "Darren Hardy",
  "The Retirement Gap",
  "60 Minutes",
  "Hidden Fees",
  "Loss Impact",
  
  "Indexing Solution",
  "Side by Side",
  "Performance Chart",
  "Tax Buckets Intro",
  "Three Tax Buckets",
  "Tax Deep Dive",
  "Tax Comparison",
  "Bridging the Gap",
  "Plan Advantage",
  "Plan Benefits",
  "Great Retirement Transfer",
  "The Opportunity",
  "Legacy",
];

// Number of reveals per slide (how many Space presses to fully reveal)
const SLIDE_CONFIGS = [
  { totalReveals: 4 },  // 1: Hero — logo, divider, headlines, badge
  { totalReveals: 5 },  // 2: What Does Retirement Need
  { totalReveals: 4 },  // 3: Ways to Invest
  { totalReveals: 5 },  // 4: Our Mission
  { totalReveals: 3 },  // 5: Carrier Logos
  { totalReveals: 4 },  // 6: Warren Buffett
  { totalReveals: 5 },  // 7: Compound Interest
  { totalReveals: 3 },  // 8: Darren Hardy
  { totalReveals: 5 },  // 9: Retirement Gap
  { totalReveals: 4 },  // 10: 60 Minutes
  { totalReveals: 5 },  // 11: Hidden Fees
  { totalReveals: 5 },  // 12: Loss Impact
  
  { totalReveals: 5 },  // 14: Indexing Solution
  { totalReveals: 4 },  // 15: Side by Side
  { totalReveals: 4 },  // 16: Performance Chart
  { totalReveals: 4 },  // 17: Tax Buckets Intro
  { totalReveals: 6 },  // 18: Three Buckets
  { totalReveals: 5 },  // 19: Tax Deep Dive
  { totalReveals: 4 },  // 20: Tax Comparison
  { totalReveals: 5 },  // 21: Bridging the Gap
  { totalReveals: 5 },  // 22: Plan Advantage
  { totalReveals: 5 },  // 23: Plan Benefits
  { totalReveals: 4 },  // 24: Great Retirement Transfer
  { totalReveals: 4 },  // 25: The Opportunity
  { totalReveals: 5 },  // 26: Legacy
];

// Inner component that uses the context
function PresentationShell({ onExit }: { onExit?: () => void }) {
  const { currentSlide, advance, back, goToSlide, soundEnabled, totalSlides } = useRevealQueue();
  const [showGrid, setShowGrid] = useState(false);

  // Unlock AudioContext on first interaction
  useEffect(() => {
    const unlock = () => {
      sound.init();
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });
    return () => {
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showGrid) return; // Don't navigate while grid is open
      if (e.key === " " || e.key === "Enter" || e.key === "ArrowRight") {
        e.preventDefault();
        advance();
        if (soundEnabled) sound.slideTransition();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "Escape") {
        if (showGrid) {
          setShowGrid(false);
        } else {
          onExit?.();
        }
      } else if (e.key === "g") {
        setShowGrid((s) => !s);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [advance, back, onExit, soundEnabled, showGrid]);

  // Sync sound engine enabled state
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  const CurrentSlide = slides[currentSlide];
  const progress = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <>
      {/* Desktop-only gate */}
      <div className="antigravity-desktop-gate">
        <Monitor className="w-12 h-12 text-[#C8A96E] mb-4" />
        <h2
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Desktop Required
        </h2>
        <p className="text-white/60 text-sm max-w-xs" style={{ fontFamily: "var(--font-body)" }}>
          This presentation is optimized for desktop displays (1200px+).
          Please use a laptop or desktop computer.
        </p>
      </div>

      <div className="antigravity-shell">
        {/* Progress bar */}
        <div className="antigravity-progress">
          <div className="antigravity-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Slide area */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#C8A96E] border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              >
                <CurrentSlide />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* HUD */}
        <HUD onGridToggle={() => setShowGrid((s) => !s)} onExit={onExit} />

        {/* Grid overlay */}
        <AnimatePresence>
          {showGrid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="antigravity-grid-overlay"
              onClick={() => setShowGrid(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="antigravity-grid-panel"
                onClick={(e) => e.stopPropagation()}
              >
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
                >
                  All Slides
                </h3>
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                  {SLIDE_TITLES.map((title, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        goToSlide(i);
                        setShowGrid(false);
                      }}
                      className={`text-left p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                        i === currentSlide
                          ? "border-[#C8A96E] bg-[#F5E6C8]/30"
                          : "border-gray-200 hover:border-[#C8A96E]/50"
                      }`}
                    >
                      <div
                        className="text-xs font-bold text-gray-400 mb-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      <div
                        className="text-xs font-medium text-[#1A4D3E] line-clamp-2"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {title}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Outer wrapper that provides the RevealProvider
export default function PresentationViewer({ onExit }: { onExit?: () => void }) {
  return (
    <RevealProvider slideConfigs={SLIDE_CONFIGS} onExit={onExit}>
      <PresentationShell onExit={onExit} />
    </RevealProvider>
  );
}
