import { useState, useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

const columns = [
  {
    rate: "7%",
    color: "#1A4D3E",
    glowColor: "rgba(26, 77, 62, 0.18)",
    accentLight: "rgba(26, 77, 62, 0.06)",
    doubling: "10.2",
    doublingUnit: "yrs",
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
    glowColor: "rgba(200, 169, 110, 0.22)",
    accentLight: "rgba(200, 169, 110, 0.06)",
    doubling: "7.2",
    doublingUnit: "yrs",
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
    glowColor: "rgba(200, 169, 110, 0.28)",
    accentLight: "rgba(200, 169, 110, 0.06)",
    doubling: "6",
    doublingUnit: "yrs",
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
  isRevealed,
}: {
  col: (typeof columns)[0];
  isRevealed: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setTilt({ x, y });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const transform = isHovered
    ? `perspective(800px) rotateY(${tilt.x * 8}deg) rotateX(${-tilt.y * 8}deg) translateY(-6px) scale(1.02)`
    : "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)";

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        handleMouseMove(e);
        setIsHovered(true);
      }}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        borderRadius: 28,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glass card body */}
      <div
        style={{
          borderRadius: 28,
          padding: "36px 32px 32px",
          position: "relative",
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.7)",
          boxShadow: isHovered
            ? `0 24px 60px -12px ${col.glowColor}, 0 12px 24px -8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)`
            : "0 8px 32px -8px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.8)",
          transition: "box-shadow 0.5s ease",
        }}
      >
        {/* Frosted accent gradient in top corner */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${col.accentLight}, transparent 70%)`,
            pointerEvents: "none",
            filter: "blur(20px)",
          }}
        />

        {/* Rate circle with frosted ring */}
        <div
          className="relative flex justify-center mb-6"
          style={{ zIndex: 2 }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(12px)",
              border: `2px solid ${col.color}30`,
              boxShadow: `0 4px 20px -4px ${col.glowColor}, inset 0 1px 0 rgba(255,255,255,0.6)`,
              transition: "box-shadow 0.4s ease, border-color 0.4s ease",
              ...(isHovered
                ? {
                    borderColor: `${col.color}60`,
                    boxShadow: `0 8px 30px -4px ${col.glowColor}, inset 0 1px 0 rgba(255,255,255,0.8)`,
                  }
                : {}),
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 40,
                fontWeight: 800,
                fontStyle: "italic",
                color: col.color,
                letterSpacing: "-0.03em",
              }}
            >
              {col.rate}
            </span>
          </div>
        </div>

        {/* Doubling label */}
        <div
          className="relative text-center mb-6"
          style={{ zIndex: 2 }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase" as const,
              color: "#9CA3AF",
            }}
          >
            DOUBLES EVERY
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              fontWeight: 800,
              color: col.color,
              marginLeft: 8,
              letterSpacing: "-0.01em",
            }}
          >
            {col.doubling}
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 500,
              color: "#9CA3AF",
              marginLeft: 3,
              fontStyle: "italic",
            }}
          >
            {col.doublingUnit}
          </span>
        </div>

        {/* Separator */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent 5%, ${col.color}18 50%, transparent 95%)`,
            marginBottom: 20,
          }}
        />

        {/* Data rows */}
        <div className="relative space-y-1" style={{ zIndex: 2 }}>
          {col.rows.map((row, ri) => {
            const isLast = ri === col.rows.length - 1;
            return (
              <div
                key={ri}
                className="flex items-center justify-between"
                style={{
                  padding: "10px 16px",
                  borderRadius: 16,
                  transition: "all 0.3s ease",
                  ...(isLast
                    ? {
                        background: `linear-gradient(135deg, ${col.color}14, ${col.color}08)`,
                        border: `1px solid ${col.color}25`,
                        boxShadow: `0 2px 8px -2px ${col.glowColor}`,
                      }
                    : {}),
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    fontWeight: isLast ? 700 : 500,
                    color: isLast ? col.color : "#7A8A82",
                    letterSpacing: "0.01em",
                  }}
                >
                  Age {row.age}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: isLast ? 16 : 14,
                    fontWeight: isLast ? 800 : 500,
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
    <div className="antigravity-slide" style={{ background: "#FAFAF8", overflow: "auto", alignItems: "flex-start" }}>
      <style>{`
        @keyframes slide07Float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .slide07-pill-shimmer {
          position: relative;
          overflow: hidden;
        }
        .slide07-pill-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%);
          background-size: 250% 100%;
          animation: slide07PillSweep 3.5s ease-in-out infinite;
        }
        @keyframes slide07PillSweep {
          0%, 100% { background-position: -100% 0; }
          50% { background-position: 250% 0; }
        }
      `}</style>

      <div className="antigravity-slide-inner">
        {/* Title block */}
        <RevealElement index={1} direction="slam" className="mb-6">
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 6,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(36px, 4.5vw, 56px)",
                fontWeight: 800,
                color: "#1A4D3E",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
              }}
            >
              Compound <GradientText>Interest</GradientText>
            </h2>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(16px, 1.5vw, 21px)",
              color: "#6B7B74",
              marginTop: 6,
            }}
          >
            The Rule of{" "}
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontStyle: "italic",
                color: "var(--ev-gold)",
                fontSize: "1.15em",
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
              marginTop: 10,
              letterSpacing: "0.02em",
            }}
          >
            Investment of $20,000 at different rates of return · starting at
            age 30
          </p>
        </RevealElement>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {columns.map((col, ci) => (
            <RevealElement key={ci} index={ci + 2} direction="cardRise">
              <CompoundCard
                col={col}
                isRevealed={isRevealed(ci + 2)}
              />
            </RevealElement>
          ))}
        </div>

        {/* Bottom insight pill */}
        <RevealElement
          index={5}
          direction="explode"
          className="flex justify-center mt-10"
        >
          <div
            className="slide07-pill-shimmer"
            style={{
              background:
                "linear-gradient(135deg, var(--ev-gold), #B8943E)",
              color: "white",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(14px, 1.3vw, 18px)",
              letterSpacing: "0.04em",
              padding: "14px 42px",
              borderRadius: 9999,
              boxShadow:
                "0 12px 36px -8px rgba(200, 169, 110, 0.5), 0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            2% difference = DOUBLE the money
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
