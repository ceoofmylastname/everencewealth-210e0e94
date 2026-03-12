import { motion } from "framer-motion";
import { dropIn, slideInLeft, fadeUp, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";

export default function Slide01_Hero({ soundEnabled: _ }: { soundEnabled?: boolean }) {
  return (
    <div className="antigravity-slide">
      {/* Dark architectural background */}
      <div
        className="antigravity-full-bleed"
        style={{
          background: "linear-gradient(135deg, #0D1F1A 0%, #1A3A30 40%, #0D1F1A 100%)",
        }}
      />
      <div className="antigravity-overlay-dark" style={{ background: "rgba(0,0,0,0.4)" }} />

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div variants={dropIn} className="mb-6">
          <div
            className="text-2xl font-bold tracking-wider"
            style={{ color: "#C8A96E", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            EVERENCE WEALTH
          </div>
        </motion.div>

        {/* Gold rule */}
        <motion.div
          variants={fadeUp}
          className="w-[120px] h-[2px] mb-10"
          style={{ background: "linear-gradient(90deg, transparent, #C8A96E, transparent)" }}
        />

        {/* Headlines */}
        <motion.h1
          variants={slideInLeft}
          className="text-white font-bold leading-none mb-2"
          style={{ fontSize: "clamp(48px, 7vw, 72px)", fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "0.02em" }}
        >
          BRIDGING THE
        </motion.h1>
        <motion.h1
          variants={slideInLeft}
          className="text-white font-bold leading-none mb-2"
          style={{ fontSize: "clamp(48px, 7vw, 72px)", fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "0.02em" }}
        >
          RETIREMENT
        </motion.h1>
        <motion.h1
          variants={slideInLeft}
          className="font-bold leading-none"
          style={{ fontSize: "clamp(48px, 7vw, 72px)", fontFamily: "'DM Sans', system-ui, sans-serif", letterSpacing: "0.02em" }}
        >
          <GoldUnderline delay={1.2}>
            <GradientText>GAP</GradientText>
          </GoldUnderline>
        </motion.h1>

        {/* Presenter badge */}
        <motion.div
          variants={fadeUp}
          className="mt-12 px-6 py-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
        >
          <span className="text-white/80 text-sm" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
            David Rosenberg | Everence Wealth
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
