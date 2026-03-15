import { useRef, useCallback } from "react";
import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 8;
    const y = ((e.clientY - r.top) / r.height - 0.5) * -8;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current)
      ref.current.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  }, []);
  return { ref, onMove, onLeave };
}

interface Category {
  title: string;
  subtitle: string;
  badges: string[];
  rate: string;
  net: number;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  glowColor: string;
  warningText: string;
  warningBg: string;
  warningTextColor: string;
  titleColor: string;
}

const categories: Category[] = [
  {
    title: "Capital Gains",
    subtitle: "Taxed When You Sell Investments — Top Marginal Rate",
    badges: ["Bonds", "Stocks", "ETFs", "Crypto", "Brokerage Account"],
    rate: "28% Federal + 12.3% State",
    net: 59700,
    accentColor: "#C8A96E",
    badgeBg: "rgba(200,169,110,0.15)",
    badgeText: "#8B6914",
    cardBg: "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(245,235,215,0.3) 100%)",
    cardBorder: "rgba(200,169,110,0.2)",
    glowColor: "rgba(200,169,110,0.12)",
    warningText: "You thought you had $100k. You actually have $59,700.",
    warningBg: "rgba(200,169,110,0.1)",
    warningTextColor: "#8B6914",
    titleColor: "#1A4D3E",
  },
  {
    title: "Ordinary Income",
    subtitle: "Taxed at the Highest Marginal Rate",
    badges: ["401(k)", "457 Plan", "403(b)", "Pension"],
    rate: "37% Federal + 13.3% State = 50.3% Total",
    net: 49700,
    accentColor: "#D64545",
    badgeBg: "rgba(214,69,69,0.1)",
    badgeText: "#B83232",
    cardBg: "linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(255,235,235,0.2) 100%)",
    cardBorder: "rgba(214,69,69,0.15)",
    glowColor: "rgba(214,69,69,0.08)",
    warningText: "Half of your retirement — gone to taxes.",
    warningBg: "rgba(214,69,69,0.08)",
    warningTextColor: "#B83232",
    titleColor: "#D64545",
  },
  {
    title: "Tax Free",
    subtitle: "0% State & Federal Income Tax",
    badges: ["Roth IRA", "SERP"],
    rate: "0% Total",
    net: 100000,
    accentColor: "#1A4D3E",
    badgeBg: "rgba(26,77,62,0.12)",
    badgeText: "#1A4D3E",
    cardBg: "linear-gradient(160deg, rgba(26,77,62,0.95) 0%, rgba(26,77,62,0.85) 100%)",
    cardBorder: "rgba(255,255,255,0.15)",
    glowColor: "rgba(26,77,62,0.15)",
    warningText: "You keep every dollar. No surprises.",
    warningBg: "rgba(255,255,255,0.12)",
    warningTextColor: "rgba(255,255,255,0.9)",
    titleColor: "#ffffff",
  },
];

function TaxCard({ cat, revealed }: { cat: Category; revealed: boolean }) {
  const { ref, onMove, onLeave } = useTilt();
  const isDark = cat.title === "Tax Free";

  return (
    <div style={{ position: "relative" }}>
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          borderRadius: 28,
          background: `radial-gradient(circle at 50% 70%, ${cat.glowColor}, transparent 70%)`,
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
      />
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          position: "relative",
          background: cat.cardBg,
          border: `1px solid ${cat.cardBorder}`,
          borderRadius: 20,
          padding: "28px 24px",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "transform 0.15s ease-out, box-shadow 0.25s ease",
          willChange: "transform",
          boxShadow: "0 8px 32px -8px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column" as const,
          minHeight: 360,
          cursor: "default",
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: cat.titleColor,
            marginBottom: 4,
            fontFamily: "var(--font-display)",
          }}
        >
          {cat.title}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.65)" : "#6B7280",
            marginBottom: 14,
            lineHeight: 1.4,
          }}
        >
          {cat.subtitle}
        </p>

        {/* Badges */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 14 }}>
          {cat.badges.map((b) => (
            <span
              key={b}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 8,
                background: isDark ? "rgba(255,255,255,0.15)" : cat.badgeBg,
                color: isDark ? "#fff" : cat.badgeText,
                letterSpacing: 0.3,
              }}
            >
              {b}
            </span>
          ))}
        </div>

        {/* Rate */}
        <p
          style={{
            fontSize: 12,
            color: isDark ? "rgba(255,255,255,0.6)" : "#6B7280",
            marginBottom: 8,
          }}
        >
          {cat.rate}
        </p>

        {/* Big Number */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 800,
            color: isDark ? "#fff" : cat.accentColor,
            fontFamily: "'Geist Mono', monospace",
            letterSpacing: -1,
            marginBottom: 16,
          }}
        >
          {revealed ? <CountingNumber value={cat.net} prefix="$" /> : "$0"}
        </div>

        {/* Warning pill */}
        <div
          style={{
            marginTop: "auto",
            padding: "10px 14px",
            borderRadius: 12,
            background: cat.warningBg,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.04)"}`,
            fontSize: 12,
            fontWeight: 500,
            color: cat.warningTextColor,
            lineHeight: 1.5,
          }}
        >
          {cat.warningText}
        </div>
      </div>
    </div>
  );
}

export default function Slide19_TaxDeepDive() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-10 w-full" style={{ maxWidth: 800 }}>
          <h2
            className="text-4xl font-bold"
            style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}
          >
            <GoldUnderline><GradientText>Tax Deep Dive</GradientText></GoldUnderline>{" "}
            <span style={{ fontWeight: 400, color: "#6B7280" }}>—</span>{" "}
            <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 700 }}>
              $100,000
            </span>{" "}
            <span style={{ fontWeight: 400, color: "#6B7280" }}>Withdrawal</span>
          </h2>
          <p className="text-base mt-3" style={{ color: "#9CA3AF" }}>
            See exactly how each tax bucket impacts your retirement withdrawal
          </p>
        </RevealElement>

        {/* Cards — each loads independently */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          {categories.map((cat, i) => (
            <RevealElement key={cat.title} index={i + 2} direction="cardRise">
              <TaxCard cat={cat} revealed={isRevealed(i + 2)} />
            </RevealElement>
          ))}
        </div>

        {/* Key insight */}
        <RevealElement index={5} direction="whomp" className="flex justify-center mt-10">
          <div
            style={{
              background: "linear-gradient(135deg, #1A4D3E, #2A6B55)",
              borderRadius: 9999,
              padding: "14px 36px",
              boxShadow: "0 8px 24px -6px rgba(26,77,62,0.35)",
            }}
          >
            <p style={{ fontSize: 16, color: "#fff", fontWeight: 500 }}>
              The difference:{" "}
              <strong style={{ color: "#C8A96E", fontFamily: "'Geist Mono', monospace", fontWeight: 800 }}>
                {isRevealed(5) ? <CountingNumber value={50300} prefix="$" /> : "$0"}
              </strong>{" "}
              — just from knowing where to put your money.
            </p>
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
