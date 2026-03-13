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
        <RevealElement index={1} direction="slam" className="mb-6">
          <h2 className="text-3xl font-bold" style={{ color: "#1A4D3E", fontFamily: "var(--font-display)" }}>
            How <GradientText>Strategy</GradientText> Impacts Performance
          </h2>
        </RevealElement>

        {/* Reveal 2: Canvas chart */}
        <RevealElement index={2} direction="up" className="w-full max-w-4xl mx-auto">
          <PerformanceChart animate={isRevealed(2)} />
        </RevealElement>

        {/* Reveal 3: Legend + Results */}
        <RevealElement index={3} direction="up" className="mt-4 mb-4">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded" style={{ background: "#E87070" }} />
              <span className="text-sm" style={{ color: "#4A5565" }}>S&P 500 Direct</span>
              <span className="text-sm font-bold antigravity-stat" style={{ color: "#E87070" }}>
                {isRevealed(3) ? <CountingNumber value={408888} prefix="$" /> : "$0"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded" style={{ background: "#1A4D3E" }} />
              <span className="text-sm" style={{ color: "#4A5565" }}>S&P 500 Indexed — 0% / 12% Cap</span>
              <span className="text-sm font-bold antigravity-stat" style={{ color: "#1A4D3E" }}>
                {isRevealed(3) ? <CountingNumber value={541391} prefix="$" /> : "$0"}
              </span>
            </div>
          </div>
        </RevealElement>

        {/* Reveal 4: Badge */}
        <RevealElement index={4} direction="explode" className="flex justify-center">
          <div className="antigravity-pill-gold text-sm font-bold px-5 py-2">
            +$132,503 MORE — Protected Strategy
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
