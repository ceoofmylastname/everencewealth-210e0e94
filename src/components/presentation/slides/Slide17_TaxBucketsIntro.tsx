import { motion } from "framer-motion";
import { slideInLeft, fadeUp, scaleIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";

export default function Slide17_TaxBucketsIntro() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideInLeft} className="text-center mb-2">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A4D3E" }}>
            Tax <GoldUnderline><GradientText>Categories</GradientText></GoldUnderline>
          </h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-center text-lg mb-12" style={{ color: "#4A5565" }}>
          The three different ways your money is taxed and how it can impact you
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Bucket 1 - Ordinary Income */}
          <motion.div variants={scaleIn} className="antigravity-card flex flex-col items-center text-center" style={{ background: "#F5E6C8" }}>
            <div
              className="w-24 h-20 rounded-b-3xl mb-4"
              style={{ background: "linear-gradient(180deg, #D4C9A0, #C8A96E)", borderRadius: "8px 8px 24px 24px" }}
            />
            <h3 className="text-xl font-bold mb-2" style={{ color: "#1A4D3E" }}>ORDINARY INCOME</h3>
            <p className="text-sm" style={{ color: "#4A5565" }}>401(k) | 403(b) | 457 Plan | Pension</p>
          </motion.div>

          {/* Bucket 2 - Capital Gains */}
          <motion.div variants={scaleIn} className="antigravity-card flex flex-col items-center text-center" style={{ background: "#FFF8EB" }}>
            <div
              className="w-24 h-20 rounded-b-3xl mb-4"
              style={{ background: "linear-gradient(180deg, #E2C896, #C8A96E)", borderRadius: "8px 8px 24px 24px" }}
            />
            <h3 className="text-xl font-bold mb-2" style={{ color: "#1A4D3E" }}>CAPITAL GAINS</h3>
            <p className="text-sm" style={{ color: "#4A5565" }}>Stocks | ETFs | Bonds | Crypto | Brokerage</p>
          </motion.div>

          {/* Bucket 3 - Tax Free (Teaser) */}
          <motion.div variants={fadeUp} className="antigravity-card flex flex-col items-center text-center border-2 border-dashed" style={{ borderColor: "#C8A96E" }}>
            <div
              className="w-24 h-20 rounded-b-3xl mb-4 flex items-center justify-center"
              style={{ background: "#E5E7EB", borderRadius: "8px 8px 24px 24px" }}
            >
              <span className="text-3xl font-bold" style={{ color: "#9CA3AF" }}>?</span>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#9CA3AF" }}>TAX FREE</h3>
            <p className="text-sm italic" style={{ color: "#9CA3AF" }}>Coming Next...</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
