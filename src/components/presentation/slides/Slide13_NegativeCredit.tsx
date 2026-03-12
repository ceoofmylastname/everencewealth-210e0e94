import { motion } from "framer-motion";
import { fadeUp, explodeIn, staggerContainer } from "../animations/variants";

const steps = [
  { label: "Start:", value: "$100,000", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Market Loss:", value: "-50%", color: "#FEE2E2", textColor: "#D64545", explode: true },
  { label: "Remaining:", value: "$50,000", color: "#F3F4F6", textColor: "#4A5565" },
  { label: "Gain:", value: "+50%", color: "#E8F0EC", textColor: "#1A4D3E" },
  { label: "Result:", value: "$75,000", color: "#F5E6C8", textColor: "#1A4D3E" },
];

export default function Slide13_NegativeCredit() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left — Number sequence */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold mb-6" style={{ color: "#1A4D3E" }}>
              Traditional Approach
            </motion.h2>
            <motion.p variants={fadeUp} className="text-sm mb-4 italic" style={{ color: "#4A5565" }}>
              The consequence of a negative interest credit
            </motion.p>

            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={step.explode ? explodeIn : fadeUp}
                className="flex items-center justify-between px-5 py-3 rounded-xl"
                style={{ background: step.color }}
              >
                <span className="text-base font-medium" style={{ color: "#4A5565" }}>{step.label}</span>
                <span className="text-2xl font-bold" style={{ color: step.textColor }}>{step.value}</span>
              </motion.div>
            ))}

            <motion.div variants={explodeIn} className="mt-4">
              <div className="antigravity-pill-red px-4 py-2 text-sm font-bold">
                Still $25,000 short. Not even whole.
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
              background: "linear-gradient(135deg, #8B9AAF 0%, #5A6B80 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              Couple reviewing finances
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
