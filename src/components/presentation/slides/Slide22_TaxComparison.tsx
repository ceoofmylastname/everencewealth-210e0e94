import { motion } from "framer-motion";
import { fadeUp, scaleIn, explodeIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";

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

export default function Slide22_TaxComparison() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E" }}>
            Tax <GradientText>Categories</GradientText> — Side by Side
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          {comparisons.map((c, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className={`antigravity-card flex flex-col items-center text-center ${c.highlight ? "ring-2 ring-[#1A4D3E] scale-105" : ""}`}
            >
              <div
                className="text-xs font-bold px-3 py-1 rounded-full mb-3"
                style={{ background: c.badgeBg, color: "white" }}
              >
                {c.badge}
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "#1A4D3E" }}>{c.title}</h3>
              <motion.div
                variants={c.highlight ? explodeIn : fadeUp}
                className="text-4xl font-bold mb-3"
                style={{ color: c.rateColor }}
              >
                {c.rate}
              </motion.div>

              <div className="w-full mb-3">
                <div className="text-xs mb-1 text-left" style={{ color: "#4A5565" }}>Net After Tax:</div>
                <div className="antigravity-progress-track">
                  <motion.div
                    className={c.fillClass}
                    initial={{ width: 0 }}
                    animate={{ width: `${c.fillPct}%` }}
                    transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              <div
                className={`text-2xl font-bold ${c.highlight ? "text-3xl" : ""}`}
                style={{ color: c.highlight ? "#1A4D3E" : "#C8A96E" }}
              >
                <CountingNumber value={c.net} prefix="$" />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeUp} className="text-center">
          <p className="text-lg" style={{ color: "#4A5565" }}>
            The difference between knowing and not knowing: <strong style={{ color: "#C8A96E" }}>$50,300</strong>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
