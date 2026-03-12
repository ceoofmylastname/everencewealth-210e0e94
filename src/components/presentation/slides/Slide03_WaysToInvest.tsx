import { motion } from "framer-motion";
import { fadeUp, scaleIn, staggerContainer, dropIn } from "../animations/variants";
import GradientText from "../animations/GradientText";

const columns = [
  {
    title: "FIXED",
    items: "Savings Account / CD / Bonds",
    bgColor: "#E8EBF0",
    recommended: false,
  },
  {
    title: "VARIABLE",
    items: "Brokerage Accounts / IRA / 401k / Stocks",
    bgColor: "#F5E6C8",
    recommended: false,
  },
  {
    title: "INDEXED",
    items: "Protection / Growth",
    bgColor: "#E8F0EC",
    recommended: true,
  },
];

export default function Slide03_WaysToInvest() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeUp} className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: "#1A4D3E" }}>
            Ways to <GradientText>Invest</GradientText>
          </h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-center text-lg mb-10" style={{ color: "#4A5565" }}>
          There are several ways to invest your money. Here, in broad terms, are three options:
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {columns.map((col, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className="antigravity-card relative flex flex-col items-center text-center"
              style={{ background: col.bgColor }}
            >
              {/* Image placeholder */}
              <div
                className="w-full h-[180px] rounded-xl mb-4"
                style={{
                  background: i === 0
                    ? "linear-gradient(135deg, #7B8BA4 0%, #4A5E7A 100%)"
                    : i === 1
                    ? "linear-gradient(135deg, #C8A96E 0%, #E2C896 100%)"
                    : "linear-gradient(135deg, #1A4D3E 0%, #2A6D5E 100%)",
                }}
              />
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#1A4D3E" }}>
                {col.title}
              </h3>
              <p className="text-sm" style={{ color: "#4A5565" }}>{col.items}</p>

              {col.recommended && (
                <motion.div
                  variants={dropIn}
                  className="antigravity-pill-gold mt-4"
                  style={{ padding: "6px 16px", borderRadius: "9999px", fontSize: "13px", fontWeight: 700 }}
                >
                  ✦ Recommended
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
