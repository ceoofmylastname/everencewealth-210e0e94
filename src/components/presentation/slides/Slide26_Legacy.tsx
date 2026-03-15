import { useState } from "react";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import ConfettiTrigger from "../animations/ConfettiTrigger";
import { useRevealQueue } from "../RevealContext";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

export default function Slide26_Legacy() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { soundEnabled } = useRevealQueue();

  return (
    <div className="antigravity-slide">
      <MeshGradient variant="gold" />
      <MorphBlob size={400} color="rgba(200, 169, 110, 0.15)" top="-10%" right="-6%" delay={0} />
      <MorphBlob size={320} color="rgba(26, 77, 62, 0.10)" bottom="-8%" left="-5%" delay={5} />
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
        <RevealElement index={1} direction="slam">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-2" style={{ fontFamily: "var(--font-display)" }}>
            <GradientText>Legacy</GradientText> doesn't have to be a dream,
          </h2>
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8" style={{ fontFamily: "var(--font-display)" }}>
            It can be a <GradientText>reality again.</GradientText>
          </h2>
        </RevealElement>

        {/* Reveal 2: Divider */}
        <RevealElement index={2} direction="wipe" className="mb-8">
          <div
            className="w-[120px] h-[2px] mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, #C8A96E, transparent)" }}
          />
        </RevealElement>

        {/* Reveal 3: Thank You */}
        <RevealElement index={3} direction="explode" onRevealed={() => setShowConfetti(true)}>
          <h3 className="text-4xl text-white mb-8">
            Thank You
          </h3>
        </RevealElement>

        {/* Reveal 4: CTA Card */}
        <RevealElement index={4} direction="cardRise" className="mb-6">
          <div className="antigravity-card max-w-md text-center">
            <p className="text-lg font-bold mb-4" style={{ color: "var(--ev-green)" }}>
              Schedule Your Financial Needs Assessment
            </p>
            <button
              className="px-8 py-3 rounded-xl text-white font-bold text-base transition-all hover:opacity-90"
              
            >
              Book My Strategy Session →
            </button>
          </div>
        </RevealElement>

        {/* Reveal 5: Logo */}
        <RevealElement index={5} direction="drift">
          <div
            className="text-xl font-bold tracking-wider mb-2"
            style={{ color: "var(--ev-gold)", fontFamily: "var(--font-display)" }}
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
