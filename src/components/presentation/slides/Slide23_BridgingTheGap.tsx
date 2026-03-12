import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, explodeIn, staggerContainer } from "../animations/variants";
import ConfettiTrigger from "../animations/ConfettiTrigger";

export default function Slide23_BridgingTheGap({ soundEnabled }: { soundEnabled?: boolean }) {
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <div className="antigravity-slide">
      {/* Dramatic background */}
      <div
        className="antigravity-full-bleed"
        style={{
          background: "linear-gradient(135deg, #1A3A30 0%, #0D1F1A 40%, #1A4D3E 100%)",
        }}
      />
      <div className="antigravity-overlay-dark" style={{ background: "rgba(0,0,0,0.5)" }} />

      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />

      <motion.div
        className="relative z-10 antigravity-slide-inner flex flex-col items-center justify-center text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Question */}
        <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl text-white mb-4">
          What is bridging the{" "}
          <span className="font-bold" style={{ color: "#C8A96E" }}>GAP</span>{" "}
          for Americans?
        </motion.h2>

        {/* Pause then answer */}
        <motion.div
          variants={explodeIn}
          onAnimationComplete={() => setShowConfetti(true)}
          className="mt-8 px-10 py-8 rounded-2xl"
          style={{
            background: "#C8A96E",
            boxShadow: "0 16px 64px rgba(200,169,110,0.4)",
          }}
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-white"
            style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
          >
            Indexed Account (SERP)
          </h2>
        </motion.div>
      </motion.div>
    </div>
  );
}
