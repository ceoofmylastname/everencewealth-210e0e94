import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "../animations/variants";

const buckets = [
  {
    title: "ORDINARY INCOME",
    bg: "#F5E6C8",
    badge: "↑ Taxes",
    badgeColor: "#D64545",
    rate: "40%+",
    rateLabel: "Tax Rate",
  },
  {
    title: "CAPITAL GAINS",
    bg: "#FFF8EB",
    badge: "↑ Taxes",
    badgeColor: "#E8870A",
    rate: "40.3%",
    rateLabel: "Tax Rate",
  },
  {
    title: "TAX FREE",
    bg: "#1A4D3E",
    textColor: "white",
    badge: "↓ Taxes",
    badgeColor: "#1A4D3E",
    rate: "0%",
    rateLabel: "Tax Rate",
  },
];

export default function Slide18_ThreeBuckets() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E" }}>
            Three Ways Your <span style={{ color: "#C8A96E" }}>Money Gets Taxed</span>
          </h2>
          <p className="text-lg mt-2" style={{ color: "#4A5565" }}>
            Let's assume the same numbers for all three categories. Withdrawal: <strong>$100,000</strong>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {buckets.map((b, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="rounded-2xl p-6 flex flex-col items-center text-center"
              style={{
                background: b.bg,
                color: b.textColor || "#1A4D3E",
                boxShadow: "0 8px 32px rgba(26,77,62,0.12)",
              }}
            >
              <div
                className="text-xs font-bold px-3 py-1 rounded-full mb-4"
                style={{
                  background: b.badgeColor,
                  color: "white",
                }}
              >
                {b.badge}
              </div>
              <h3 className="text-lg font-bold mb-2">{b.title}</h3>
              <div className="text-5xl font-bold mb-1">{b.rate}</div>
              <div className="text-sm opacity-70">{b.rateLabel}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
