import { useState, useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

const columns = [
  {
    rate: "7%",
    color: "#1A4D3E",
    glowColor: "rgba(26, 77, 62, 0.35)",
    doubling: "10.2 years",
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
    glowColor: "rgba(200, 169, 110, 0.35)",
    doubling: "7.2 years",
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
    glowColor: "rgba(200, 169, 110, 0.45)",
    doubling: "6 years",
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

function TiltCard({
  children,
  color,
  glowColor,
}: {
  children: React.ReactNode;
  color: string;
  glowColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px) scale(1.02)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)");
    setIsHovered(false);
  }, []);

  return (
    <div
      className="slide07-border-wrapper"
      style={{ "--border-color": color, "--border-glow": glowColor } as React.CSSProperties}
    >
      <div
        ref={ref}
        onMouseMove={(e) => { handleMouseMove(e); setIsHovered(true); }}
        onMouseLeave={handleMouseLeave}
        className="relative overflow-hidden rounded-2xl"
        style={{
          transform,
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transformStyle: "preserve-3d",
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "28px 24px",
          boxShadow: isHovered
            ? `0 24px 60px -12px ${glowColor}, 0 12px 24px -8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`
            : `0 8px 32px -8px rgba(0,0,0,0.08), 0 4px 12px -4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)`,
        }}
      >
        {/* Light sweep */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            backgroundPosition: isHovered ? "100% 0" : "-100% 0",
            transition: "background-position 0.6s ease",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />
        <div className="relative" style={{ zIndex: 2 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Slide07_CompoundInterest() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide bg-white">
      <style>{`
        @keyframes slide07BorderRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .slide07-border-wrapper {
          position: relative;
          border-radius: 20px;
          padding: 2px;
          isolation: isolate;
        }
        .slide07-border-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          background: conic-gradient(
            from 0deg,
            var(--border-color),
            transparent 30%,
            transparent 70%,
            var(--border-color) 100%
          );
          animation: slide07BorderRotate 4s linear infinite;
          z-index: -1;
          opacity: 0.5;
        }
        .slide07-border-wrapper::after {
          content: '';
          position: absolute;
          inset: 1px;
          border-radius: 19px;
          background: white;
          z-index: -1;
        }
        .slide07-border-wrapper:hover::before {
          opacity: 0.85;
        }
      `}</style>

      <div className="antigravity-slide-inner">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="mb-2">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            Compound <GradientText>Interest</GradientText>
          </h2>
          <p className="text-xl mt-1" style={{ color: "#4A5565" }}>
            The Rule of <strong style={{ color: "var(--ev-gold)" }}>72</strong>
          </p>
          <p className="text-sm mt-2" style={{ color: "#4A5565" }}>
            Investment of $20,000 at different rates of return starting at age 30
          </p>
        </RevealElement>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {columns.map((col, ci) => (
            <RevealElement key={ci} index={ci + 2} direction="cardRise">
              <TiltCard color={col.color} glowColor={col.glowColor}>
                {/* Gauge */}
                <div className="flex justify-center mb-4">
                  <div
                    className="antigravity-gauge"
                    style={{
                      border: `3px solid ${col.color}`,
                      borderBottom: "none",
                    }}
                  >
                    <div
                      className="antigravity-gauge-label"
                      style={{
                        color: col.color,
                        fontFamily: "var(--font-display)",
                        fontSize: "clamp(22px, 2.5vw, 30px)",
                        fontWeight: 700,
                      }}
                    >
                      {col.rate}
                    </div>
                  </div>
                </div>
                <p
                  className="text-center mb-4"
                  style={{
                    color: "#4A5565",
                    fontFamily: "var(--font-body)",
                    fontSize: 12,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  Doubles Every {col.doubling}
                </p>
                <div className="space-y-1">
                  {col.rows.map((row, ri) => {
                    const isLast = ri === col.rows.length - 1;
                    return (
                      <div
                        key={ri}
                        className={`flex justify-between text-sm px-3 py-1.5 rounded-lg ${isLast ? "font-bold" : ""}`}
                        style={
                          isLast
                            ? {
                                background: "#F5E6C8",
                                color: "#1A4D3E",
                              }
                            : { color: "#4A5565" }
                        }
                      >
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>Age {row.age}</span>
                        <span className="antigravity-stat">
                          {isRevealed(ci + 2) ? (
                            <CountingNumber value={row.value} prefix="$" />
                          ) : (
                            "$0"
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </TiltCard>
            </RevealElement>
          ))}
        </div>

        {/* Key insight */}
        <RevealElement index={5} direction="explode" className="flex justify-center mt-6">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            2% difference = DOUBLE the money
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
