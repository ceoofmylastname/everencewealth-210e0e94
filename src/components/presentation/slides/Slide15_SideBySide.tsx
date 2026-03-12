import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";

const variableSteps = [
  { value: "100k", color: "#F3F4F6" },
  { value: "-50%", color: "#FEE2E2", textColor: "#D64545" },
  { value: "$50K", color: "#FEE2E2", textColor: "#D64545" },
  { value: "+50%", color: "#E8F0EC", textColor: "#1A4D3E" },
  { value: "$75k", color: "#F5E6C8", textColor: "#C8A96E", bold: true },
];

const indexedSteps = [
  { value: "100k", color: "#E8F0EC" },
  { value: "-0%", color: "#FFFFFF", textColor: "#1A4D3E" },
  { value: "100k", color: "#E8F0EC", textColor: "#1A4D3E" },
  { value: "+25%", color: "#F5E6C8", textColor: "#C8A96E" },
  { value: "$125k", color: "#F5E6C8", textColor: "#C8A96E", bold: true },
];

export default function Slide15_SideBySide() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E" }}>
            Same Market. <GradientText>Different Strategy.</GradientText>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Variable Column */}
          <motion.div variants={scaleIn} className="rounded-2xl p-6" style={{ background: "#FEF2F2" }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#D64545" }}>
              Variable Strategy
            </h3>
            <div className="space-y-2">
              {variableSteps.map((s, i) => (
                <div
                  key={i}
                  className={`text-center py-2 rounded-lg text-lg ${s.bold ? "font-bold text-2xl" : "font-medium"}`}
                  style={{ background: s.color, color: s.textColor || "#4A5565" }}
                >
                  {s.value}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Indexed Column */}
          <motion.div variants={scaleIn} className="rounded-2xl p-6" style={{ background: "#E8F0EC" }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: "#1A4D3E" }}>
              Indexed Strategy
            </h3>
            <div className="space-y-2">
              {indexedSteps.map((s, i) => (
                <div
                  key={i}
                  className={`text-center py-2 rounded-lg text-lg ${s.bold ? "font-bold text-2xl" : "font-medium"}`}
                  style={{ background: s.color, color: s.textColor || "#1A4D3E" }}
                >
                  {s.value}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Comparison badge */}
        <motion.div variants={scaleIn} className="flex justify-center">
          <div className="antigravity-card-dark px-8 py-4 text-center">
            <p className="text-xl text-white">
              $75k vs $125k — <strong style={{ color: "#C8A96E" }}>$50,000 Difference</strong>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
