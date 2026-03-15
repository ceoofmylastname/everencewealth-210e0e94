import { useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import BlobClip from "../BlobClip";
import { useRevealQueue } from "../RevealContext";
import coupleStressedImg from "@/assets/couple-stressed-bills.jpg";

interface LossStep {
  label: string;
  display: string;
  numValue?: number;
  prefix?: string;
  suffix?: string;
  glassBg: string;
  textColor: string;
  badge?: boolean;
  badgeText?: string;
  borderAccent?: boolean;
}

const steps: LossStep[] = [
  { label: "You invest:", numValue: 100000, display: "$100,000", glassBg: "rgba(232,240,236,0.35)", textColor: "#1A4D3E", prefix: "$" },
  { label: "Market drops:", display: "-25%", glassBg: "rgba(254,226,226,0.25)", textColor: "#D64545", borderAccent: true, badge: true, badgeText: "Year 1 Loss" },
  { label: "Remaining:", numValue: 75000, display: "$75,000", glassBg: "rgba(254,226,226,0.15)", textColor: "#D64545", prefix: "$" },
  { label: "Recovery needed:", display: "+33%", glassBg: "rgba(245,230,200,0.35)", textColor: "#8B6914" },
  { label: "Years to recover:", display: "4–7 years", glassBg: "rgba(245,230,200,0.35)", textColor: "#8B6914" },
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

function StepsCard({ revealed }: { revealed: boolean }) {
  const { ref, onMove, onLeave } = useTilt();

  return (
    <div className="slide12-border-wrap">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="slide12-card-inner"
        style={{ transition: "transform 0.15s ease-out", willChange: "transform" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              className={`slide12-step ${revealed ? "revealed" : ""}`}
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
                border: step.borderAccent ? "2px solid #D64545" : "1px solid rgba(255,255,255,0.5)",
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
              {step.badge && step.badgeText && (
                <span
                  style={{
                    position: "absolute",
                    right: -6,
                    top: -10,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 9999,
                    background: "linear-gradient(135deg, #D64545, #E87070)",
                    color: "white",
                    boxShadow: "0 2px 8px rgba(214,69,69,0.3)",
                  }}
                >
                  {step.badgeText}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Slide12_LossImpact() {
  const { isRevealed } = useRevealQueue();
  const stepsRevealed = isRevealed(2);

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide12RowIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide12BorderRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .slide12-step {
          opacity: 0;
        }
        .slide12-step.revealed {
          animation: slide12RowIn 0.5s ease-out forwards;
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
            rgba(214,69,69,0.4) 0%,
            transparent 14%,
            transparent 50%,
            rgba(200,169,110,0.4) 64%,
            transparent 100%
          );
          animation: slide12BorderRotate 7s linear infinite;
          z-index: 0;
        }
        .slide12-card-inner {
          position: relative;
          z-index: 1;
          border-radius: 22px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 28px 24px;
        }
      `}</style>

      <div className="antigravity-editorial">
        {/* Left — Steps */}
        <div>
          <RevealElement index={1} direction="slam" className="mb-6">
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

          <RevealElement index={2} direction="cardRise">
            <StepsCard revealed={stepsRevealed} />
          </RevealElement>

          <RevealElement index={3} direction="explode" className="mt-5">
            <div
              style={{
                display: "inline-block",
                borderRadius: 9999,
                background: "linear-gradient(135deg, #D64545 0%, #E87070 100%)",
                padding: "12px 28px",
                fontSize: 16,
                fontWeight: 700,
                color: "white",
                boxShadow: "0 6px 20px rgba(214,69,69,0.25)",
              }}
            >
              Losses hit harder than gains help ⚠
            </div>
          </RevealElement>

          <RevealElement index={4} direction="drop" className="mt-4">
            <div
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
              100% gains take years. 50% losses happen in ONE year.
            </div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={5} direction="right" className="flex items-center justify-center">
          <BlobClip
            gradient="linear-gradient(135deg, #D64545 0%, #8B3030 100%)"
            imageSrc={coupleStressedImg}
            imageAlt="Couple stressed about financial losses"
            height="420px"
            width="420px"
            variant={2}
            imageStyle={{ objectPosition: "center center" }}
          />
        </RevealElement>
      </div>
    </div>
  );
}
