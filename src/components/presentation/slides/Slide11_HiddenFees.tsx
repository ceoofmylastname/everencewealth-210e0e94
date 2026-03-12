import { motion } from "framer-motion";
import { slideInLeft, fadeUp, flipIn, explodeIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";
import GoldUnderline from "../animations/GoldUnderline";

const feeData = [
  { year: 1, noFee: "$3,888", fee095: "$3,851", fee2: "$3,810", fee3: "$3,771" },
  { year: 10, noFee: "$56,312", fee095: "$53,143", fee2: "$49,846", fee3: "$46,908" },
  { year: 20, noFee: "$177,923", fee095: "$157,429", fee2: "$137,775", fee3: "$121,587" },
  { year: 25, noFee: "$284,236", fee095: "$242,669", fee2: "$204,397", fee3: "$174,153" },
  { year: 30, noFee: "$440,445", fee095: "$362,077", fee2: "$292,881", fee3: "$240,479" },
  { year: 35, noFee: "$669,968", fee095: "$529,350", fee2: "$410,402", fee3: "$324,167", bold: true },
];

const costs = [
  { label: "0.95% Fee", value: "$140,618" },
  { label: "2% Fee", value: "$259,566" },
  { label: "3% Fee", value: "$345,801", highlight: true },
];

export default function Slide11_HiddenFees() {
  return (
    <div className="antigravity-slide bg-white">
      <motion.div
        className="antigravity-slide-inner"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={slideInLeft} className="mb-2">
          <h2 className="text-3xl font-bold" style={{ color: "#4A5565" }}>
            Hidden Fees inside
          </h2>
          <h2 className="text-3xl font-bold">
            <GoldUnderline><GradientText>Retirement Plans</GradientText></GoldUnderline>
          </h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-sm mb-4" style={{ color: "#4A5565" }}>
          $3,600 annual contribution, 8% compounded, 35 years
        </motion.p>

        {/* Fee Table */}
        <motion.div variants={fadeUp} className="overflow-x-auto mb-4">
          <table className="antigravity-fee-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>No Fee</th>
                <th>0.95% Fee</th>
                <th>2% Fee</th>
                <th>3% Fee</th>
              </tr>
            </thead>
            <tbody>
              {feeData.map((row, i) => (
                <motion.tr
                  key={i}
                  variants={flipIn}
                  style={row.bold ? { fontWeight: 700, background: "#F5E6C8" } : {}}
                >
                  <td>{row.year}</td>
                  <td>{row.noFee}</td>
                  <td>{row.fee095}</td>
                  <td>{row.fee2}</td>
                  <td>{row.fee3}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Cost of Plan row */}
        <motion.div variants={explodeIn} className="flex flex-wrap gap-3 justify-center mb-4">
          {costs.map((cost, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-xl text-center"
              style={{
                background: cost.highlight ? "#C8A96E" : "#F5E6C8",
                color: cost.highlight ? "white" : "#1A4D3E",
              }}
            >
              <div className="text-xs">{cost.label}</div>
              <div className="text-lg font-bold">{cost.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Callouts */}
        <motion.div variants={explodeIn} className="flex flex-col items-center gap-2">
          <div className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: "#FEE2E2", color: "#D64545" }}>
            Average 401k fees: <strong>3.1%</strong> — More than HALF your account gone.
          </div>
          <div className="px-4 py-2 rounded-xl text-sm" style={{ background: "#FEE2E2", color: "#D64545" }}>
            Average advisor total fees: <strong>3.7%</strong>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
