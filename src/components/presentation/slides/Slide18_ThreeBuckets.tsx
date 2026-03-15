import { useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

interface BucketData {
  label: string;
  rate: number;
  rateSuffix: string;
  color: string;
  trend: "up" | "down";
  cardBg: string;
  textColor: string;
  badgeBg: string;
  glowColor: string;
  borderColor: string;
}

const BUCKETS: BucketData[] = [
  {
    label: "ORDINARY INCOME",
    rate: 40,
    rateSuffix: "%+",
    color: "#D64545",
    trend: "up",
    cardBg: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(254,226,226,0.15) 100%)",
    textColor: "#1A4D3E",
    badgeBg: "#D64545",
    glowColor: "rgba(214,69,69,0.12)",
    borderColor: "rgba(214,69,69,0.1)",
  },
  {
    label: "CAPITAL GAINS",
    rate: 40.3,
    rateSuffix: "%",
    color: "#E8870A",
    trend: "up",
    cardBg: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,248,235,0.2) 100%)",
    textColor: "#1A4D3E",
    badgeBg: "#E8870A",
    glowColor: "rgba(232,135,10,0.1)",
    borderColor: "rgba(232,135,10,0.1)",
  },
  {
    label: "TAX FREE",
    rate: 0,
    rateSuffix: "%",
    color: "#1A4D3E",
    trend: "down",
    cardBg: "linear-gradient(180deg, rgba(26,77,62,0.85) 0%, rgba(26,77,62,0.95) 100%)",
    textColor: "#ffffff",
    badgeBg: "#2a2a2a",
    glowColor: "rgba(26,77,62,0.15)",
    borderColor: "rgba(26,77,62,0.2)",
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

function BucketCard({ bucket, revealed }: { bucket: BucketData; revealed: boolean }) {
  const { ref, onMove, onLeave } = useTilt();
  const isDark = bucket.label === "TAX FREE";

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: 32,
          background: `radial-gradient(circle at 50% 70%, ${bucket.glowColor}, transparent 70%)`,
          filter: "blur(16px)",
          pointerEvents: "none",
        }}
      />
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          borderRadius: 24,
          padding: "32px 24px",
          background: bucket.cardBg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${bucket.borderColor}`,
          boxShadow: "0 12px 40px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)",
          display: "flex",
          flexDirection: "column" as const,
          alignItems: "center",
          textAlign: "center" as const,
          minHeight: 220,
          justifyContent: "center",
          transition: "transform 0.15s ease-out",
          willChange: "transform",
        }}
      >
        {/* Tax direction badge */}
        <div
          style={{
            borderRadius: 9999,
            background: bucket.badgeBg,
            color: "white",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 14px",
            marginBottom: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            letterSpacing: 0.5,
          }}
        >
          {bucket.trend === "up" ? "↑" : "↓"} Taxes
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            color: isDark ? "rgba(255,255,255,0.7)" : "#5a5a5a",
            marginBottom: 8,
          }}
        >
          {bucket.label}
        </div>

        {/* Rate - animated */}
        <div
          className="antigravity-stat"
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: bucket.textColor,
            fontFamily: "var(--font-display)",
            lineHeight: 1.1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {revealed ? (
            <>
              <CountingNumber value={bucket.rate} duration={1.2} decimals={bucket.rate % 1 !== 0 ? 1 : 0} />
              {bucket.rateSuffix}
            </>
          ) : (
            `0${bucket.rateSuffix}`
          )}
        </div>

        {/* Sub label */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: isDark ? "rgba(255,255,255,0.5)" : "#9a9a9a",
            marginTop: 4,
          }}
        >
          Tax Rate
        </div>
      </div>
    </div>
  );
}

export default function Slide18_ThreeBuckets() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-2">
          <h2 className="text-4xl font-bold" style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}>
            Three Ways Your <GradientText>Money Gets Taxed</GradientText>
          </h2>
        </RevealElement>

        {/* Reveal 2: Subtitle */}
        <RevealElement index={2} direction="up" className="text-center mb-8">
          <p className="text-base" style={{ color: "#7a7a7a" }}>
            Let's assume the same numbers for all three categories. Withdrawal:{" "}
            <strong className="antigravity-stat" style={{ color: "#2a2a2a" }}>$100,000</strong>
          </p>
        </RevealElement>

        {/* Reveals 3-5: Individual bucket cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto w-full mb-8">
          {BUCKETS.map((bucket, i) => (
            <RevealElement
              key={bucket.label}
              index={i + 3}
              direction={i === 2 ? "explode" : "cardRise"}
            >
              <BucketCard bucket={bucket} revealed={isRevealed(i + 3)} />
            </RevealElement>
          ))}
        </div>

        {/* Reveal 6: Bottom pill */}
        <RevealElement index={6} direction="whomp" className="flex justify-center">
          <div
            style={{
              display: "inline-block",
              borderRadius: 9999,
              background: "linear-gradient(135deg, #1A4D3E 0%, #2E6B54 100%)",
              padding: "14px 36px",
              boxShadow: "0 8px 28px rgba(26,77,62,0.2)",
            }}
          >
            <span style={{ fontSize: 17, color: "white", fontWeight: 600 }}>
              Same withdrawal.{" "}
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
                Dramatically different
              </strong>{" "}
              outcomes.
            </span>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
