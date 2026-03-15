import RevealElement from "../RevealElement";
import GoldUnderline from "../animations/GoldUnderline";
import { BarChart2, Layers, Home, TrendingUp, Users } from "lucide-react";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const cards = [
  { icon: BarChart2, label: "Stocks?" },
  { icon: Layers, label: "Bonds?" },
  { icon: Home, label: "Real Estate?" },
  { icon: TrendingUp, label: "ETFs?" },
  { icon: Users, label: "Mutual Funds?" },
];

export default function Slide02_WhatDoesRetirementNeed() {
  return (
    <div className="antigravity-slide">
      <MeshGradient variant="warm" />
      <MorphBlob size={350} color="rgba(200, 169, 110, 0.10)" top="-8%" right="-5%" delay={0} />
      <MorphBlob size={250} color="rgba(26, 77, 62, 0.06)" bottom="-6%" left="-4%" delay={3} />
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Headline */}
        <RevealElement index={1} direction="slam" className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
            What does every
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
            <GoldUnderline>Retirement Account</GoldUnderline> need?
          </h2>
        </RevealElement>

        {/* Reveal 2-3: Icon cards (first 3, then last 2) */}
        <RevealElement index={2} direction="cardRise" className="flex flex-wrap justify-center gap-6 mb-4">
          {cards.slice(0, 3).map((card, i) => (
            <div
              key={i}
              className="antigravity-card flex flex-col items-center gap-3 w-[140px]"
            >
              <card.icon className="w-10 h-10" style={{ color: "var(--ev-green)" }} />
              <span className="text-base" style={{ color: "var(--ev-text-light)" }}>{card.label}</span>
            </div>
          ))}
        </RevealElement>

        <RevealElement index={3} direction="cardRise" className="flex flex-wrap justify-center gap-6 mb-12">
          {cards.slice(3).map((card, i) => (
            <div
              key={i}
              className="antigravity-card flex flex-col items-center gap-3 w-[140px]"
            >
              <card.icon className="w-10 h-10" style={{ color: "var(--ev-green)" }} />
              <span className="text-base" style={{ color: "var(--ev-text-light)" }}>{card.label}</span>
            </div>
          ))}
        </RevealElement>

        {/* Reveal 4: Divider */}
        <RevealElement index={4} direction="wipe" className="flex justify-center mb-6">
          <div className="w-[80px] h-[2px]" style={{ background: "var(--ev-gold)" }} />
        </RevealElement>

        {/* Reveal 5: Answer */}
        <RevealElement index={5} direction="explode" className="text-center">
          <p className="text-2xl md:text-3xl font-bold" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
            Retirement needs... <GoldUnderline><span style={{ color: "var(--ev-gold)" }}>Strategy.</span></GoldUnderline>
          </p>
        </RevealElement>
      </div>
    </div>
  );
}
