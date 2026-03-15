import { useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";
import bucketOrdinary from "@/assets/bucket-ordinary-income.png";
import bucketCapital from "@/assets/bucket-capital-gains.png";
import bucketTaxFree from "@/assets/bucket-tax-free.png";

const buckets = [
  {
    title: "ORDINARY INCOME",
    image: bucketOrdinary,
    items: ["401(k)", "403(b)", "457 Plan", "Pension"],
    accent: "rgba(200,169,110,0.5)",
    labelBg: "linear-gradient(135deg, #C8A96E, #A8884E)",
    labelColor: "#1a1a1a",
    cardGradient: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(245,230,200,0.2) 100%)",
    glowColor: "rgba(200,169,110,0.2)",
  },
  {
    title: "CAPITAL GAINS",
    image: bucketCapital,
    items: ["Brokerage Account", "Bonds", "Stocks", "ETFs", "Crypto"],
    accent: "rgba(232,212,77,0.5)",
    labelBg: "linear-gradient(135deg, #E8D44D, #C8B82E)",
    labelColor: "#1a1a1a",
    cardGradient: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,248,235,0.25) 100%)",
    glowColor: "rgba(232,212,77,0.2)",
  },
  {
    title: "TAX FREE",
    image: bucketTaxFree,
    items: ["Roth IRA", "SERP"],
    accent: "rgba(26,77,62,0.5)",
    labelBg: "linear-gradient(135deg, #1A4D3E, #2A6B55)",
    labelColor: "#fff",
    cardGradient: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(26,77,62,0.06) 100%)",
    glowColor: "rgba(26,77,62,0.15)",
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

function BucketCard({ bucket, index }: { bucket: (typeof buckets)[0]; index: number }) {
  const { ref, onMove, onLeave } = useTilt();

  return (
    <div style={{ position: "relative" }}>
      {/* Glow behind */}
      <div
        style={{
          position: "absolute",
          inset: -6,
          borderRadius: 32,
          background: `radial-gradient(circle at 50% 60%, ${bucket.glowColor}, transparent 70%)`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="slide17-border-wrap"
        style={{ "--bucket-accent": bucket.accent } as React.CSSProperties}
      >
        <div
          ref={ref}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          className="slide17-card-inner"
          style={{
            background: bucket.cardGradient,
            transition: "transform 0.15s ease-out",
            willChange: "transform",
          }}
        >
          {/* Bucket image with float animation */}
          <div
            className="slide17-float"
            style={{
              width: 130,
              height: 130,
              marginBottom: 16,
              position: "relative",
              animationDelay: `${index * 0.3}s`,
            }}
          >
            <img
              src={bucket.image}
              alt={`${bucket.title} bucket`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.15))",
              }}
            />
          </div>

          {/* Label pill */}
          <div
            style={{
              borderRadius: 9999,
              background: bucket.labelBg,
              color: bucket.labelColor,
              padding: "8px 22px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              marginBottom: 16,
            }}
          >
            {bucket.title}
          </div>

          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {bucket.items.map((item) => (
              <div
                key={item}
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#4a4a4a",
                  padding: "4px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.5)",
                  backdropFilter: "blur(6px)",
                  textAlign: "center",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Slide17_TaxBucketsIntro() {
  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <style>{`
        @keyframes slide17BorderRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slide17Float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        .slide17-border-wrap {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          padding: 2px;
        }
        .slide17-border-wrap::before {
          content: '';
          position: absolute;
          inset: -50%;
          background: conic-gradient(
            from 0deg,
            var(--bucket-accent, rgba(200,169,110,0.4)) 0%,
            transparent 14%,
            transparent 50%,
            var(--bucket-accent, rgba(200,169,110,0.3)) 64%,
            transparent 100%
          );
          animation: slide17BorderRotate 7s linear infinite;
          z-index: 0;
        }
        .slide17-card-inner {
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
          min-height: 340px;
        }
        .slide17-float {
          animation: slide17Float 3s ease-in-out infinite;
        }
      `}</style>

      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-10">
          <h2
            className="text-4xl font-bold"
            style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}
          >
            Tax <GoldUnderline><GradientText>Categories</GradientText></GoldUnderline>
          </h2>
          <p className="text-base mt-3" style={{ color: "#7a7a7a" }}>
            The three different ways your money is taxed and how it can impact you
          </p>
        </RevealElement>

        {/* Bucket Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {buckets.map((bucket, i) => (
            <RevealElement
              key={bucket.title}
              index={i === 2 ? 3 : 2}
              direction={i === 2 ? "explode" : "cardRise"}
            >
              <BucketCard bucket={bucket} index={i} />
            </RevealElement>
          ))}
        </div>
      </div>
    </div>
  );
}
