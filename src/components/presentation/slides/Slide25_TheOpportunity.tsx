import { useRef, type MouseEvent } from "react";
import { motion } from "framer-motion";
import { Calendar, Shield, TrendingUp, GraduationCap, ArrowRight } from "lucide-react";
import RevealElement from "../RevealElement";
import { useRevealQueue } from "../RevealContext";
import GradientText from "../animations/GradientText";
import BlobClip from "../BlobClip";
import teamImg from "@/assets/team-collaboration.jpg";

const benefits = [
  {
    title: "Build a Business on Your Schedule",
    desc: "Set your own hours and grow at your own pace with a proven system.",
    icon: Calendar,
    accent: "#C8A96E",
    num: "01",
  },
  {
    title: "Help Families Protect Their Retirement",
    desc: "Make a meaningful impact by bridging the retirement gap for real people.",
    icon: Shield,
    accent: "#1A4D3E",
    num: "02",
  },
  {
    title: "Uncapped Earning Potential",
    desc: "No salary ceiling — your income scales with your effort and results.",
    icon: TrendingUp,
    accent: "#C8A96E",
    num: "03",
  },
  {
    title: "Full Training & Mentorship",
    desc: "World-class onboarding, coaching, and a team that wants you to win.",
    icon: GraduationCap,
    accent: "#1A4D3E",
    num: "04",
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
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px) scale(1.01)`;
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
        className="relative group cursor-default overflow-hidden"
        style={{
          borderRadius: "20px",
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(200, 169, 110, 0.18)",
          boxShadow: "0 8px 32px -8px rgba(26, 77, 62, 0.08), 0 2px 8px -2px rgba(0,0,0,0.04)",
          padding: "16px 20px",
        }}
      >
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 h-[3px] transition-all duration-700"
          style={{
            width: revealed ? "100%" : "0%",
            background: `linear-gradient(90deg, ${ben.accent}, transparent)`,
          }}
        />

        <div className="flex items-center gap-4">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={revealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: ben.accent,
              boxShadow: `0 6px 20px ${ben.accent}44`,
            }}
          >
            <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-[15px] font-bold leading-snug"
              style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
            >
              {ben.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-[13px] mt-0.5 leading-relaxed"
              style={{ color: "#6B7B8D" }}
            >
              {ben.desc}
            </motion.p>
          </div>

          {/* Number badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={revealed ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 20 }}
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(26, 77, 62, 0.06)",
              border: "1px solid rgba(26, 77, 62, 0.1)",
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 700,
              color: "#1A4D3E",
            }}
          >
            {ben.num}
          </motion.div>
        </div>

        {/* Light sweep on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            borderRadius: "20px",
            background: "linear-gradient(115deg, transparent 40%, rgba(200,169,110,0.08) 50%, transparent 60%)",
          }}
        />
      </div>
    </TiltCard>
  );
}

export default function Slide25_TheOpportunity() {
  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <div className="antigravity-editorial">
        {/* Left */}
        <div className="flex flex-col justify-center">
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam">
            <div className="mb-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
                style={{
                  background: "rgba(26, 77, 62, 0.06)",
                  border: "1px solid rgba(26, 77, 62, 0.1)",
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: "#C8A96E" }} />
                <span className="text-xs font-semibold" style={{ color: "#1A4D3E" }}>
                  Join Our Team
                </span>
              </div>
            </div>
            <h2
              className="text-4xl font-bold mb-2"
              style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}
            >
              The <GradientText>Opportunity</GradientText>
            </h2>
            <p className="text-base mb-6" style={{ color: "#6B7B8D" }}>
              Join the Everence Wealth team and help families bridge their retirement gap.
            </p>
          </RevealElement>

          {/* Reveals 2-5: Individual benefit cards */}
          <div className="space-y-3">
            {benefits.map((ben, i) => (
              <RevealElement key={ben.title} index={i + 2} direction="cardRise">
                <BenefitCard ben={ben} index={i + 2} />
              </RevealElement>
            ))}
          </div>

          {/* Reveal 6: CTA */}
          <RevealElement index={6} direction="explode" className="mt-6">
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-7 py-3.5 cursor-pointer group"
              style={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #1A4D3E, #2A6B54)",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "16px",
                boxShadow: "0 8px 24px -6px rgba(26, 77, 62, 0.4)",
              }}
            >
              Learn More About Joining
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={7} direction="right" className="flex items-center justify-center">
          <BlobClip
            imageSrc={teamImg}
            imageAlt="Everence Wealth team collaboration"
            height="420px"
            variant={1}
          />
        </RevealElement>
      </div>
    </div>
  );
}
