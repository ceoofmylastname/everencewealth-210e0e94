import { useRef, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Heart, Clock, AlertTriangle, Users } from "lucide-react";
import RevealElement from "../RevealElement";
import { useRevealQueue } from "../RevealContext";
import GoldUnderline from "../animations/GoldUnderline";
import imgCritical from "@/assets/benefit-critical-illness.jpg";
import imgChronic from "@/assets/benefit-chronic-illness.jpg";
import imgTerminal from "@/assets/benefit-terminal-illness.jpg";
import imgReplacement from "@/assets/benefit-income-replacement.jpg";

const benefits = [
  {
    title: "Critical Illness / Critical Injury",
    desc: "Millions suffer heart attack, stroke or cancer",
    stat: "1 in 3",
    statLabel: "adults affected",
    image: imgCritical,
    icon: Heart,
    accent: "#E85D5D",
  },
  {
    title: "Chronic Illness Benefit",
    desc: "Long Term Care alternative — 90% don't own this",
    stat: "90%",
    statLabel: "unprotected",
    image: imgChronic,
    icon: Clock,
    accent: "#C8A96E",
  },
  {
    title: "Terminal Illness Benefit",
    desc: "12–24 months to live — access funds when you need them most",
    stat: "100%",
    statLabel: "benefit access",
    image: imgTerminal,
    icon: AlertTriangle,
    accent: "#6B8F9E",
  },
  {
    title: "Die Too Soon / Income Replacement",
    desc: "Family protection in the event of premature death",
    stat: "10×",
    statLabel: "income coverage",
    image: imgReplacement,
    icon: Users,
    accent: "#1A4D3E",
  },
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px) scale(1.02)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.35s cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      {children}
    </div>
  );
}

function BenefitCard({ ben, index }: { ben: typeof benefits[0]; index: number }) {
  const { isRevealed } = useRevealQueue();
  const revealed = isRevealed(index);
  const Icon = ben.icon;

  return (
    <TiltCard>
      <div
        className="rounded-3xl overflow-hidden relative group cursor-default"
        style={{
          height: "240px",
          boxShadow: "0 12px 40px -12px rgba(0,0,0,0.2), 0 4px 12px -4px rgba(0,0,0,0.08)",
        }}
      >
        {/* Background image with zoom */}
        <img
          src={ben.image}
          alt={ben.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Cinematic gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.8) 100%)`,
          }}
        />

        {/* Accent bar top-left */}
        <div
          className="absolute top-0 left-0 h-1 transition-all duration-700"
          style={{
            width: revealed ? "100%" : "0%",
            background: `linear-gradient(90deg, ${ben.accent}, transparent)`,
          }}
        />

        {/* Floating stat badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={revealed ? { opacity: 1, scale: 1, y: 0 } : {}}
          transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 20 }}
          className="absolute top-4 right-4"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "16px",
            padding: "8px 14px",
          }}
        >
          <div className="text-xl font-extrabold text-white leading-none">{ben.stat}</div>
          <div className="text-[10px] uppercase tracking-wider text-white/60 mt-0.5">{ben.statLabel}</div>
        </motion.div>

        {/* Icon pill */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={revealed ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="absolute top-4 left-4 flex items-center justify-center"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: ben.accent,
            boxShadow: `0 4px 20px ${ben.accent}66`,
          }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Bottom content */}
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={revealed ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="rounded-2xl px-5 py-4"
            style={{
              background: "rgba(26, 77, 62, 0.88)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(200, 169, 110, 0.25)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <h3
              className="text-[15px] font-bold text-white mb-1 leading-snug"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {ben.title}
            </h3>
            <p className="text-[13px] text-white/70 leading-relaxed">{ben.desc}</p>
          </motion.div>
        </div>

        {/* Light sweep on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
          }}
        />
      </div>
    </TiltCard>
  );
}

export default function Slide23_PlanBenefits() {
  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <div className="antigravity-slide-inner">
        {/* Title — Reveal 1 */}
        <RevealElement index={1} direction="slam" className="mb-2">
          <div className="flex items-end gap-4">
            <div>
              <h2
                className="text-4xl font-bold"
                style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
              >
                Plan <GoldUnderline>Benefits</GoldUnderline>
              </h2>
              <p className="text-base mt-2" style={{ color: "#6B7B8D" }}>
                Living benefits built into the indexed plan
              </p>
            </div>
            <div
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full mb-1"
              style={{
                background: "rgba(26, 77, 62, 0.06)",
                border: "1px solid rgba(26, 77, 62, 0.12)",
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: "#1A4D3E" }} />
              <span className="text-xs font-semibold" style={{ color: "#1A4D3E" }}>
                4 Living Benefits
              </span>
            </div>
          </div>
        </RevealElement>

        {/* Cards 2×2 — Reveals 2-5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
          {benefits.map((ben, i) => (
            <RevealElement key={ben.title} index={i + 2} direction="cardRise">
              <BenefitCard ben={ben} index={i + 2} />
            </RevealElement>
          ))}
        </div>
      </div>
    </div>
  );
}
