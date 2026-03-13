import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import { BarChart2, Layers, Home, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

const cards = [
  { icon: BarChart2, label: "Stocks?" },
  { icon: Layers, label: "Bonds?" },
  { icon: Home, label: "Real Estate?" },
  { icon: TrendingUp, label: "ETFs?" },
  { icon: Users, label: "Mutual Funds?" },
];

export default function Slide02_WhatDoesRetirementNeed() {
  return (
    <div className="antigravity-slide antigravity-slide02-bg">
      {/* Animated gradient mesh background */}
      <div className="antigravity-slide02-mesh" />

      <div className="antigravity-slide-inner" style={{ position: "relative", zIndex: 2 }}>
        {/* Headline */}
        <RevealElement index={1} direction="slam" className="text-center mb-14">
          <h2
            className="text-4xl md:text-5xl font-bold"
            style={{
              color: "#F9F8F5",
              fontFamily: "var(--font-display)",
              lineHeight: "var(--lh-title)",
              letterSpacing: "var(--ls-hero)",
            }}
          >
            What does every
          </h2>
          <h2
            className="text-4xl md:text-5xl font-bold"
            style={{
              fontFamily: "var(--font-display)",
              lineHeight: "var(--lh-title)",
              letterSpacing: "var(--ls-hero)",
            }}
          >
            <GoldUnderline>
              <span className="antigravity-gradient-text" style={{
                background: "linear-gradient(90deg, #C8A96E, #EDDB77, #C8A96E, #EDDB77)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Retirement Account
              </span>
            </GoldUnderline>{" "}
            <span style={{ color: "#F9F8F5" }}>need?</span>
          </h2>
        </RevealElement>

        {/* Glass cards grid */}
        <RevealElement index={2} direction="cardRise" className="flex flex-wrap justify-center gap-5 mb-6">
          {cards.slice(0, 3).map((card, i) => (
            <motion.div
              key={i}
              className="antigravity-glass-card flex flex-col items-center gap-4"
              style={{ width: 160, padding: 28, perspective: 800 }}
              whileHover={{
                rotateX: -5,
                rotateY: 5,
                scale: 1.08,
                boxShadow: "0 12px 48px rgba(200,169,110,0.35), 0 0 80px rgba(26,77,62,0.2)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="antigravity-icon-orb">
                <card.icon className="w-7 h-7" style={{ color: "#fff" }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 500 }}>
                {card.label}
              </span>
            </motion.div>
          ))}
        </RevealElement>

        <RevealElement index={3} direction="cardRise" className="flex flex-wrap justify-center gap-5 mb-14">
          {cards.slice(3).map((card, i) => (
            <motion.div
              key={i}
              className="antigravity-glass-card flex flex-col items-center gap-4"
              style={{ width: 160, padding: 28, perspective: 800 }}
              whileHover={{
                rotateX: -5,
                rotateY: -5,
                scale: 1.08,
                boxShadow: "0 12px 48px rgba(200,169,110,0.35), 0 0 80px rgba(26,77,62,0.2)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="antigravity-icon-orb">
                <card.icon className="w-7 h-7" style={{ color: "#fff" }} />
              </div>
              <span style={{ color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 500 }}>
                {card.label}
              </span>
            </motion.div>
          ))}
        </RevealElement>

        {/* Gold divider */}
        <RevealElement index={4} direction="wipe" className="flex justify-center mb-8">
          <div className="antigravity-gold-divider" />
        </RevealElement>

        {/* Answer */}
        <RevealElement index={5} direction="explode" className="text-center">
          <p
            className="text-3xl md:text-4xl font-bold"
            style={{
              color: "#F9F8F5",
              fontFamily: "var(--font-display)",
              lineHeight: "var(--lh-title)",
            }}
          >
            Retirement needs...{" "}
            <GoldUnderline>
              <span className="antigravity-gold-glow-text">Strategy.</span>
            </GoldUnderline>
          </p>
        </RevealElement>
      </div>
    </div>
  );
}
