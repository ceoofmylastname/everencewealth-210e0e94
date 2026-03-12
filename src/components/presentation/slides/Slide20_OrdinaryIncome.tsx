import { motion } from "framer-motion";
import { fadeUp, slideInLeft, explodeIn, scaleIn, staggerContainer } from "../animations/variants";
import CountingNumber from "../animations/CountingNumber";

const badges = ["401(k)", "457 Plan", "403(b)", "Pension"];

export default function Slide20_OrdinaryIncome() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={slideInLeft} className="text-4xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
              Ordinary Income
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base mb-4" style={{ color: "#4A5565" }}>
              Taxed at the Highest Marginal Rate
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-6">
              {badges.map((b, i) => (
                <span key={i} className="antigravity-pill-evergreen text-xs">{b}</span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mb-3">
              <span className="text-sm" style={{ color: "#4A5565" }}>Withdrawal:</span>
              <span className="text-xl font-bold ml-2" style={{ color: "#1A4D3E" }}>$100,000</span>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-3">
              <span className="text-sm" style={{ color: "#4A5565" }}>
                37% Federal + 13.3% State = <strong>50.3% Total</strong>
              </span>
            </motion.div>

            <motion.div variants={explodeIn} className="mb-2">
              <span className="text-sm" style={{ color: "#4A5565" }}>Net After Tax:</span>
              <span className="text-4xl font-bold ml-3" style={{ color: "#D64545" }}>
                <CountingNumber value={49700} prefix="$" />
              </span>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs italic mb-4" style={{ color: "#9CA3AF" }}>
              (Subject to state)
            </motion.p>

            <motion.div variants={scaleIn}>
              <div className="px-4 py-3 rounded-xl" style={{ background: "#F5E6C8" }}>
                <p className="text-sm font-bold" style={{ color: "#1A4D3E" }}>
                  Half of your retirement — gone to taxes.
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
              background: "linear-gradient(135deg, #E8A0B0 0%, #D08090 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              Savings Concept
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
