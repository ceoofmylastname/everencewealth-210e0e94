import { useState } from "react";
import RevealElement from "../RevealElement";
import BlobClip from "../BlobClip";
import happyFamilyImg from "@/assets/happy-family-dream-home.jpg";
import ConfettiTrigger from "../animations/ConfettiTrigger";
import { useRevealQueue } from "../RevealContext";

const steps = [
  { label: "Start:", value: "$100,000", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Market Loss:", value: "-0%", color: "#FFFFFF", textColor: "#1A4D3E", badge: true },
  { label: "Protected:", value: "$100,000", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Cap:", value: "+25%", color: "#F5E6C8", textColor: "#C8A96E" },
  { label: "Result:", value: "$125,000", color: "#F5E6C8", textColor: "#1A4D3E" },
];

export default function Slide14_IndexingSolution() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { soundEnabled } = useRevealQueue();

  return (
    <div className="antigravity-slide bg-white">
      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />
      <div className="antigravity-editorial">
        {/* Left — Number sequence */}
        <div>
          {/* Reveal 1: Title */}
          <RevealElement index={1} direction="slam" className="mb-6">
            <h2 className="text-3xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
              Indexed Strategy
            </h2>
          </RevealElement>

          {/* Reveal 2: Steps */}
          <RevealElement index={2} direction="cardRise">
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3 rounded-xl relative"
                  style={{
                    background: step.color,
                    border: step.badge ? "2px solid #1A4D3E" : "none",
                  }}
                >
                  <span className="text-base font-medium" style={{ color: "#4A5565" }}>{step.label}</span>
                  <span className="text-2xl font-bold antigravity-stat" style={{ color: step.textColor }}>{step.value}</span>
                  {step.badge && (
                    <span
                      className="absolute -right-2 -top-2 text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: "#C8A96E", color: "white" }}
                    >
                      Zero is Your Hero
                    </span>
                  )}
                </div>
              ))}
            </div>
          </RevealElement>

          {/* Reveal 3: Badge */}
          <RevealElement index={3} direction="explode" className="mt-4">
            <div
              className="inline-block px-6 py-3 rounded-xl text-xl font-bold"
              style={{ background: "#C8A96E", color: "white" }}
            >
              Zero is Your Hero ✦
            </div>
          </RevealElement>

          {/* Reveal 4: Confetti moment */}
          <RevealElement index={4} direction="drop" className="mt-4" onRevealed={() => setShowConfetti(true)}>
            <div className="antigravity-pill-evergreen px-4 py-2 text-sm font-bold">
              Protection + Growth = Indexed Strategy
            </div>
          </RevealElement>
        </div>

        {/* Right — Blob image */}
        <RevealElement index={5} direction="right" className="flex items-center justify-center">
          <BlobClip
            gradient="linear-gradient(135deg, #6BA08A 0%, #4A8A70 100%)"
            label="Happy family"
            height="380px"
            variant={3}
          />
        </RevealElement>
      </div>
    </div>
  );
}
