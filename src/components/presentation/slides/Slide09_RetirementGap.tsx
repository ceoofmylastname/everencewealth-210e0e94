import RevealElement from "../RevealElement";

const causes = [
  { emoji: "💸", label: "Hidden Fees" },
  { emoji: "📉", label: "Market Volatility" },
  { emoji: "🏛", label: "Tax Exposure" },
];

export default function Slide09_RetirementGap() {
  return (
    <div className="antigravity-slide">
      {/* Dark dramatic background — always visible */}
      <div
        className="antigravity-full-bleed"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
        }}
      />
      <div className="antigravity-overlay-dark" style={{ background: "rgba(0,0,0,0.6)" }} />

      <div className="relative z-10 antigravity-slide-inner flex flex-col items-center justify-center text-center">
        {/* Reveal 1: Badge */}
        <RevealElement index={1} direction="drop" className="mb-8">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            ⚠ The Great Retirement Gap
          </div>
        </RevealElement>

        {/* Reveal 2: First headline */}
        <RevealElement index={2} direction="slam">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-display)" }}>
            It looks sturdy.
          </h2>
        </RevealElement>

        {/* Reveal 3: Second headline */}
        <RevealElement index={3} direction="drift">
          <p className="text-2xl text-white/80 mb-12" style={{ fontFamily: "var(--font-body)", fontWeight: 200, fontStyle: "italic" }}>
            Until the pressure forces it to break.
          </p>
        </RevealElement>

        {/* Reveal 4: Divider */}
        <RevealElement index={4} direction="wipe" className="mb-8">
          <div className="w-[80px] h-[2px] mx-auto" style={{ background: "#C8A96E" }} />
        </RevealElement>

        {/* Reveal 5: Three causes */}
        <RevealElement index={5} direction="cardRise">
          <div className="flex flex-wrap justify-center gap-4">
            {causes.map((cause, i) => (
              <div
                key={i}
                className="px-6 py-4 rounded-xl text-white text-lg font-medium"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                <span className="mr-2">{cause.emoji}</span>
                {cause.label}
              </div>
            ))}
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
