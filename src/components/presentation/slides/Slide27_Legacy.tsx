import { useState } from "react";
import { motion } from "framer-motion";
import { slideInLeft, fadeUp, scaleIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";
import ConfettiTrigger from "../animations/ConfettiTrigger";

export default function Slide27_Legacy({ soundEnabled }: { soundEnabled?: boolean }) {
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <div className="antigravity-slide">
      {/* Warm golden background */}
      <div
        className="antigravity-full-bleed"
        style={{
          background: "linear-gradient(135deg, #C8A96E 0%, #1A4D3E 40%, #0D1F1A 70%, #C8A96E 100%)",
        }}
      />
      <div className="antigravity-overlay-dark" style={{ background: "rgba(0,0,0,0.45)" }} />

      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />

      <motion.div
        className="relative z-10 antigravity-slide-inner flex flex-col items-center justify-center text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Headlines */}
        <motion.h2
          variants={slideInLeft}
          className="text-4xl md:text-6xl font-bold text-white leading-tight mb-2"
        >
          <GradientText>Legacy</GradientText> doesn't have to be a dream,
        </motion.h2>
        <motion.h2
          variants={slideInLeft}
          className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8"
        >
          It can be a <GradientText>reality again.</GradientText>
        </motion.h2>

        {/* Gold divider */}
        <motion.div
          variants={fadeUp}
          className="w-[120px] h-[2px] mb-8"
          style={{ background: "linear-gradient(90deg, transparent, #C8A96E, transparent)" }}
        />

        {/* Thank You */}
        <motion.h3
          variants={fadeUp}
          className="text-4xl text-white mb-8"
          onAnimationComplete={() => setShowConfetti(true)}
        >
          Thank You
        </motion.h3>

        {/* CTA Card */}
        <motion.div
          variants={scaleIn}
          className="antigravity-card max-w-md text-center mb-6"
        >
          <p className="text-lg font-bold mb-4" style={{ color: "#1A4D3E" }}>
            Schedule Your Financial Needs Assessment
          </p>
          <button
            className="px-8 py-3 rounded-lg text-white font-bold text-base transition-all hover:opacity-90"
            style={{ background: "#1A4D3E" }}
          >
            Book My Strategy Session →
          </button>
        </motion.div>

        {/* Logo */}
        <motion.div variants={fadeUp}>
          <div
            className="text-xl font-bold tracking-wider mb-2"
            style={{ color: "#C8A96E", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            EVERENCE WEALTH
          </div>
          <p className="text-white/50 text-xs">
            455 Market St Ste 1940 PMB 350011 | San Francisco, CA 94105
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
