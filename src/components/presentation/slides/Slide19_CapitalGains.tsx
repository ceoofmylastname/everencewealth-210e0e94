import { motion } from "framer-motion";
import { fadeUp, slideInLeft, explodeIn, scaleIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";
import CountingNumber from "../animations/CountingNumber";

const badges = ["Bonds", "Stocks", "ETFs", "Crypto", "Brokerage Account"];

export default function Slide19_CapitalGains() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={slideInLeft} className="text-4xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
              <GoldUnderline>Capital Gains</GoldUnderline>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base mb-4" style={{ color: "#4A5565" }}>
              Taxed When You Sell Investments — Top Marginal Rate
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-6">
              {badges.map((b, i) => (
                <span key={i} className="antigravity-pill-evergreen text-xs">{b}</span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="h-px w-full mb-4" style={{ background: "#E5E7EB" }} />

            <motion.div variants={fadeUp} className="mb-3">
              <span className="text-sm" style={{ color: "#4A5565" }}>Withdrawal:</span>
              <span className="text-xl font-bold ml-2" style={{ color: "#1A4D3E" }}>$100,000</span>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-3">
              <span className="text-sm" style={{ color: "#4A5565" }}>Taxes: 28% Federal + 12.3% State</span>
            </motion.div>

            <motion.div variants={explodeIn} className="mb-4">
              <span className="text-sm" style={{ color: "#4A5565" }}>Net After Tax:</span>
              <span className="text-4xl font-bold ml-3" style={{ color: "#C8A96E" }}>
                <CountingNumber value={59700} prefix="$" />
              </span>
            </motion.div>

            <motion.div variants={scaleIn}>
              <div className="px-4 py-3 rounded-xl" style={{ background: "#FEE2E2" }}>
                <p className="text-sm font-medium" style={{ color: "#D64545" }}>
                  You thought you had $100k. You actually have $59,700.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-xl overflow-hidden"
            style={{
              height: "380px",
              background: "linear-gradient(135deg, #1A2E44 0%, #2A4060 50%, #C8A96E 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              Stock Market Data
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
