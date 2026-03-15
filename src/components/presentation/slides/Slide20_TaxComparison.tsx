import { motion } from "framer-motion";
import RevealElement from "../RevealElement";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";
import { useRevealQueue } from "../RevealContext";
import MeshGradient from "../MeshGradient";
import MorphBlob from "../MorphBlob";

const comparisons = [
  {
    title: "Capital Gains",
    rate: "40.3%",
    rateColor: "#D64545",
    badge: "↑ Taxes",
    badgeBg: "#D64545",
    net: 59700,
    fillPct: 59,
    fillClass: "antigravity-progress-fill-gold",
  },
  {
    title: "Ordinary Income",
    rate: "50.3%",
    rateColor: "#D64545",
    badge: "↑ Taxes",
    badgeBg: "#D64545",
    net: 49700,
    fillPct: 49,
    fillClass: "antigravity-progress-fill-gold",
  },
  {
    title: "Tax Free",
    rate: "0%",
    rateColor: "#1A4D3E",
    badge: "↓ Taxes",
    badgeBg: "#1A4D3E",
    net: 100000,
    fillPct: 100,
    fillClass: "antigravity-progress-fill-green",
    highlight: true,
  },
];

export default function Slide20_TaxComparison() {
  const { isRevealed } = useRevealQueue();

  return (
    <div className="antigravity-slide">
      <MeshGradient variant="cool" />
      <MorphBlob size={300} color="rgba(26, 77, 62, 0.07)" top="-5%" right="-4%" delay={0} />
      <MorphBlob size={260} color="rgba(200, 169, 110, 0.07)" bottom="-6%" left="-3%" delay={5} />
      <div className="antigravity-slide-inner">
        {/* Reveal 1: Title */}
        <RevealElement index={1} direction="slam" className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--ev-green)", fontFamily: "var(--font-display)" }}>
            Tax <GradientText>Categories</GradientText> — Side by Side
          </h2>
        </RevealElement>

        {/* Reveal 2: Comparison cards */}
        <RevealElement index={2} direction="cardRise">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            {comparisons.map((c, i) => (
              <div
                key={i}
                className={`antigravity-card flex flex-col items-center text-center ${c.highlight ? "ring-2 ring-[#1A4D3E] scale-105" : ""}`}
              >
                <div
                  className="text-xs font-bold px-3 py-1 rounded-full mb-3"
                  style={{ background: c.badgeBg, color: "white" }}
                >
                  {c.badge}
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--ev-green)" }}>{c.title}</h3>
                <div className="text-4xl font-bold mb-3 antigravity-stat" style={{ color: c.rateColor }}>
                  {c.rate}
                </div>

                <div className="w-full mb-3">
                  <div className="text-xs mb-1 text-left" style={{ color: "var(--ev-text-light)" }}>Net After Tax:</div>
                  <div className="antigravity-progress-track">
                    <motion.div
                      className={c.fillClass}
                      initial={{ width: 0 }}
                      animate={isRevealed(2) ? { width: `${c.fillPct}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div
                  className={`font-bold antigravity-stat ${c.highlight ? "text-3xl" : "text-2xl"}`}
                  style={{ color: c.highlight ? "#1A4D3E" : "#C8A96E" }}
                >
                  {isRevealed(2) ? <CountingNumber value={c.net} prefix="$" /> : "$0"}
                </div>
              </div>
            ))}
          </div>
        </RevealElement>

        {/* Reveal 3: Divider */}
        <RevealElement index={3} direction="wipe" className="flex justify-center mb-4">
          <div className="w-[80px] h-[2px]" style={{ background: "var(--ev-gold)" }} />
        </RevealElement>

        {/* Reveal 4: Insight */}
        <RevealElement index={4} direction="whomp" className="text-center">
          <p className="text-lg" style={{ color: "var(--ev-text-light)" }}>
            The difference between knowing and not knowing: <strong className="antigravity-stat" style={{ color: "var(--ev-gold)" }}>$50,300</strong>
          </p>
        </RevealElement>
      </div>
    </div>
  );
}
