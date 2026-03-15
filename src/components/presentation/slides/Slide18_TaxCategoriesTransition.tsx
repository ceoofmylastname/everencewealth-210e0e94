import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

function useTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -strength;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px) scale(1.02)`;
  }, [strength]);
  const onLeave = useCallback(() => {
    if (ref.current)
      ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0) scale(1)";
  }, []);
  return { ref, onMove, onLeave };
}

interface CategoryData {
  label: string;
  tagline: string;
  items: string[];
  icon: string;
  accentGradient: string;
  accentColor: string;
  glowColor: string;
  borderColor: string;
}

const categories: CategoryData[] = [
  {
    label: "Ordinary Income",
    tagline: "Taxed at the highest marginal rate",
    items: ["401(k)", "403(b)", "457 Plan", "Pension"],
    icon: "📊",
    accentGradient: "linear-gradient(135deg, #C8A96E 0%, #E2C896 100%)",
    accentColor: "#C8A96E",
    glowColor: "rgba(200,169,110,0.25)",
    borderColor: "rgba(200,169,110,0.25)",
  },
  {
    label: "Capital Gains",
    tagline: "Taxed when you sell investments",
    items: ["Brokerage", "Bonds", "Stocks", "ETFs", "Crypto"],
    icon: "📈",
    accentGradient: "linear-gradient(135deg, #E8D44D 0%, #F0E68C 100%)",
    accentColor: "#D4B82E",
    glowColor: "rgba(232,212,77,0.2)",
    borderColor: "rgba(232,212,77,0.25)",
  },
  {
    label: "Tax Free",
    tagline: "0% State & Federal income tax",
    items: ["Roth IRA", "SERP"],
    icon: "🛡️",
    accentGradient: "linear-gradient(135deg, #1A4D3E 0%, #2A6B55 100%)",
    accentColor: "#1A4D3E",
    glowColor: "rgba(26,77,62,0.2)",
    borderColor: "rgba(26,77,62,0.2)",
  },
];

function CategoryCard({ cat, revealed, index }: { cat: CategoryData; revealed: boolean; index: number }) {
  const { ref, onMove, onLeave } = useTilt(8);

  return (
    <div style={{ position: "relative" }}>
      {/* Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: 36,
          background: `radial-gradient(circle at 50% 60%, ${cat.glowColor}, transparent 70%)`,
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${cat.borderColor}`,
          borderRadius: 24,
          padding: "32px 28px",
          transition: "transform 0.15s ease-out, box-shadow 0.25s ease",
          willChange: "transform",
          boxShadow: `0 8px 32px -8px rgba(0,0,0,0.06), 0 1px 0 ${cat.borderColor}`,
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          textAlign: "center" as const,
          minHeight: 340,
          cursor: "default",
          overflow: "hidden",
        }}
      >
        {/* Light sweep effect */}
        <motion.div
          initial={{ x: "-120%" }}
          animate={revealed ? { x: "120%" } : { x: "-120%" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={revealed ? { scale: 1 } : { scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
          style={{
            fontSize: 48,
            marginBottom: 16,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
          }}
        >
          {cat.icon}
        </motion.div>

        {/* Accent pill */}
        <div
          style={{
            background: cat.accentGradient,
            borderRadius: 9999,
            padding: "6px 20px",
            marginBottom: 12,
            boxShadow: `0 4px 14px -4px ${cat.glowColor}`,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              color: cat.label === "Tax Free" ? "#fff" : "#1a1a1a",
              fontFamily: "var(--font-display)",
              textTransform: "uppercase" as const,
            }}
          >
            {cat.label}
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 13,
            color: "#6B7280",
            marginBottom: 20,
            lineHeight: 1.5,
            maxWidth: 200,
          }}
        >
          {cat.tagline}
        </p>

        {/* Items */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, justifyContent: "center" }}>
          {cat.items.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, y: 8 }}
              animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.08 }}
              style={{
                fontSize: 12,
                fontWeight: 500,
                padding: "5px 14px",
                borderRadius: 10,
                background: "rgba(0,0,0,0.03)",
                border: "1px solid rgba(0,0,0,0.05)",
                color: "#4a4a4a",
              }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Slide18_TaxCategoriesTransition() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide18Pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200,169,110,0.3); }
          50% { box-shadow: 0 0 0 12px rgba(200,169,110,0); }
        }
      `}</style>

      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-6 w-full" style={{ maxWidth: 700 }}>
          <h2
            className="text-4xl font-bold"
            style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}
          >
            The Three{" "}
            <GoldUnderline>
              <GradientText>Tax Categories</GradientText>
            </GoldUnderline>
          </h2>
          <p className="text-base mt-3" style={{ color: "#9CA3AF" }}>
            Where your money sits determines how much you keep
          </p>
        </RevealElement>

        {/* Amount pill */}
        <RevealElement index={1} direction="scale" className="mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(245,230,200,0.2))",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(200,169,110,0.2)",
              borderRadius: 9999,
              padding: "12px 32px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 4px 20px -6px rgba(200,169,110,0.25)",
              animation: "slide18Pulse 2.5s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 500 }}>
              Withdrawal Scenario
            </span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#C8A96E",
                fontFamily: "'Geist Mono', monospace",
                letterSpacing: -1,
              }}
            >
              {isRevealed(1) ? <CountingNumber value={100000} prefix="$" /> : "$0"}
            </span>
          </motion.div>
        </RevealElement>

        {/* Category Cards — each on independent reveal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {categories.map((cat, i) => (
            <RevealElement key={cat.label} index={i + 2} direction="cardRise">
              <CategoryCard cat={cat} revealed={isRevealed(i + 2)} index={i} />
            </RevealElement>
          ))}
        </div>

        {/* Bottom insight */}
        <RevealElement index={5} direction="whomp" className="flex justify-center mt-10">
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,230,200,0.15))",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(200,169,110,0.15)",
              borderRadius: 9999,
              padding: "14px 36px",
              boxShadow: "0 4px 16px -4px rgba(200,169,110,0.2)",
            }}
          >
            <p style={{ fontSize: 15, color: "#4a4a4a", fontWeight: 500 }}>
              Let's see exactly how each bucket impacts your{" "}
              <strong style={{ color: "#C8A96E", fontFamily: "'Geist Mono', monospace" }}>$100,000</strong>{" "}
              withdrawal →
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
