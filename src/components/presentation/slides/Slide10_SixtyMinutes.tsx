import { motion } from "framer-motion";
import { scaleIn, fadeUp, explodeIn, staggerContainer } from "../animations/variants";

const quotes = [
  "The typical 401k investor is a financial novice.",
  "Mediocre. With half the funds... dogs.",
  "A raid on these funds by the people of Wall Street.",
];

export default function Slide10_SixtyMinutes() {
  return (
    <div className="antigravity-slide" style={{ background: "#1A4D3E" }}>
      <motion.div
        className="antigravity-slide-inner flex flex-col items-center justify-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* TV Frame */}
        <motion.div
          variants={scaleIn}
          className="rounded-2xl p-1 mb-8 w-full max-w-xl"
          style={{
            background: "linear-gradient(135deg, #333 0%, #1a1a1a 100%)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.4)",
          }}
        >
          <div className="rounded-xl p-8 text-center" style={{ background: "#111" }}>
            <div className="text-white font-bold text-3xl mb-4" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              60 Minutes
            </div>
            <div className="text-4xl font-bold text-white/90 tracking-wider">
              401k RECESSION
            </div>
            <div className="mt-4 h-[120px] rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1a2030 0%, #0f1520 100%)" }}
            >
              <span className="text-white/30 text-sm">Broadcast Studio</span>
            </div>
          </div>
        </motion.div>

        {/* Quote callouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
          {quotes.map((quote, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="antigravity-card text-center"
              style={{ padding: "16px" }}
            >
              <p className="text-sm font-medium" style={{ color: "#4A5565" }}>
                "{quote}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom badge */}
        <motion.div variants={explodeIn}>
          <div className="antigravity-pill-gold text-sm font-bold px-6 py-2">
            These facts are real. These fees are yours.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
