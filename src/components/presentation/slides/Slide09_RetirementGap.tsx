import { motion } from "framer-motion";
import { slideInLeft, fadeUp, dropIn, staggerContainer } from "../animations/variants";

const causes = [
  { emoji: "💸", label: "Hidden Fees" },
  { emoji: "📉", label: "Market Volatility" },
  { emoji: "🏛", label: "Tax Exposure" },
];

export default function Slide09_RetirementGap() {
  return (
    <div className="antigravity-slide">
      {/* Dark dramatic background */}
      <div
        className="antigravity-full-bleed"
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%)",
        }}
      />
      <div className="antigravity-overlay-dark" style={{ background: "rgba(0,0,0,0.6)" }} />

      <motion.div
        className="relative z-10 antigravity-slide-inner flex flex-col items-center justify-center text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={dropIn} className="mb-8">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            ⚠ The Great Retirement Gap
          </div>
        </motion.div>

        {/* Headlines */}
        <motion.h2 variants={slideInLeft} className="text-5xl md:text-6xl font-bold text-white mb-4">
          It looks sturdy.
        </motion.h2>
        <motion.p variants={fadeUp} className="text-2xl text-white/80 mb-12">
          Until the pressure forces it to break.
        </motion.p>

        {/* Three causes */}
        <motion.div className="flex flex-wrap justify-center gap-4" variants={staggerContainer} initial="hidden" animate="visible">
          {causes.map((cause, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="px-6 py-4 rounded-xl text-white text-lg font-medium"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <span className="mr-2">{cause.emoji}</span>
              {cause.label}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
