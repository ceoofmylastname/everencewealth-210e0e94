import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, explodeIn, staggerContainer } from "../animations/variants";
import ConfettiTrigger from "../animations/ConfettiTrigger";

const steps = [
  { label: "Start:", value: "$100,000", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Market Loss:", value: "-0%", color: "#FFFFFF", textColor: "#1A4D3E", badge: true },
  { label: "Protected:", value: "$100,000", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Cap:", value: "+25%", color: "#F5E6C8", textColor: "#C8A96E" },
  { label: "Result:", value: "$125,000", color: "#F5E6C8", textColor: "#1A4D3E", explode: true },
];

export default function Slide14_IndexingSolution({ soundEnabled }: { soundEnabled?: boolean }) {
  const [showConfetti, setShowConfetti] = useState(false);

  return (
    <div className="antigravity-slide bg-white">
      <ConfettiTrigger trigger={showConfetti} soundEnabled={soundEnabled} />
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — Number sequence */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-6" style={{ color: "#1A4D3E" }}>
              Indexed Strategy
            </motion.h2>

            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={step.explode ? explodeIn : fadeUp}
                className="flex items-center justify-between px-5 py-3 rounded-xl relative"
                style={{
                  background: step.color,
                  border: step.badge ? "2px solid #1A4D3E" : "none",
                }}
                onAnimationComplete={() => {
                  if (step.explode) setShowConfetti(true);
                }}
              >
                <span className="text-base font-medium" style={{ color: "#4A5565" }}>{step.label}</span>
                <span className="text-2xl font-bold" style={{ color: step.textColor }}>{step.value}</span>
                {step.badge && (
                  <span
                    className="absolute -right-2 -top-2 text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: "#C8A96E", color: "white" }}
                  >
                    Zero is Your Hero
                  </span>
                )}
              </motion.div>
            ))}

            <motion.div variants={explodeIn} className="mt-4">
              <div
                className="inline-block px-6 py-3 rounded-xl text-xl font-bold"
                style={{ background: "#C8A96E", color: "white" }}
              >
                Zero is Your Hero ✦
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Photo placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-xl overflow-hidden"
            style={{
              height: "380px",
              background: "linear-gradient(135deg, #6BA08A 0%, #4A8A70 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              Happy family moving in
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
