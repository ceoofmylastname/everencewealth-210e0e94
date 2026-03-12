import { useState } from "react";
import RevealElement from "../RevealElement";
import ConfettiTrigger from "../animations/ConfettiTrigger";
import { useRevealQueue } from "../RevealContext";

export default function Slide21_BridgingTheGap() {
  const [showConfetti, setShowConfetti] = useState(false);
  const { soundEnabled } = useRevealQueue();

  return (
    <div className="antigravity-slide">
      {/* Dramatic background — always visible */}
      <div
        className="antigravity-full-bleed"
        style={{
          background: "linear-gradient(135deg, #1A3A30 0%, #0D1F1A 40%, #1A4D3E 100%)",
        }}
      />
      <div className="antigravity-overlay-dark" style={{ background: "rgba(0,0,0,0.5)" }} />

      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />

      <div className="relative z-10 antigravity-slide-inner flex flex-col items-center justify-center text-center">
        {/* Reveal 1: Question */}
        <RevealElement index={1} direction="up">
          <h2 className="text-3xl md:text-4xl text-white mb-4">
            What is bridging the{" "}
            <span className="font-bold" style={{ color: "#C8A96E" }}>GAP</span>{" "}
            for Americans?
          </h2>
        </RevealElement>

        {/* Reveal 2: Divider */}
        <RevealElement index={2} direction="none" className="my-6">
          <div className="w-[80px] h-[2px] mx-auto" style={{ background: "#C8A96E" }} />
        </RevealElement>

        {/* Reveal 3: Three pillars */}
        <RevealElement index={3} direction="up">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {["Zero Floor Protection", "Tax-Free Growth", "No Hidden Fees"].map((item) => (
              <div
                key={item}
                className="px-5 py-3 rounded-xl text-white text-base font-medium"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(200,169,110,0.3)",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 4: Answer */}
        <RevealElement index={4} direction="scale">
          <div
            className="px-10 py-8 rounded-2xl"
            style={{
              background: "#C8A96E",
              boxShadow: "0 16px 64px rgba(200,169,110,0.4)",
            }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Indexed Account (SERP)
            </h2>
          </div>
        </RevealElement>

        {/* Reveal 5: Confetti trigger */}
        <RevealElement index={5} direction="up" className="mt-6" onRevealed={() => setShowConfetti(true)}>
          <p className="text-white/60 text-sm">
            The strategy that bridges protection, growth, and tax efficiency.
          </p>
        </RevealElement>
      </div>
    </div>
  );
}
