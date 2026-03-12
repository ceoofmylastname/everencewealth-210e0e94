import { motion } from "framer-motion";
import { fadeUp, slideInLeft, scaleIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";

const missionBlocks = [
  "With over 45 years of combined experience in the financial services industry, at Everence Wealth, we are driven by one purpose: to deliver the very best.",
  "At Everence Wealth, we believe that true wealth is defined not only by numbers, but by endurance, legacy, and impact.",
  "Our mission is to help individuals and families build, preserve, and pass on a level of prosperity that stands the test of time. Through integrity, wisdom, and proven financial strategies, we empower our clients to create legacies that last.",
];

export default function Slide04_OurMission() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={slideInLeft} className="text-5xl mb-1" style={{ color: "#4A5565", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
              Our
            </motion.h2>
            <motion.h2 variants={slideInLeft} className="text-5xl font-bold mb-4" style={{ color: "#1A4D3E" }}>
              <GoldUnderline>Mission</GoldUnderline>
            </motion.h2>
            <motion.div
              variants={scaleIn}
              className="w-[80px] h-1 rounded-full mb-8"
              style={{ background: "#C8A96E" }}
            />

            {missionBlocks.map((block, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="antigravity-card mb-4"
                style={{ padding: "16px" }}
              >
                <p className="text-base leading-relaxed" style={{ color: "#4A5565" }}>
                  {block}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Side — Photo placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-xl overflow-hidden"
            style={{
              height: "400px",
              background: "linear-gradient(135deg, #1A4D3E 0%, #2A6D5E 40%, #C8A96E 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">
              Financial Advisor Meeting
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
