import { motion } from "framer-motion";
import { slideInLeft, fadeUp, scaleIn, explodeIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";

const carriers = [
  ["Prudential", "Principal", "Lincoln Financial Group", "Allianz"],
  ["Global Atlantic", "American National", "Securian Financial", "John Hancock"],
  ["Mutual of Omaha", "National Life Group", "North American", "AIG"],
  ["Equitable", "", "", ""],
];

export default function Slide05_CarrierLogos() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideInLeft} className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl" style={{ color: "#4A5565" }}>
            Committed to
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold">
            <GradientText>Bridging the Gap</GradientText>
          </h2>
        </motion.div>

        <motion.p variants={fadeUp} className="text-center text-base mb-8" style={{ color: "#4A5565" }}>
          Some of our 75+ financial companies we are partnered with
        </motion.p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {carriers.flat().filter(Boolean).map((name, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="flex items-center justify-center rounded-lg border border-gray-200 px-3 py-4"
              style={{ minHeight: "56px" }}
            >
              <span className="text-sm font-bold text-center" style={{ color: "#1A4D3E" }}>
                {name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={explodeIn} className="flex justify-center">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            75+ Partners
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
