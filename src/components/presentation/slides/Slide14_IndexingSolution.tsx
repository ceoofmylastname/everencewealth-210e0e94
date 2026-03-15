import { useState, useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import CountingNumber from "../animations/CountingNumber";
import happyFamilyImg from "@/assets/happy-family-dream-home.jpg";
import ConfettiTrigger from "../animations/ConfettiTrigger";
import { useRevealQueue } from "../RevealContext";

const steps = [
  { label: "Start:", numValue: 100000, display: "$100,000", glassBg: "rgba(232,240,236,0.35)", textColor: "#1A4D3E", prefix: "$" },
  { label: "Market Loss:", display: "-0%", glassBg: "rgba(255,255,255,0.45)", textColor: "#1A4D3E", badge: true, isPercent: true },
  { label: "Protected:", numValue: 100000, display: "$100,000", glassBg: "rgba(232,240,236,0.35)", textColor: "#1A4D3E", prefix: "$" },
  { label: "Cap:", display: "+25%", glassBg: "rgba(245,230,200,0.35)", textColor: "#C8A96E", isPercent: true },
  { label: "Result:", numValue: 125000, display: "$125,000", glassBg: "rgba(245,230,200,0.35)", textColor: "#1A4D3E", prefix: "$" },
];

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -6;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-2px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  }, []);
  return { ref, onMove, onLeave };
}

export default function Slide14_IndexingSolution() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { isRevealed, soundEnabled } = useRevealQueue();
  const stepsRevealed = isRevealed(2);

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide14RowIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide14BorderRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .slide14-step {
          opacity: 0;
        }
        .slide14-step.revealed {
          animation: slide14RowIn 0.5s ease-out forwards;
        }
        .slide14-hero-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          padding: 2px;
        }
        .slide14-hero-wrap::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            rgba(200,169,110,0.5) 0%,
            transparent 14%,
            transparent 50%,
            rgba(26,77,62,0.4) 64%,
            transparent 100%
          );
          animation: slide14BorderRotate 7s linear infinite;
          z-index: 0;
        }
        .slide14-hero-inner {
          position: relative;
          z-index: 1;
          border-radius: 22px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 28px 24px;
        }
      `}</style>

      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />

      <div className="antigravity-editorial">
        {/* Left — Number sequence */}
        <div>
          <RevealElement index={1} direction="slam" className="mb-6">
            <h2
              className="text-4xl font-bold"
              style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}
            >
              Indexed Strategy
            </h2>
          </RevealElement>

          <RevealElement index={2} direction="cardRise">
            <StepsCard steps={steps} revealed={stepsRevealed} />
          </RevealElement>

          <RevealElement index={3} direction="explode" className="mt-5">
            <div
              style={{
                display: "inline-block",
                borderRadius: 9999,
                background: "linear-gradient(135deg, #C8A96E 0%, #E8D5A8 50%, #C8A96E 100%)",
                backgroundSize: "200% 100%",
                padding: "12px 28px",
                fontSize: 18,
                fontWeight: 700,
                color: "#1a1a1a",
                boxShadow: "0 6px 20px rgba(200,169,110,0.25)",
              }}
            >
              Zero is Your Hero ✦
            </div>
          </RevealElement>

          <RevealElement index={4} direction="drop" className="mt-4" onRevealed={() => setShowConfetti(true)}>
            <div
              className="antigravity-pill"
              style={{
                display: "inline-block",
                borderRadius: 9999,
                background: "linear-gradient(135deg, #1A4D3E 0%, #2E6B54 100%)",
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 6px 20px rgba(26,77,62,0.2)",
              }}
            >
              Protection + Growth = Indexed Strategy
            </div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={5} direction="right" className="flex items-center justify-center">
          <BlobClip
            gradient="linear-gradient(135deg, #6BA08A 0%, #4A8A70 100%)"
            imageSrc={happyFamilyImg}
            imageAlt="Happy family walking into their dream home"
            height="420px"
            width="420px"
            variant={3}
            imageStyle={{ objectPosition: "center center" }}
          />
        </RevealElement>
      </div>
    </div>
  );
}

function StepsCard({ steps: stepItems, revealed }: { steps: { label: string; display: string; numValue?: number; glassBg: string; textColor: string; prefix?: string; badge?: boolean; isPercent?: boolean }[]; revealed: boolean }) {
  const { ref, onMove, onLeave } = useTilt();

  return (
    <div className="slide14-hero-wrap">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="slide14-hero-inner"
        style={{ transition: "transform 0.15s ease-out", willChange: "transform" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stepItems.map((step, i) => (
            <div
              key={i}
              className={`slide14-step ${revealed ? "revealed" : ""}`}
              style={{
                animationDelay: revealed ? `${i * 0.12}s` : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                borderRadius: 16,
                background: step.glassBg,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: step.badge ? "2px solid #1A4D3E" : "1px solid rgba(255,255,255,0.5)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6)",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: "#5a5a5a" }}>{step.label}</span>
              <span
                className="antigravity-stat"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: step.textColor,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {step.numValue && revealed ? (
                  <CountingNumber value={step.numValue} prefix={step.prefix || ""} duration={1 + i * 0.15} />
                ) : (
                  step.display
                )}
              </span>
              {step.badge && (
                <span
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -10,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    background: "linear-gradient(135deg, #C8A96E, #E8D5A8)",
                    color: "#1a1a1a",
                    boxShadow: "0 2px 8px rgba(200,169,110,0.3)",
                  }}
                >
                  Zero is Your Hero
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
