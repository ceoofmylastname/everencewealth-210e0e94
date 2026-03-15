import { useRef, useState, useCallback } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import investFixed from "@/assets/invest-fixed.jpg";
import investVariable from "@/assets/invest-variable.jpg";
import investIndexed from "@/assets/invest-indexed.jpg";

const columns = [
  {
    title: "FIXED",
    items: "Savings Account / CD / Bonds",
    image: investFixed,
    glassBg: "rgba(232, 235, 240, 0.5)",
    hoverGlow: "0 20px 60px -12px rgba(148, 163, 184, 0.4)",
    accentColor: "rgba(148, 163, 184, 0.15)",
    floatDelay: "0s",
  },
  {
    title: "VARIABLE",
    items: "Brokerage Accounts / IRA / 401k / Stocks",
    image: investVariable,
    glassBg: "rgba(245, 230, 200, 0.5)",
    hoverGlow: "0 20px 60px -12px rgba(217, 176, 96, 0.35)",
    accentColor: "rgba(217, 176, 96, 0.15)",
    floatDelay: "1s",
  },
  {
    title: "INDEXED",
    items: "Protection / Growth",
    image: investIndexed,
    recommended: true,
    glassBg: "rgba(232, 240, 236, 0.5)",
    hoverGlow: "0 20px 60px -12px rgba(26, 77, 62, 0.3)",
    accentColor: "rgba(26, 77, 62, 0.1)",
    floatDelay: "2s",
  },
];

function TiltCard({
  children,
  className = "",
  style = {},
  hoverGlow,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hoverGlow: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform(`perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px) scale(1.03)`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)");
    setIsHovered(false);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(e) => { handleMouseMove(e); setIsHovered(true); }}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        transform,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: isHovered
          ? `${hoverGlow}, inset 0 1px 0 rgba(255,255,255,0.8)`
          : "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
      }}
    >
      {/* Light sweep overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          backgroundPosition: isHovered ? "100% 0" : "-100% 0",
          transition: "background-position 0.6s ease",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {children}
    </div>
  );
}

export default function Slide03_WaysToInvest() {
  return (
    <div className="antigravity-slide bg-white">
      <style>{`
        @keyframes slide03Float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes slide03Shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      <div className="antigravity-slide-inner">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-6">
          <h2
            className="text-5xl md:text-6xl font-bold tracking-tight"
            style={{ color: "#1A4D3E", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
          >
            Ways to <GradientText>Invest</GradientText>
          </h2>
          <p className="text-lg md:text-xl mt-4 max-w-2xl mx-auto" style={{ color: "#4A5565", fontWeight: 300 }}>
            There are several ways to invest your money. Here, in broad terms, are three options:
          </p>
        </RevealElement>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-10">
          {columns.map((col, i) => (
            <RevealElement key={col.title} index={i + 2} direction="cardRise">
              <div
                style={{
                  animation: `slide03Float 4s ease-in-out ${col.floatDelay} infinite`,
                }}
              >
                <TiltCard
                  hoverGlow={col.hoverGlow}
                  className="group relative flex flex-col items-center text-center rounded-3xl p-7 overflow-hidden cursor-default"
                  style={{
                    background: col.glassBg,
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255, 255, 255, 0.7)",
                  }}
                >
                  {/* Image with zoom */}
                  <div className="w-full h-[220px] rounded-2xl mb-5 overflow-hidden relative">
                    <img
                      src={col.image}
                      alt={col.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {/* Bottom gradient overlay */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-16"
                      style={{
                        background: `linear-gradient(to top, ${col.glassBg}, transparent)`,
                        pointerEvents: "none",
                      }}
                    />
                  </div>

                  {/* Title */}
                  <h3
                    className="text-3xl font-bold mb-2 tracking-tight"
                    style={{ color: "#1A4D3E", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                  >
                    {col.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-base" style={{ color: "#4A5565", fontWeight: 400 }}>
                    {col.items}
                  </p>

                  {/* Recommended pill with shimmer */}
                  {col.recommended && (
                    <div
                      className="mt-5 px-5 py-2 rounded-full text-sm font-bold"
                      style={{
                        background: "linear-gradient(90deg, #C5A55A, #E8D5A3, #C5A55A, #E8D5A3)",
                        backgroundSize: "200% 100%",
                        animation: "slide03Shimmer 3s linear infinite",
                        color: "#1A4D3E",
                        boxShadow: "0 4px 16px rgba(197, 165, 90, 0.3)",
                      }}
                    >
                      ✦ Recommended
                    </div>
                  )}

                  {/* Accent glow behind card */}
                  <div
                    className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: col.accentColor }}
                  />
                </TiltCard>
              </div>
            </RevealElement>
          ))}
        </div>
      </div>
    </div>
  );
}
