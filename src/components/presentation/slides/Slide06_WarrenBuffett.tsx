import { motion } from "framer-motion";
import { slideInLeft, fadeUp, flipIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";

export default function Slide06_WarrenBuffett() {
  return (
    <div className="antigravity-slide" style={{ background: "#F8F7F4" }}>
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={slideInLeft} className="text-5xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
              <GoldUnderline>Warren Buffett</GoldUnderline>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-2xl mb-10" style={{ color: "#4A5565" }}>
              Rules to Building Wealth
            </motion.p>

            {/* Rule Cards */}
            <motion.div variants={flipIn} className="antigravity-card-dark mb-4">
              <span className="text-white text-lg">Rule 1:</span>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "#C8A96E", letterSpacing: "0.05em" }}
              >
                NEVER LOSE MONEY
              </div>
            </motion.div>

            <motion.div
              variants={flipIn}
              className="antigravity-card-dark"
            >
              <span className="text-white text-lg">Rule 2:</span>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "#C8A96E", letterSpacing: "0.05em" }}
              >
                NEVER FORGET RULE 1
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Photo placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="rounded-xl overflow-hidden"
            style={{
              height: "350px",
              background: "linear-gradient(135deg, #2A3D56 0%, #1A2D42 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              Successful Investor
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
