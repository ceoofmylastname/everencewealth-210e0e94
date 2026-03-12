import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";
import { BarChart2, Layers, Home, TrendingUp, Users } from "lucide-react";

const cards = [
  { icon: BarChart2, label: "Stocks?" },
  { icon: Layers, label: "Bonds?" },
  { icon: Home, label: "Real Estate?" },
  { icon: TrendingUp, label: "ETFs?" },
  { icon: Users, label: "Mutual Funds?" },
];

export default function Slide02_WhatDoesRetirementNeed() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Headline */}
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A4D3E" }}>
            What does every
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A4D3E" }}>
            <GoldUnderline>Retirement Account</GoldUnderline> need?
          </h2>
        </motion.div>

        {/* 5 Icon Cards */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-12"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="antigravity-card flex flex-col items-center gap-3 w-[140px]"
            >
              <card.icon className="w-10 h-10" style={{ color: "#1A4D3E" }} />
              <span className="text-base" style={{ color: "#4A5565" }}>{card.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom text */}
        <motion.div variants={fadeUp} className="text-center">
          <p className="text-2xl md:text-3xl font-bold" style={{ color: "#1A4D3E" }}>
            Retirement needs... <GoldUnderline><span style={{ color: "#C8A96E" }}>Strategy.</span></GoldUnderline>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
