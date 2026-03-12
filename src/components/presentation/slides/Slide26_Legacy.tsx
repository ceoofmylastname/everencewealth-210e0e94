import { useState } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import ConfettiTrigger from "../animations/ConfettiTrigger";
import { useRevealQueue } from "../RevealContext";

export default function Slide26_Legacy() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { soundEnabled } = useRevealQueue();

  return (
    <div className="antigravity-slide">
      {/* Warm golden background — always visible */}
      <div
        className="antigravity-full-bleed"
        style={{
          background: "linear-gradient(135deg, #C8A96E 0%, #1A4D3E 40%, #0D1F1A 70%, #C8A96E 100%)",
        }}
      />
      <div className="antigravity-overlay-dark" style={{ background: "rgba(0,0,0,0.45)" }} />

      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />

      <div className="relative z-10 antigravity-slide-inner flex flex-col items-center justify-center text-center">
        {/* Reveal 1: Headlines */}
        <RevealElement index={1} direction="left">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-2">
            <GradientText>Legacy</GradientText> doesn't have to be a dream,
          </h2>
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8">
            It can be a <GradientText>reality again.</GradientText>
          </h2>
        </RevealElement>

        {/* Reveal 2: Divider */}
        <RevealElement index={2} direction="none" className="mb-8">
          <div
            className="w-[120px] h-[2px] mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, #C8A96E, transparent)" }}
          />
        </RevealElement>

        {/* Reveal 3: Thank You */}
        <RevealElement index={3} direction="up" onRevealed={() => setShowConfetti(true)}>
          <h3 className="text-4xl text-white mb-8">
            Thank You
          </h3>
        </RevealElement>

        {/* Reveal 4: CTA Card */}
        <RevealElement index={4} direction="scale" className="mb-6">
          <div className="antigravity-card max-w-md text-center">
            <p className="text-lg font-bold mb-4" style={{ color: "#1A4D3E" }}>
              Schedule Your Financial Needs Assessment
            </p>
            <button
              className="px-8 py-3 rounded-lg text-white font-bold text-base transition-all hover:opacity-90"
              style={{ background: "#1A4D3E" }}
            >
              Book My Strategy Session →
            </button>
          </div>
        </RevealElement>

        {/* Reveal 5: Logo */}
        <RevealElement index={5} direction="up">
          <div
            className="text-xl font-bold tracking-wider mb-2"
            style={{ color: "#C8A96E", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            EVERENCE WEALTH
          </div>
          <p className="text-white/50 text-xs">
            455 Market St Ste 1940 PMB 350011 | San Francisco, CA 94105
          </p>
        </RevealElement>
      </div>
    </div>
  );
}
