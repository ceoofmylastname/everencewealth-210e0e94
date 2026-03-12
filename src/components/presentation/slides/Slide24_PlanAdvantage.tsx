import { motion } from "framer-motion";
import { slideInLeft, fadeUp, scaleIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";
import { Monitor, RotateCcw, TrendingUp, Shield } from "lucide-react";

const advantages = [
  {
    icon: Monitor,
    title: "TAX DEFERRED GROWTH",
    desc: "Over long periods of time, tax deferral makes an incredible difference in the amount of money you have in a retirement plan.",
    borderColor: "#C8A96E",
  },
  {
    icon: RotateCcw,
    title: "ANNUAL RESET PROVISION",
    desc: "Capture and lock in each year of positive return. When there are negative returns, you don't lose.",
    borderColor: "#1A4D3E",
  },
  {
    icon: TrendingUp,
    title: "UPSIDE GROWTH POTENTIAL",
    desc: "Protecting your capital against loss while knowing your account can experience the potential for growth.",
    borderColor: "#C8A96E",
  },
  {
    icon: Shield,
    title: "PROTECTION",
    desc: "Protected from creditors, whether due to bankruptcy, lawsuit, or any other type of judgement.",
    borderColor: "#1A4D3E",
  },
];

export default function Slide24_PlanAdvantage() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideInLeft} className="mb-2">
          <h2 className="text-4xl font-bold" style={{ color: "#1A4D3E" }}>
            Plan <GoldUnderline>Advantage</GoldUnderline>
          </h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-base mb-8" style={{ color: "#4A5565" }}>
          Advantage inside the indexed plan
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advantages.map((adv, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="antigravity-card flex gap-4"
              style={{ borderTop: `4px solid ${adv.borderColor}` }}
            >
              <div className="flex-shrink-0 mt-1">
                <adv.icon className="w-8 h-8" style={{ color: "#1A4D3E" }} />
              </div>
              <div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#1A4D3E" }}>
                  {adv.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#4A5565" }}>
                  {adv.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
