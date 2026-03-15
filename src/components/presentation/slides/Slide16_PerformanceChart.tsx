import RevealElement from "../RevealElement";
import PerformanceChart from "../PerformanceChart";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

export default function Slide16_PerformanceChart() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="mb-4">
          <h2 className="text-3xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            How <GradientText>Strategy</GradientText> Impacts Performance
          </h2>
          <p className="text-sm mt-1" style={{ color: "#4A5565" }}>
            $100,000 invested — S&P 500 Direct vs. Indexed Strategy (1999–2021)
          </p>
        </RevealElement>

        {/* Reveal 2: Chart with glassmorphism container */}
        <RevealElement index={2} direction="up" className="w-full max-w-5xl mx-auto">
          <div
            className="relative rounded-2xl overflow-hidden p-4"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {/* Subtle radial glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 60% 40%, rgba(26,77,62,0.04) 0%, transparent 70%)",
              }}
            />
            <PerformanceChart animate={isRevealed(2)} />
          </div>
        </RevealElement>

        {/* Reveal 3: Legend pills + results */}
        <RevealElement index={3} direction="up" className="mt-4 mb-3">
          <div className="flex flex-wrap justify-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(232,112,112,0.08)",
                border: "1px solid rgba(232,112,112,0.15)",
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: "#E87070" }} />
              <span className="text-xs font-medium" style={{ color: "#4A5565" }}>S&P 500 Direct</span>
              <span className="text-sm font-bold" style={{ color: "#E87070" }}>
                {isRevealed(3) ? <CountingNumber value={408888.23} prefix="$" decimals={2} /> : "$0.00"}
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "rgba(26,77,62,0.08)",
                border: "1px solid rgba(26,77,62,0.15)",
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: "#1A4D3E" }} />
              <span className="text-xs font-medium" style={{ color: "#4A5565" }}>Indexed — 0% / 12% Cap</span>
              <span className="text-sm font-bold" style={{ color: "#1A4D3E" }}>
                {isRevealed(3) ? <CountingNumber value={541391} prefix="$" decimals={2} /> : "$0.00"}
              </span>
            </div>
          </div>
        </RevealElement>

        {/* Reveal 4: Badges */}
        <RevealElement index={4} direction="explode" className="flex justify-center gap-3 flex-wrap">
          <div className="antigravity-pill-gold text-sm font-bold px-5 py-2">
            +$132,503 MORE — Protected Strategy
          </div>
          <div
            className="text-sm font-bold px-5 py-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #C5A55A, #E8D48B)",
              color: "#1A4D3E",
              boxShadow: "0 4px 12px rgba(197,165,90,0.3)",
            }}
          >
            Actual Rate over 20 Years: 5.57%
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
