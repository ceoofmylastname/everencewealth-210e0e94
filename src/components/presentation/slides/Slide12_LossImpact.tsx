import { motion } from "framer-motion";
import { fadeUp, scaleIn, explodeIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";

const bubbles = [
  { start: "$100k", loss: "-25%", result: "$75k", recovery: "+33% needed to recover", color: "#D4C9A0" },
  { start: "$100k", loss: "-33%", result: "$67k", recovery: "+50% needed", color: "#C8A96E" },
  { start: "$100k", loss: "-50%", result: "$50k", recovery: "+100% needed", color: "#8BA89C", danger: true },
];

export default function Slide12_LossImpact() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="text-center mb-4">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E" }}>
            Traditional Approach to <GradientText>Investing</GradientText>
          </h2>
          <p className="text-lg mt-2" style={{ color: "#4A5565" }}>
            How stock market losses impact returns
          </p>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" animate="visible">
          {bubbles.map((b, i) => (
            <motion.div key={i} variants={scaleIn} className="flex flex-col items-center">
              {/* Bubble */}
              <div
                className="w-[180px] h-[180px] rounded-full flex flex-col items-center justify-center mb-4"
                style={{ background: b.color }}
              >
                <span className="text-3xl font-bold" style={{ color: "#1A4D3E" }}>{b.start}</span>
                <span className="text-xl font-bold" style={{ color: "#D64545" }}>{b.loss}</span>
                <span className="text-2xl font-bold" style={{ color: "#1A4D3E" }}>{b.result}</span>
              </div>
              <motion.div
                variants={b.danger ? explodeIn : fadeUp}
                className="text-center font-bold"
                style={{ color: b.danger ? "#D64545" : "#1A4D3E" }}
              >
                {b.recovery}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 text-center">
          <div className="antigravity-card-dark inline-block px-8 py-4">
            <p className="text-lg text-white font-medium">
              100% gains take years. 50% losses happen in <strong>ONE year</strong>.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
