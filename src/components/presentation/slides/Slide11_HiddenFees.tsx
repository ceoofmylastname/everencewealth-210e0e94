import { useState, useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

const feeData = [
  { year: 1, noFee: 3888, fee095: 3851, fee2: 3810, fee3: 3771 },
  { year: 10, noFee: 56312, fee095: 53143, fee2: 49846, fee3: 46908 },
  { year: 20, noFee: 177923, fee095: 157429, fee2: 137775, fee3: 121587 },
  { year: 25, noFee: 284236, fee095: 242669, fee2: 204397, fee3: 174153 },
  { year: 30, noFee: 440445, fee095: 362077, fee2: 292881, fee3: 240479 },
  { year: 35, noFee: 669968, fee095: 529350, fee2: 410402, fee3: 324167, bold: true },
];

const costs = [
  { label: "0.95% Fee", value: 140618, color: "#1A4D3E" },
  { label: "2% Fee", value: 259566, color: "#8B6914" },
  { label: "3% Fee", value: 345801, color: "#D64545", highlight: true },
];

/* 3D tilt hook */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-2px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  }, []);
  return { ref, onMove, onLeave };
}

function TiltCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const { ref, onMove, onLeave } = useTilt();
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: "transform 0.15s ease-out", willChange: "transform", ...style }}
    >
      {children}
    </div>
  );
}

const colHeaders = [
  { label: "Year", bg: "#1A4D3E" },
  { label: "No Fee", bg: "#1A4D3E" },
  { label: "0.95% Fee", bg: "#2E6B54" },
  { label: "2% Fee", bg: "#8B6914" },
  { label: "3% Fee", bg: "#C8A96E" },
];

export default function Slide11_HiddenFees() {
  const { isRevealed } = useRevealQueue();
  const tableRevealed = isRevealed(2);

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide11RowFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide11CostDrop {
          from { opacity: 0; transform: translateY(-40px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slide11BorderRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide11PillSweep {
          0%   { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .slide11-table-row {
          opacity: 0;
        }
        .slide11-table-row.revealed {
          animation: slide11RowFade 0.5s ease-out forwards;
        }
        .slide11-cost-card {
          opacity: 0;
        }
        .slide11-cost-card.revealed {
          animation: slide11CostDrop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .slide11-border-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          padding: 2px;
        }
        .slide11-border-wrap::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            rgba(200, 169, 110, 0.5) 0%,
            transparent 14%,
            transparent 50%,
            rgba(26, 77, 62, 0.4) 64%,
            transparent 100%
          );
          animation: slide11BorderRotate 7s linear infinite;
          z-index: 0;
        }
        .slide11-glass {
          position: relative;
          z-index: 1;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>

      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="mb-4 text-center">
          <h2
            className="text-4xl font-bold"
            style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}
          >
            Hidden Fees inside
          </h2>
          <h2 className="text-4xl font-bold mt-1">
            <GoldUnderline>
              <GradientText>Retirement Plans</GradientText>
            </GoldUnderline>
          </h2>
          <p className="text-sm mt-3" style={{ color: "#7a7a7a" }}>
            $3,600 annual contribution, 8% compounded, 35 years
          </p>
        </RevealElement>

        {/* Table with animated border */}
        <RevealElement index={2} direction="cardRise" className="w-full max-w-4xl mb-6">
          <TiltCard className="slide11-border-wrap">
            <div
              className="slide11-glass overflow-hidden"
              style={{
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {colHeaders.map((h, i) => (
                      <th
                        key={i}
                        style={{
                          background: h.bg,
                          color: "white",
                          padding: "14px 20px",
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          textAlign: i === 0 ? "left" : "right",
                          borderBottom: "none",
                        }}
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feeData.map((row, i) => (
                    <tr
                      key={i}
                      className={`slide11-table-row ${tableRevealed ? "revealed" : ""}`}
                      style={{
                        animationDelay: tableRevealed ? `${i * 0.1}s` : undefined,
                        background: row.bold
                          ? "linear-gradient(90deg, rgba(200,169,110,0.12) 0%, rgba(245,230,200,0.25) 100%)"
                          : i % 2 === 0
                            ? "rgba(250,250,248,1)"
                            : "rgba(245,245,243,1)",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 20px",
                          fontWeight: 700,
                          fontSize: 14,
                          color: "#1A4D3E",
                        }}
                      >
                        {row.year}
                      </td>
                      {(["noFee", "fee095", "fee2", "fee3"] as const).map((key, ci) => (
                        <td
                          key={ci}
                          style={{
                            padding: "12px 20px",
                            textAlign: "right",
                            fontFamily: "var(--font-mono, 'SF Mono', monospace)",
                            fontVariantNumeric: "tabular-nums",
                            fontSize: 14,
                            fontWeight: row.bold ? 700 : 500,
                            color: row.bold
                              ? ci === 3
                                ? "#D64545"
                                : "#2a2a2a"
                              : "#4a4a4a",
                          }}
                        >
                          {tableRevealed ? (
                            <CountingNumber value={row[key]} prefix="$" duration={1 + i * 0.15} />
                          ) : (
                            "$0"
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TiltCard>
        </RevealElement>

        {/* Cost cards — drop in from top on reveal */}
        <RevealElement index={3} direction="none" className="mb-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {costs.map((cost, i) => (
              <div
                key={i}
                className={`slide11-cost-card ${isRevealed(3) ? "revealed" : ""}`}
                style={{ animationDelay: isRevealed(3) ? `${i * 0.15}s` : undefined }}
              >
                <TiltCard
                  style={{
                    borderRadius: 20,
                    background: cost.highlight
                      ? "linear-gradient(135deg, rgba(214,69,69,0.08), rgba(214,69,69,0.15))"
                      : "rgba(255,255,255,0.7)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: cost.highlight
                      ? "1.5px solid rgba(214,69,69,0.2)"
                      : "1px solid rgba(200,169,110,0.2)",
                    padding: "14px 28px",
                    textAlign: "center" as const,
                    boxShadow: cost.highlight
                      ? "0 8px 24px rgba(214,69,69,0.12)"
                      : "0 6px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: "uppercase" as const,
                      color: cost.color,
                      marginBottom: 4,
                    }}
                  >
                    {cost.label}
                  </div>
                  <div
                    className="antigravity-stat"
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: cost.color,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {isRevealed(3) ? (
                      <CountingNumber value={cost.value} prefix="$" duration={1.4} />
                    ) : (
                      "$0"
                    )}
                  </div>
                </TiltCard>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Warning callouts */}
        <RevealElement index={4} direction="whomp">
          <div className="flex flex-col items-center gap-3">
            <div
              style={{
                borderRadius: 9999,
                background: "linear-gradient(135deg, rgba(214,69,69,0.06), rgba(214,69,69,0.12))",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(214,69,69,0.15)",
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                color: "#D64545",
              }}
            >
              Average 401k fees: <strong>3.1%</strong> — More than HALF your account gone.
            </div>
          </div>
        </RevealElement>

        <RevealElement index={5} direction="whomp" className="mt-2">
          <div className="flex justify-center">
            <div
              style={{
                borderRadius: 9999,
                background: "linear-gradient(135deg, #C8A96E 0%, #E8D5A8 50%, #C8A96E 100%)",
                backgroundSize: "200% 100%",
                animation: "slide11PillSweep 4s ease-in-out infinite",
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                color: "#1a1a1a",
                boxShadow: "0 4px 16px rgba(200,169,110,0.25)",
              }}
            >
              Average advisor total fees: <strong>3.7%</strong>
            </div>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
