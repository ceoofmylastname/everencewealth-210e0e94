import RevealElement from "../RevealElement";
import PerformanceChart from "../PerformanceChart";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";

export default function Slide16_PerformanceChart() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide" style={{ background: "#FAFAF8" }}>
      <div className="antigravity-slide-inner flex flex-col items-center justify-center px-4">
        {/* Title */}
        <RevealElement index={1} direction="slam" className="mb-4 text-center">
          <h2 className="text-4xl font-bold" style={{ color: "#2a2a2a", fontFamily: "var(--font-display)" }}>
            How <GradientText>Strategy</GradientText> Impacts Performance
          </h2>
          <p className="text-sm mt-2" style={{ color: "#7a7a7a" }}>
            $100,000 invested — S&P 500 Direct vs. Indexed Strategy (1999–2021)
          </p>
        </RevealElement>

        {/* Chart */}
        <RevealElement index={2} direction="up" className="w-full max-w-5xl mx-auto">
          <div
            style={{
              borderRadius: 24,
              overflow: "hidden",
              padding: 20,
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.03)",
            }}
          >
            <PerformanceChart animate={isRevealed(2)} />
          </div>
        </RevealElement>

        {/* Legend pills */}
        <RevealElement index={3} direction="up" className="mt-4 mb-3">
          <div className="flex flex-wrap justify-center gap-4">
            <div
              className="flex items-center gap-2"
              style={{
                padding: "8px 20px",
                borderRadius: 9999,
                background: "rgba(232,112,112,0.06)",
                border: "1px solid rgba(232,112,112,0.12)",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 9999, background: "#E87070" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#5a5a5a" }}>S&P 500 Direct</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#E87070" }}>
                {isRevealed(3) ? <CountingNumber value={408888.23} prefix="$" decimals={2} /> : "$0.00"}
              </span>
            </div>
            <div
              className="flex items-center gap-2"
              style={{
                padding: "8px 20px",
                borderRadius: 9999,
                background: "rgba(26,77,62,0.06)",
                border: "1px solid rgba(26,77,62,0.12)",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: 9999, background: "#1A4D3E" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#5a5a5a" }}>Indexed — 0% / 12% Cap</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#1A4D3E" }}>
                {isRevealed(3) ? <CountingNumber value={541391.51} prefix="$" decimals={2} /> : "$0.00"}
              </span>
            </div>
          </div>
        </RevealElement>

        {/* Bottom badges */}
        <RevealElement index={4} direction="explode" className="flex justify-center gap-3 flex-wrap">
          <div
            style={{
              borderRadius: 9999,
              background: "linear-gradient(135deg, #1A4D3E 0%, #2E6B54 100%)",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              boxShadow: "0 6px 20px rgba(26,77,62,0.2)",
            }}
          >
            +$132,503.28 MORE — Protected Strategy
          </div>
          <div
            style={{
              borderRadius: 9999,
              background: "linear-gradient(135deg, #C8A96E 0%, #E8D5A8 50%, #C8A96E 100%)",
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 700,
              color: "#1a1a1a",
              boxShadow: "0 4px 16px rgba(200,169,110,0.25)",
            }}
          >
            Actual Rate over 20 Years: 5.57%
          </div>
        </RevealElement>
      </div>
    </div>
  );
}
