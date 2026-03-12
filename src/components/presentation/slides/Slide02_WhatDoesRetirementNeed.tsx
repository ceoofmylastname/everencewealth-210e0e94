import RevealElement from "../RevealElement";
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
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Headline */}
        <RevealElement index={1} direction="up" className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A4D3E" }}>
            What does every
          </h2>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A4D3E" }}>
            <GoldUnderline>Retirement Account</GoldUnderline> need?
          </h2>
        </RevealElement>

        {/* Reveal 2-3: Icon cards (first 3, then last 2) */}
        <RevealElement index={2} direction="scale" className="flex flex-wrap justify-center gap-6 mb-4">
          {cards.slice(0, 3).map((card, i) => (
            <div
              key={i}
              className="antigravity-card flex flex-col items-center gap-3 w-[140px]"
            >
              <card.icon className="w-10 h-10" style={{ color: "#1A4D3E" }} />
              <span className="text-base" style={{ color: "#4A5565" }}>{card.label}</span>
            </div>
          ))}
        </RevealElement>

        <RevealElement index={3} direction="scale" className="flex flex-wrap justify-center gap-6 mb-12">
          {cards.slice(3).map((card, i) => (
            <div
              key={i}
              className="antigravity-card flex flex-col items-center gap-3 w-[140px]"
            >
              <card.icon className="w-10 h-10" style={{ color: "#1A4D3E" }} />
              <span className="text-base" style={{ color: "#4A5565" }}>{card.label}</span>
            </div>
          ))}
        </RevealElement>

        {/* Reveal 4: Divider */}
        <RevealElement index={4} direction="none" className="flex justify-center mb-6">
          <div className="w-[80px] h-[2px]" style={{ background: "#C8A96E" }} />
        </RevealElement>

        {/* Reveal 5: Answer */}
        <RevealElement index={5} direction="up" className="text-center">
          <p className="text-2xl md:text-3xl font-bold" style={{ color: "#1A4D3E" }}>
            Retirement needs... <GoldUnderline><span style={{ color: "#C8A96E" }}>Strategy.</span></GoldUnderline>
          </p>
        </RevealElement>
      </div>
    </div>
  );
}
