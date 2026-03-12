import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, slideInLeft, explodeIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";
import CountingNumber from "../animations/CountingNumber";
import ConfettiTrigger from "../animations/ConfettiTrigger";

export default function Slide21_TaxFree({ soundEnabled }: { soundEnabled?: boolean }) {
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <div className="antigravity-slide bg-white">
      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={slideInLeft} className="text-5xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
              <GoldUnderline>Tax Free</GoldUnderline>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-xl mb-6" style={{ color: "#C8A96E" }}>
              0% State & Federal Income Tax
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-6">
              <span className="antigravity-pill-evergreen text-xs">Roth IRA</span>
              <span className="antigravity-pill-evergreen text-xs">SERP</span>
            </motion.div>

            <motion.div variants={fadeUp} className="h-px w-full mb-4" style={{ background: "#E5E7EB" }} />

            <motion.div variants={fadeUp} className="mb-3">
              <span className="text-sm" style={{ color: "#4A5565" }}>Withdrawal:</span>
              <span className="text-xl font-bold ml-2" style={{ color: "#1A4D3E" }}>$100,000</span>
            </motion.div>

            <motion.div
              variants={explodeIn}
              className="mb-4"
            >
              <span className="text-sm" style={{ color: "#4A5565" }}>Taxes:</span>
              <span className="text-4xl font-bold ml-3" style={{ color: "#C8A96E" }}>0%</span>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-2">
              <span className="text-sm" style={{ color: "#4A5565" }}>Net After Tax:</span>
            </motion.div>
            <motion.div
              variants={explodeIn}
              onAnimationComplete={() => setShowConfetti(true)}
            >
              <span
                className="font-bold"
                style={{ fontSize: "72px", color: "#C8A96E", lineHeight: 1 }}
              >
                <CountingNumber value={100000} prefix="$" />
              </span>
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-xl overflow-hidden"
            style={{
              height: "400px",
              background: "linear-gradient(135deg, #C8A96E 0%, #1A4D3E 50%, #0D1F1A 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              Luxury Cityscape
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
