import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { TourStep } from "./TourSteps";

const BRAND_GREEN = "#1A4D3E";
const BRAND_GOLD = "#C9A84C";

interface TourCardProps {
  step: number;
  total: number;
  current: TourStep;
  isLast: boolean;
  style: React.CSSProperties;
  onNext: () => void;
  onSkip: () => void;
}

export function TourCard({ step, total, current, isLast, style, onNext, onSkip }: TourCardProps) {
  const stepNum = String(step + 1).padStart(2, "0");
  const totalNum = String(total).padStart(2, "0");
  const progress = ((step + 1) / total) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -20, scale: 0.96 }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        style={style}
        className="rounded-2xl overflow-hidden shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)]"
      >
        {/* Glassmorphism background */}
        <div
          className="relative"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          {/* Gold accent bar */}
          <div
            className="h-[2px] w-full"
            style={{ background: `linear-gradient(90deg, ${BRAND_GOLD}, ${BRAND_GREEN}, ${BRAND_GOLD})` }}
          />

          <div className="px-5 pt-4 pb-3">
            {/* Step counter + group */}
            <div className="flex items-baseline gap-2 mb-2">
              <span
                className="text-2xl font-black tracking-tight leading-none"
                style={{ color: BRAND_GOLD }}
              >
                {stepNum}
              </span>
              <span className="text-xs text-gray-300 font-medium">/</span>
              <span className="text-sm font-medium text-gray-300 leading-none">{totalNum}</span>
              <span
                className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full text-white"
                style={{ background: BRAND_GREEN }}
              >
                <Sparkles className="h-2.5 w-2.5" />
                {current.group}
              </span>
            </div>

            {/* Title */}
            <h3
              className="text-[17px] font-bold font-serif leading-tight mb-1"
              style={{ color: BRAND_GREEN }}
            >
              {current.title}
            </h3>

            {/* Description */}
            <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
              {current.description}
            </p>

            {/* Icon strip */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {current.icons.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(26,77,62,0.06)" }}
                >
                  <Icon className="h-3 w-3" style={{ color: BRAND_GREEN }} />
                  <span className="text-[10px] font-medium text-gray-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-5 pb-4">
            {/* Progress line */}
            <div className="h-[2px] w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${BRAND_GOLD}, ${BRAND_GREEN})` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={onSkip}
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors font-medium"
              >
                Skip tour
              </button>
              <button
                onClick={onNext}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
                style={{
                  background: isLast
                    ? `linear-gradient(135deg, ${BRAND_GOLD}, ${BRAND_GREEN})`
                    : BRAND_GREEN,
                }}
              >
                {isLast ? "Get Started" : "Next"}
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
