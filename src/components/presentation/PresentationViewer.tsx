import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid3X3, Play, Pause, Volume2, VolumeX, X } from "lucide-react";
import { slideVariants, slideTransition } from "./animations/variants";
import { playSlideTransition } from "./sounds/sounds";

const TOTAL_SLIDES = 27;
const AUTOPLAY_INTERVAL = 8000;

// Lazy load all 27 slides
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
  lazy(() => import("./slides/Slide13_NegativeCredit")),
  lazy(() => import("./slides/Slide14_IndexingSolution")),
  lazy(() => import("./slides/Slide15_SideBySide")),
  lazy(() => import("./slides/Slide16_PerformanceChart")),
  lazy(() => import("./slides/Slide17_TaxBucketsIntro")),
  lazy(() => import("./slides/Slide18_ThreeBuckets")),
  lazy(() => import("./slides/Slide19_CapitalGains")),
  lazy(() => import("./slides/Slide20_OrdinaryIncome")),
  lazy(() => import("./slides/Slide21_TaxFree")),
  lazy(() => import("./slides/Slide22_TaxComparison")),
  lazy(() => import("./slides/Slide23_BridgingTheGap")),
  lazy(() => import("./slides/Slide24_PlanAdvantage")),
  lazy(() => import("./slides/Slide25_PlanBenefits")),
  lazy(() => import("./slides/Slide26_BigQuestion")),
  lazy(() => import("./slides/Slide27_Legacy")),
];

const SLIDE_TITLES = [
  "Hero", "Retirement Account Needs", "Ways to Invest", "Our Mission",
  "Carrier Partners", "Warren Buffett's Rules", "Compound Interest", "Darren Hardy",
  "The Retirement Gap", "60 Minutes", "Hidden Fees", "Loss Impact",
  "Negative Credit", "Indexing Solution", "Side by Side", "Performance Chart",
  "Tax Buckets Intro", "Three Tax Buckets", "Capital Gains", "Ordinary Income",
  "Tax Free", "Tax Comparison", "Bridging the Gap", "Plan Advantage",
  "Plan Benefits", "The Big Question", "Legacy",
];

export default function PresentationViewer({ onExit }: { onExit?: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (index < 0 || index >= TOTAL_SLIDES || index === currentSlide) return;
      setDirection(index > currentSlide ? 1 : -1);
      setCurrentSlide(index);
      if (soundEnabled) playSlideTransition();
    },
    [currentSlide, soundEnabled]
  );

  const next = useCallback(() => {
    if (currentSlide < TOTAL_SLIDES - 1) goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prev = useCallback(() => {
    if (currentSlide > 0) goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "Escape") {
        onExit?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, onExit]);

  // Autoplay
  useEffect(() => {
    if (!autoplay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (prev >= TOTAL_SLIDES - 1) {
          setAutoplay(false);
          return prev;
        }
        setDirection(1);
        if (soundEnabled) playSlideTransition();
        return prev + 1;
      });
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [autoplay, soundEnabled]);

  const CurrentSlideComponent = slides[currentSlide];
  const progress = ((currentSlide + 1) / TOTAL_SLIDES) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="h-[2px] bg-gray-100 w-full relative flex-shrink-0">
        <motion.div
          className="h-full"
          style={{ background: "#C8A96E" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Top controls */}
      <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          title="Grid view"
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
        <button
          onClick={() => setAutoplay(!autoplay)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          title={autoplay ? "Pause" : "Autoplay"}
        >
          {autoplay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          title={soundEnabled ? "Mute" : "Unmute"}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>
        {onExit && (
          <button
            onClick={onExit}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            title="Exit"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="absolute inset-0"
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-[#C8A96E] border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <CurrentSlideComponent soundEnabled={soundEnabled} />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <button
          onClick={prev}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 text-[#1A4D3E]"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        <div className="text-sm font-medium text-gray-400" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
          {String(currentSlide + 1).padStart(2, "0")} / {TOTAL_SLIDES}
        </div>

        <button
          onClick={next}
          disabled={currentSlide === TOTAL_SLIDES - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 text-[#1A4D3E]"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid overlay */}
      <AnimatePresence>
        {showGrid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 flex items-center justify-center p-8"
            onClick={() => setShowGrid(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-5xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: "#1A4D3E", fontFamily: "'DM Sans', system-ui, sans-serif" }}
              >
                All Slides
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
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
                    <div className="text-xs font-bold text-gray-400 mb-1">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="text-xs font-medium text-[#1A4D3E] line-clamp-2">
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
  );
}
