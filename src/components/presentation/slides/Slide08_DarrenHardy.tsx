import { motion } from "framer-motion";
import { slideInLeft, fadeUp, scaleIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";

export default function Slide08_DarrenHardy() {
  return (
    <div className="antigravity-slide" style={{ background: "#1A4D3E" }}>
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left side */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={slideInLeft} className="text-4xl font-bold text-white mb-2">
              The Compound Effect
            </motion.h2>
            <motion.div
              variants={scaleIn}
              className="w-[60px] h-1 rounded-full mb-4"
              style={{ background: "#C8A96E" }}
            />
          </motion.div>

          {/* Right — Quote */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="rounded-3xl p-8 relative"
            style={{
              background: "#0D2E25",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            <div className="text-8xl font-serif absolute -top-4 left-6" style={{ color: "#C8A96E", opacity: 0.3 }}>
              "
            </div>
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10 mt-6">
              <motion.p variants={fadeUp} className="text-xl md:text-2xl text-white/90 leading-relaxed">
                The compound effect is the{" "}
                <span className="font-bold" style={{ color: "#C8A96E" }}>principle</span>{" "}
                of reaping{" "}
                <GoldUnderline delay={0.8}>
                  <span className="font-bold" style={{ color: "#C8A96E" }}>huge rewards</span>
                </GoldUnderline>{" "}
                from a series of small,{" "}
                <span className="font-bold" style={{ color: "#C8A96E" }}>smart choices</span>
              </motion.p>
              <motion.p variants={fadeUp} className="text-white/60 text-lg mt-6 italic">
                — Darren Hardy
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
