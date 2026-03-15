import RevealElement from "../RevealElement";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const quotes = [
  "The typical 401k investor is a financial novice.",
  "Mediocre. With half the funds... dogs.",
  "A raid on these funds by the people of Wall Street.",
];

export default function Slide10_SixtyMinutes() {
  return (
    <div className="antigravity-slide" >
      <MeshGradient variant="cool" />
      <MorphBlob size={340} color="rgba(26, 77, 62, 0.08)" top="-7%" left="-5%" delay={0} />
      <MorphBlob size={300} color="rgba(200, 169, 110, 0.10)" bottom="-8%" right="-6%" delay={4} />
      <div className="antigravity-slide-inner flex flex-col items-center justify-center">
        {/* Reveal 1: TV Frame */}
        <RevealElement index={1} direction="whomp" className="w-full max-w-xl mb-8">
          <div
            className="rounded-2xl p-1"
            style={{
              background: "linear-gradient(135deg, #333 0%, #1a1a1a 100%)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div className="rounded-xl p-8 text-center" style={{ background: "#111" }}>
              <div className="text-white font-bold text-3xl mb-4">60 Minutes</div>
              <div className="text-4xl font-bold text-white/90 tracking-wider">
                401k RECESSION
              </div>
              <div
                className="mt-4 h-[120px] rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #1a2030 0%, #0f1520 100%)" }}
              >
                <span className="text-white/30 text-sm">Broadcast Studio</span>
              </div>
            </div>
          </div>
        </RevealElement>

        {/* Reveal 2: Quote cards */}
        <RevealElement index={2} direction="cardRise">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
            {quotes.map((quote, i) => (
              <div key={i} className="antigravity-card text-center" style={{ padding: "16px" }}>
                <p className="text-sm font-medium" style={{ color: "var(--ev-text-light)" }}>
                  "{quote}"
                </p>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 3: Divider */}
        <RevealElement index={3} direction="wipe" className="flex justify-center mb-4">
          <div className="w-[60px] h-[2px]" style={{ background: "var(--ev-gold)" }} />
        </RevealElement>

        {/* Reveal 4: Bottom badge */}
        <RevealElement index={4} direction="drop" className="flex justify-center">
          <div className="antigravity-pill-gold text-sm font-bold px-6 py-2">
            These facts are real. These fees are yours.
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
