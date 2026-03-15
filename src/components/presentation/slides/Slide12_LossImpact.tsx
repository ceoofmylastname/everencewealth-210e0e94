import { useState, useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

const scenarios = [
  {
    startVal: 100000,
    lossPercent: 25,
    resultVal: 75000,
    resultLabel: "$75k",
    recovery: "+33%",
    recoveryFull: "needed to recover",
    accent: "hsla(51, 78%, 70%, 1)",
    accentBg: "hsla(51, 78%, 70%, 0.08)",
    accentBorder: "hsla(51, 78%, 70%, 0.35)",
    accentGlow: "hsla(51, 78%, 70%, 0.15)",
    pillBg: "hsla(51, 78%, 70%, 0.12)",
    pillBorder: "hsla(51, 78%, 70%, 0.25)",
    pillColor: "#1A4D3E",
  },
  {
    startVal: 100000,
    lossPercent: 33,
    resultVal: 67000,
    resultLabel: "$67k",
    recovery: "+50%",
    recoveryFull: "needed to recover",
    accent: "hsla(35, 80%, 55%, 1)",
    accentBg: "hsla(35, 80%, 55%, 0.06)",
    accentBorder: "hsla(35, 80%, 55%, 0.35)",
    accentGlow: "hsla(35, 80%, 55%, 0.12)",
    pillBg: "hsla(35, 80%, 55%, 0.12)",
    pillBorder: "hsla(35, 80%, 55%, 0.25)",
    pillColor: "#8B6914",
  },
  {
    startVal: 100000,
    lossPercent: 50,
    resultVal: 50000,
    resultLabel: "$50k",
    recovery: "+100%",
    recoveryFull: "needed to recover",
    accent: "hsla(0, 70%, 55%, 1)",
    accentBg: "hsla(0, 70%, 55%, 0.06)",
    accentBorder: "hsla(0, 70%, 55%, 0.4)",
    accentGlow: "hsla(0, 70%, 55%, 0.18)",
    pillBg: "hsla(0, 70%, 55%, 0.1)",
    pillBorder: "hsla(0, 70%, 55%, 0.25)",
    pillColor: "#D64545",
    danger: true,
  },
];

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  }, []);
  return { ref, onMove, onLeave };
}

function LossCard({
  scenario,
  revealed,
}: {
  scenario: (typeof scenarios)[0];
  revealed: boolean;
}) {
  const { ref, onMove, onLeave } = useTilt();

  return (
    <div style={{ position: "relative" }}>
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 32,
          background: `radial-gradient(circle at 50% 80%, ${scenario.accentGlow}, transparent 70%)`,
          filter: "blur(20px)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      {/* Animated border wrapper */}
      <div className="slide12-border-wrap" style={{ "--card-accent": scenario.accent } as React.CSSProperties}>
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="slide12-card-inner"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.92) 0%, ${scenario.accentBg} 100%)`,
            transition: "transform 0.15s ease-out",
            willChange: "transform",
          }}
        >
          {/* YOU INVEST label */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase" as const,
              color: scenario.pillColor,
              opacity: 0.55,
              marginBottom: 8,
            }}
          >
            You invest
          </div>

          {/* $100k */}
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#1A4D3E",
              fontFamily: "var(--font-display)",
              lineHeight: 1.1,
            }}
          >
            {revealed ? <CountingNumber value={100} prefix="$" suffix="k" duration={0.8} /> : "$0"}
          </div>

          {/* Loss arrow + percent */}
          <div style={{ margin: "12px 0 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <svg width="24" height="14" viewBox="0 0 24 14" fill="none" style={{ opacity: 0.7 }}>
              <path d="M2 2C6 6 10 10 14 8C18 6 20 10 22 12" stroke={scenario.pillColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
            <span
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#D64545",
                fontFamily: "var(--font-display)",
              }}
            >
              -{scenario.lossPercent}%
            </span>
          </div>

          {/* Result value */}
          <div
            className="antigravity-stat"
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: "#1A4D3E",
              fontFamily: "var(--font-display)",
              lineHeight: 1.1,
              marginBottom: 14,
            }}
          >
            {revealed ? (
              <CountingNumber value={scenario.resultVal / 1000} prefix="$" suffix="k" duration={1.2} />
            ) : (
              "$0"
            )}
          </div>

          {/* Recovery pill */}
          <div
            style={{
              display: "inline-flex",
              borderRadius: 9999,
              padding: "6px 18px",
              fontSize: 12,
              fontWeight: 700,
              color: scenario.pillColor,
              background: scenario.pillBg,
              border: `1px solid ${scenario.pillBorder}`,
              letterSpacing: 0.3,
            }}
          >
            {scenario.recovery} {scenario.recoveryFull}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Slide12_LossImpact() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide12BorderRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide12PillSweep {
          0%   { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .slide12-border-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          padding: 2px;
        }
        .slide12-border-wrap::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            var(--card-accent, rgba(200,169,110,0.5)) 0%,
            transparent 14%,
            transparent 50%,
            var(--card-accent, rgba(200,169,110,0.3)) 64%,
            transparent 100%
          );
          animation: slide12BorderRotate 6s linear infinite;
          z-index: 0;
        }
        .slide12-card-inner {
          position: relative;
          z-index: 1;
          border-radius: 22px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-height: 280px;
          justify-content: center;
        }
      `}</style>

      <div className="antigravity-slide-inner flex flex-col items-center justify-center gap-6 px-4">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center">
          <h2
            className="text-4xl font-bold"
            style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}
          >
            Traditional Approach to <GradientText>Investing</GradientText>
          </h2>
          <p className="text-base mt-2" style={{ color: "#7a7a7a" }}>
            How stock market losses impact returns
          </p>
        </RevealElement>

        {/* Reveals 2-4: Individual cards, each on its own trigger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          {scenarios.map((scenario, i) => (
            <RevealElement key={i} index={i + 2} direction={i === 2 ? "explode" : "cardRise"}>
              <LossCard scenario={scenario} revealed={isRevealed(i + 2)} />
            </RevealElement>
          ))}
        </div>

        {/* Reveal 5: Divider */}
        <RevealElement index={5} direction="wipe" className="flex justify-center">
          <div
            style={{
              width: 60,
              height: 2,
              borderRadius: 9999,
              background: "linear-gradient(90deg, #C8A96E, #E8D5A8)",
            }}
          />
        </RevealElement>

        {/* Reveal 6: Bottom insight */}
        <RevealElement index={6} direction="whomp" className="text-center">
          <div
            style={{
              display: "inline-block",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #1A4D3E 0%, #2E6B54 100%)",
              padding: "12px 32px",
              boxShadow: "0 8px 24px rgba(26,77,62,0.2)",
            }}
          >
            <p style={{ fontSize: 16, color: "white", fontWeight: 600 }}>
              100% gains take years. 50% losses happen in <strong>ONE year</strong>.
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
