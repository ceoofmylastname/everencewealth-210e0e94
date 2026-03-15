import { useState, useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import GoldUnderline from "../animations/GoldUnderline";
import warrenBuffettImg from "@/assets/warren-buffett-portrait.png";

function RuleCard({
  ruleNumber,
  ruleText,
  delay,
}: {
  ruleNumber: string;
  ruleText: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px) scale(1.02)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)");
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => { handleMouseMove(e); setIsHovered(true); }}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl cursor-pointer"
      style={{
        transform,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        background: "linear-gradient(135deg, #1A4D3E 0%, #2A6B55 60%, #1A4D3E 100%)",
        padding: "28px 32px",
        boxShadow: isHovered
          ? "0 24px 60px -12px rgba(26, 77, 62, 0.45), 0 12px 24px -8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.12)"
          : "0 8px 32px -8px rgba(26, 77, 62, 0.25), 0 4px 12px -4px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.08)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Light sweep */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPosition: isHovered ? "100% 0" : "-100% 0",
          transition: "background-position 0.6s ease",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: isHovered
            ? "radial-gradient(ellipse at 30% 20%, rgba(200, 169, 110, 0.12) 0%, transparent 60%)"
            : "none",
          transition: "background 0.4s ease",
          pointerEvents: "none",
        }}
      />

      <span
        className="relative block"
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 500,
          fontSize: 12,
          color: "rgba(200, 169, 110, 0.7)",
          letterSpacing: "0.3em",
          textTransform: "uppercase" as const,
          marginBottom: 8,
          zIndex: 2,
        }}
      >
        {ruleNumber}
      </span>
      <div
        className="relative"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(22px, 2.5vw, 30px)",
          color: "#C8A96E",
          letterSpacing: "0.04em",
          lineHeight: 1.2,
          zIndex: 2,
          textShadow: isHovered ? "0 2px 12px rgba(200, 169, 110, 0.3)" : "none",
          transition: "text-shadow 0.4s ease",
        }}
      >
        {ruleText}
      </div>
    </div>
  );
}

export default function Slide06_WarrenBuffett() {
  return (
    <div className="antigravity-slide" style={{ background: "#F8F7F4" }}>
      <style>{`
        @keyframes slide06Float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <div className="antigravity-editorial">
        {/* Left Side */}
        <div>
          {/* Title */}
          <RevealElement index={1} direction="slam">
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 11,
                color: "#C8A96E",
                letterSpacing: "0.35em",
                textTransform: "uppercase" as const,
                marginBottom: 12,
              }}
            >
              INVESTMENT WISDOM
            </p>
            <h2
              className="text-5xl md:text-6xl font-bold mb-2"
              style={{
                color: "#1A4D3E",
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              <GoldUnderline>Warren Buffett</GoldUnderline>
            </h2>
            <p
              className="mb-10"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "clamp(18px, 2vw, 22px)",
                color: "#6B7B74",
                letterSpacing: "-0.01em",
              }}
            >
              Rules to Building Wealth
            </p>
          </RevealElement>

          {/* Rule 1 */}
          <RevealElement index={2} direction="cardRise" className="mb-5">
            <RuleCard ruleNumber="RULE 1" ruleText="NEVER LOSE MONEY" delay={0} />
          </RevealElement>

          {/* Rule 2 */}
          <RevealElement index={3} direction="cardRise">
            <RuleCard ruleNumber="RULE 2" ruleText="NEVER FORGET RULE 1" delay={0.1} />
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={4} direction="right" className="flex items-center justify-center">
          <div style={{ animation: "slide06Float 5s ease-in-out infinite" }}>
            <BlobClip
              imageSrc={warrenBuffettImg}
              imageAlt="Warren Buffett"
              height="380px"
              variant={1}
            />
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
