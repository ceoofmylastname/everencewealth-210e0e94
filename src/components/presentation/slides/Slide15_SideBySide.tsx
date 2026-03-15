import { useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

interface StepRow {
  label: string;
  value: string;
  numValue?: number;
  prefix?: string;
  suffix?: string;
  textColor: string;
  glassBg: string;
  bold?: boolean;
}

const variableSteps: StepRow[] = [
  { label: "Start", value: "$100k", numValue: 100, prefix: "$", suffix: "k", textColor: "#2a2a2a", glassBg: "rgba(243,244,246,0.5)" },
  { label: "Market", value: "-50%", textColor: "#D64545", glassBg: "rgba(254,226,226,0.35)" },
  { label: "Balance", value: "$50k", numValue: 50, prefix: "$", suffix: "k", textColor: "#D64545", glassBg: "rgba(254,226,226,0.25)" },
  { label: "Recovery", value: "+50%", textColor: "#8B6914", glassBg: "rgba(245,230,200,0.3)" },
  { label: "Result", value: "$75k", numValue: 75, prefix: "$", suffix: "k", textColor: "#D64545", glassBg: "rgba(254,226,226,0.2)", bold: true },
];

const indexedSteps: StepRow[] = [
  { label: "Start", value: "$100k", numValue: 100, prefix: "$", suffix: "k", textColor: "#1A4D3E", glassBg: "rgba(232,240,236,0.4)" },
  { label: "Market", value: "-0%", textColor: "#1A4D3E", glassBg: "rgba(232,240,236,0.25)" },
  { label: "Protected", value: "$100k", numValue: 100, prefix: "$", suffix: "k", textColor: "#1A4D3E", glassBg: "rgba(232,240,236,0.4)" },
  { label: "Cap", value: "+25%", textColor: "#C8A96E", glassBg: "rgba(245,230,200,0.3)" },
  { label: "Result", value: "$125k", numValue: 125, prefix: "$", suffix: "k", textColor: "#1A4D3E", glassBg: "rgba(245,230,200,0.35)", bold: true },
];

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-3px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  }, []);
  return { ref, onMove, onLeave };
}

function StrategyColumn({
  title,
  titleColor,
  accent,
  steps,
  revealed,
  variant,
}: {
  title: string;
  titleColor: string;
  accent: string;
  steps: StepRow[];
  revealed: boolean;
  variant: "danger" | "success";
}) {
  const { ref, onMove, onLeave } = useTilt();

  return (
    <div
      className="slide15-border-wrap"
      style={{ "--col-accent": accent } as React.CSSProperties}
    >
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="slide15-card-inner"
        style={{ transition: "transform 0.15s ease-out", willChange: "transform" }}
      >
        {/* Column header */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: titleColor,
            textAlign: "center",
            marginBottom: 20,
            opacity: 0.8,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {steps.map((step, i) => (
            <div
              key={i}
              className={`slide15-row ${revealed ? "revealed" : ""}`}
              style={{
                animationDelay: revealed ? `${i * 0.1}s` : undefined,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 18px",
                borderRadius: 14,
                background: step.glassBg,
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.45)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "#7a7a7a" }}>{step.label}</span>
              <span
                className="antigravity-stat"
                style={{
                  fontSize: step.bold ? 26 : 20,
                  fontWeight: step.bold ? 800 : 700,
                  color: step.textColor,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {step.numValue !== undefined && revealed ? (
                  <CountingNumber value={step.numValue} prefix={step.prefix || ""} suffix={step.suffix || ""} duration={1 + i * 0.12} />
                ) : (
                  step.value
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Result highlight bar */}
        <div
          style={{
            marginTop: 16,
            height: 3,
            borderRadius: 9999,
            background: variant === "danger"
              ? "linear-gradient(90deg, #D64545, #EF8080)"
              : "linear-gradient(90deg, #1A4D3E, #C8A96E)",
            opacity: revealed ? 1 : 0,
            transition: "opacity 0.6s ease 0.6s",
          }}
        />
      </div>
    </div>
  );
}

export default function Slide15_SideBySide() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide15BorderRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide15RowIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide15PillSweep {
          0%   { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .slide15-border-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          padding: 2px;
        }
        .slide15-border-wrap::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            var(--col-accent, rgba(200,169,110,0.5)) 0%,
            transparent 14%,
            transparent 50%,
            var(--col-accent, rgba(200,169,110,0.3)) 64%,
            transparent 100%
          );
          animation: slide15BorderRotate 7s linear infinite;
          z-index: 0;
        }
        .slide15-card-inner {
          position: relative;
          z-index: 1;
          border-radius: 22px;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 28px 24px;
        }
        .slide15-row {
          opacity: 0;
        }
        .slide15-row.revealed {
          animation: slide15RowIn 0.45s ease-out forwards;
        }
      `}</style>

      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-8">
          <h2
            className="text-4xl font-bold"
            style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}
          >
            Same Market. <GradientText>Different Strategy.</GradientText>
          </h2>
        </RevealElement>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-8">
          <RevealElement index={2} direction="cardRise">
            <StrategyColumn
              title="Variable Strategy"
              titleColor="#D64545"
              accent="rgba(214,69,69,0.45)"
              steps={variableSteps}
              revealed={isRevealed(2)}
              variant="danger"
            />
          </RevealElement>

          <RevealElement index={3} direction="cardRise">
            <StrategyColumn
              title="Indexed Strategy"
              titleColor="#1A4D3E"
              accent="rgba(26,77,62,0.45)"
              steps={indexedSteps}
              revealed={isRevealed(3)}
              variant="success"
            />
          </RevealElement>
        </div>

        {/* Bottom comparison pill */}
        <RevealElement index={4} direction="explode" className="flex justify-center">
          <div
            style={{
              display: "inline-block",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #1A4D3E 0%, #2E6B54 100%)",
              padding: "14px 36px",
              boxShadow: "0 8px 28px rgba(26,77,62,0.2)",
            }}
          >
            <span style={{ fontSize: 18, color: "white", fontWeight: 600 }}>
              $75k vs $125k —{" "}
              <strong
                style={{
                  background: "linear-gradient(90deg, #C8A96E, #F5E6C8, #C8A96E)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "goldShimmer 4s linear infinite",
                }}
              >
                {isRevealed(4) ? (
                  <>$<CountingNumber value={50000} prefix="" duration={1.4} /> Difference</>
                ) : (
                  "$0 Difference"
                )}
              </strong>
            </span>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
