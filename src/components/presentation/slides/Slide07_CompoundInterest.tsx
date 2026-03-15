import { useState, useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

const columns = [
  {
    rate: "7%",
    color: "#1A4D3E",
    gradientFrom: "rgba(26, 77, 62, 0.08)",
    gradientTo: "rgba(26, 77, 62, 0.02)",
    glowColor: "rgba(26, 77, 62, 0.25)",
    doubling: "10.2 yrs",
    rows: [
      { age: 30, value: 20000 },
      { age: 40, value: 40000 },
      { age: 50, value: 80000 },
      { age: 60, value: 160000 },
    ],
  },
  {
    rate: "10%",
    color: "#C8A96E",
    gradientFrom: "rgba(200, 169, 110, 0.10)",
    gradientTo: "rgba(200, 169, 110, 0.02)",
    glowColor: "rgba(200, 169, 110, 0.30)",
    doubling: "7.2 yrs",
    rows: [
      { age: 30, value: 20000 },
      { age: 37, value: 40000 },
      { age: 44, value: 80000 },
      { age: 52, value: 160000 },
      { age: 59, value: 320000 },
      { age: 66, value: 640000 },
    ],
  },
  {
    rate: "12%",
    color: "#C8A96E",
    gradientFrom: "rgba(200, 169, 110, 0.12)",
    gradientTo: "rgba(200, 169, 110, 0.03)",
    glowColor: "rgba(200, 169, 110, 0.35)",
    doubling: "6 yrs",
    rows: [
      { age: 30, value: 20000 },
      { age: 36, value: 40000 },
      { age: 42, value: 80000 },
      { age: 48, value: 160000 },
      { age: 54, value: 320000 },
      { age: 60, value: 640000 },
      { age: 66, value: 1200000 },
    ],
  },
];

function CompoundCard({
  col,
  ci,
  isRevealed,
}: {
  col: typeof columns[0];
  ci: number;
  isRevealed: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.01)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)");
  }, []);

  return (
    <div
      className="slide07-card-outer"
      style={{ "--card-accent": col.color } as React.CSSProperties}
    >
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform,
          transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
          borderRadius: 24,
          padding: "32px 28px 28px",
          position: "relative",
          overflow: "hidden",
          background: "#FFFFFF",
          boxShadow: "0 4px 24px -4px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        {/* Animated border overlay */}
        <div
          className="slide07-border-ring"
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 24,
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* Rate circle */}
        <div className="relative flex justify-center mb-5" style={{ zIndex: 7 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2.5px solid ${col.color}33`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(28px, 3vw, 36px)",
                fontWeight: 700,
                color: col.color,
                letterSpacing: "-0.02em",
              }}
            >
              {col.rate}
            </span>
          </div>
        </div>

        {/* Doubling label */}
        <div className="relative text-center mb-5" style={{ zIndex: 7 }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase" as const,
              color: "#9CA3AF",
            }}
          >
            Doubles every
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: col.color,
              marginLeft: 6,
            }}
          >
            {col.doubling}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${col.color}22, transparent)`,
            marginBottom: 16,
          }}
        />

        {/* Rows */}
        <div className="relative space-y-0.5" style={{ zIndex: 7 }}>
          {col.rows.map((row, ri) => {
            const isLast = ri === col.rows.length - 1;
            return (
              <div
                key={ri}
                className="flex items-center justify-between"
                style={{
                  padding: "8px 14px",
                  borderRadius: 14,
                  transition: "background 0.3s ease",
                  ...(isLast
                    ? {
                        background: `linear-gradient(135deg, ${col.color}18, ${col.color}0A)`,
                        border: `1px solid ${col.color}22`,
                      }
                    : {}),
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: isLast ? 700 : 500,
                    color: isLast ? col.color : "#6B7B74",
                  }}
                >
                  Age {row.age}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: isLast ? 700 : 500,
                    letterSpacing: "0.02em",
                    color: isLast ? col.color : "#4A5565",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {isRevealed ? (
                    <CountingNumber value={row.value} prefix="$" />
                  ) : (
                    "$0"
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Slide07_CompoundInterest() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        .slide07-card-outer {
          position: relative;
          border-radius: 26px;
        }
        .slide07-pill-shimmer {
          position: relative;
          overflow: hidden;
        }
        .slide07-pill-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%);
          background-size: 200% 100%;
          animation: slide07PillSweep 3s ease-in-out infinite;
        }
        @keyframes slide07PillSweep {
          0%, 100% { background-position: -100% 0; }
          50% { background-position: 200% 0; }
        }
      `}</style>

      <div className="antigravity-slide-inner">
        {/* Title block */}
        <RevealElement index={1} direction="slam" className="mb-4">
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                fontWeight: 700,
                color: "#1A4D3E",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Compound <GradientText>Interest</GradientText>
            </h2>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(16px, 1.5vw, 20px)",
              color: "#6B7B74",
              marginTop: 4,
            }}
          >
            The Rule of{" "}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--ev-gold)",
                fontSize: "1.1em",
              }}
            >
              72
            </span>
          </p>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "#9CA3AF",
              marginTop: 8,
              letterSpacing: "0.01em",
            }}
          >
            Investment of $20,000 at different rates of return · starting at age 30
          </p>
        </RevealElement>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mt-4">
          {columns.map((col, ci) => (
            <RevealElement key={ci} index={ci + 2} direction="cardRise">
              <CompoundCard col={col} ci={ci} isRevealed={isRevealed(ci + 2)} />
            </RevealElement>
          ))}
        </div>

        {/* Bottom insight pill */}
        <RevealElement index={5} direction="explode" className="flex justify-center mt-8">
          <div
            className="slide07-pill-shimmer"
            style={{
              background: "linear-gradient(135deg, var(--ev-gold), #B8943E)",
              color: "white",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(14px, 1.3vw, 17px)",
              letterSpacing: "0.03em",
              padding: "12px 36px",
              borderRadius: 9999,
              boxShadow: "0 8px 28px -6px rgba(200, 169, 110, 0.45), 0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            2% difference = DOUBLE the money
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
