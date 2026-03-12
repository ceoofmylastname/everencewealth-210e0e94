import { motion } from "framer-motion";
import { slideInLeft, fadeUp, scaleIn, explodeIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";
import CountingNumber from "../animations/CountingNumber";

const columns = [
  {
    rate: "7%",
    color: "#1A4D3E",
    doubling: "10.2 years",
    rows: [
      { age: 30, value: 20000 },
      { age: 40, value: 40000 },
      { age: 50, value: 80000 },
      { age: 60, value: 160000 },
    ],
  },
  {
    rate: "10%",
    color: "#C8A96E",
    doubling: "7.2 years",
    rows: [
      { age: 30, value: 20000 },
      { age: 37, value: 40000 },
      { age: 44, value: 80000 },
      { age: 52, value: 160000 },
      { age: 59, value: 320000 },
      { age: 66, value: 640000 },
    ],
  },
  {
    rate: "12%",
    color: "#C8A96E",
    doubling: "6 years",
    rows: [
      { age: 30, value: 20000 },
      { age: 36, value: 40000 },
      { age: 42, value: 80000 },
      { age: 48, value: 160000 },
      { age: 54, value: 320000 },
      { age: 60, value: 640000 },
      { age: 66, value: 1200000 },
    ],
  },
];

export default function Slide07_CompoundInterest() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideInLeft} className="mb-2">
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#1A4D3E" }}>
            Compound <GradientText>Interest</GradientText>
          </h2>
          <p className="text-xl mt-1" style={{ color: "#4A5565" }}>The Rule of <strong>72</strong></p>
        </motion.div>
        <motion.p variants={fadeUp} className="text-sm mb-6" style={{ color: "#4A5565" }}>
          Investment of $20,000 at different rates of return starting at age 30
        </motion.p>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
          {columns.map((col, ci) => (
            <motion.div key={ci} variants={scaleIn} className="antigravity-card">
              {/* Gauge */}
              <div className="flex justify-center mb-3">
                <div
                  className="antigravity-gauge"
                  style={{ border: `4px solid ${col.color}`, borderBottom: "none" }}
                >
                  <div className="antigravity-gauge-label" style={{ color: col.color }}>
                    {col.rate}
                  </div>
                </div>
              </div>
              <p className="text-center text-sm mb-3" style={{ color: "#4A5565" }}>
                Doubles Every {col.doubling}
              </p>
              <div className="space-y-1">
                {col.rows.map((row, ri) => {
                  const isLast = ri === col.rows.length - 1;
                  return (
                    <div
                      key={ri}
                      className={`flex justify-between text-sm px-2 py-1 rounded ${isLast ? "font-bold" : ""}`}
                      style={isLast ? { background: "#F5E6C8", color: "#1A4D3E" } : { color: "#4A5565" }}
                    >
                      <span>Age {row.age}</span>
                      <span>
                        <CountingNumber value={row.value} prefix="$" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={explodeIn} className="flex justify-center mt-6">
          <div className="antigravity-pill-gold text-base font-bold px-6 py-2">
            2% difference = DOUBLE the money
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
