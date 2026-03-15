import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";
import taxIconOrdinary from "@/assets/tax-icon-ordinary.png";
import taxIconCapital from "@/assets/tax-icon-capital.png";
import taxIconTaxFree from "@/assets/tax-icon-taxfree.png";

function useTilt(strength = 10) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -strength;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px) scale(1.02)`;
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
  image: string;
  accentGradient: string;
  glowColor: string;
  borderColor: string;
  pillTextColor: string;
}

const categories: CategoryData[] = [
  {
    label: "Ordinary Income",
    tagline: "Taxed at the highest marginal rate",
    items: ["401(k)", "403(b)", "457 Plan", "Pension"],
    image: taxIconOrdinary,
    accentGradient: "linear-gradient(135deg, #C8A96E 0%, #E2C896 100%)",
    glowColor: "rgba(200,169,110,0.2)",
    borderColor: "rgba(200,169,110,0.15)",
    pillTextColor: "#1a1a1a",
  },
  {
    label: "Capital Gains",
    tagline: "Taxed when you sell investments",
    items: ["Brokerage", "Bonds", "Stocks", "ETFs", "Crypto"],
    image: taxIconCapital,
    accentGradient: "linear-gradient(135deg, #E8D44D 0%, #F0E68C 100%)",
    glowColor: "rgba(232,212,77,0.18)",
    borderColor: "rgba(232,212,77,0.15)",
    pillTextColor: "#1a1a1a",
  },
  {
    label: "Tax Free",
    tagline: "0% State & Federal income tax",
    items: ["Roth IRA", "SERP"],
    image: taxIconTaxFree,
    accentGradient: "linear-gradient(135deg, #1A4D3E 0%, #2A6B55 100%)",
    glowColor: "rgba(26,77,62,0.18)",
    borderColor: "rgba(26,77,62,0.12)",
    pillTextColor: "#ffffff",
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
          inset: -16,
          borderRadius: 40,
          background: `radial-gradient(circle at 50% 60%, ${cat.glowColor}, transparent 70%)`,
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          position: "relative",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${cat.borderColor}`,
          borderRadius: 24,
          padding: "36px 28px 32px",
          transition: "transform 0.15s ease-out, box-shadow 0.25s ease",
          willChange: "transform",
          boxShadow: "0 12px 40px -12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          textAlign: "center" as const,
          minHeight: 360,
          cursor: "default",
          overflow: "hidden",
        }}
      >
        {/* Light sweep */}
        <motion.div
          initial={{ x: "-120%" }}
          animate={revealed ? { x: "120%" } : { x: "-120%" }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
            pointerEvents: "none",
          }}
        />

        {/* 3D Icon with float animation */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={revealed ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -10 }}
          transition={{ type: "spring", stiffness: 350, damping: 18, delay: 0.1 }}
          className="slide18-float"
          style={{
            width: 100,
            height: 100,
            marginBottom: 20,
            animationDelay: `${index * 0.4}s`,
          }}
        >
          <img
            src={cat.image}
            alt={`${cat.label} icon`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.15))",
            }}
          />
        </motion.div>

        {/* Label pill */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={revealed ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            background: cat.accentGradient,
            borderRadius: 9999,
            padding: "8px 24px",
            marginBottom: 14,
            boxShadow: `0 6px 20px -6px ${cat.glowColor}`,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2.5,
              color: cat.pillTextColor,
              fontFamily: "var(--font-display)",
              textTransform: "uppercase" as const,
            }}
          >
            {cat.label}
          </span>
        </motion.div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 14,
            color: "#6B7280",
            marginBottom: 24,
            lineHeight: 1.5,
            maxWidth: 220,
          }}
        >
          {cat.tagline}
        </p>

        {/* Item badges */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, justifyContent: "center" }}>
          {cat.items.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={revealed ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.35, delay: 0.35 + i * 0.07 }}
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: "6px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.06)",
                color: "#3a3a3a",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                boxShadow: "0 2px 8px -2px rgba(0,0,0,0.04)",
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
          50% { box-shadow: 0 0 0 14px rgba(200,169,110,0); }
        }
        @keyframes slide18Float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .slide18-float {
          animation: slide18Float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-5 w-full" style={{ maxWidth: 700 }}>
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

        {/* Withdrawal scenario pill */}
        <RevealElement index={1} direction="scale" className="mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,230,200,0.15))",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(200,169,110,0.18)",
              borderRadius: 9999,
              padding: "14px 36px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 6px 24px -8px rgba(200,169,110,0.25)",
              animation: "slide18Pulse 2.5s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 14, color: "#6B7280", fontWeight: 500 }}>
              Withdrawal Scenario
            </span>
            <span
              style={{
                fontSize: 30,
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

        {/* Category cards — independent reveals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {categories.map((cat, i) => (
            <RevealElement key={cat.label} index={i + 2} direction="cardRise">
              <CategoryCard cat={cat} revealed={isRevealed(i + 2)} index={i} />
            </RevealElement>
          ))}
        </div>

        {/* Bottom CTA pill */}
        <RevealElement index={5} direction="whomp" className="flex justify-center mt-10">
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(245,230,200,0.1))",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(200,169,110,0.12)",
              borderRadius: 9999,
              padding: "14px 40px",
              boxShadow: "0 6px 20px -6px rgba(200,169,110,0.2)",
            }}
          >
            <p style={{ fontSize: 15, color: "#4a4a4a", fontWeight: 500 }}>
              Let's see exactly how each bucket impacts your{" "}
              <strong style={{ color: "#C8A96E", fontFamily: "'Geist Mono', monospace", fontWeight: 800 }}>
                $100,000
              </strong>{" "}
              withdrawal →
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
