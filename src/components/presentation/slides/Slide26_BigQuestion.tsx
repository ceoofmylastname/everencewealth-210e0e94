import { motion } from "framer-motion";
import { slideInLeft, fadeUp, explodeIn, staggerContainer } from "../animations/variants";
import GradientText from "../animations/GradientText";

const questions = [
  {
    label: "The government: $37.5T+ in Debt",
    question: "Social Security: Will it be enough?",
  },
  {
    label: "IRA / 401k",
    question: "What will your future tax rate be? Will you run out of money?",
  },
  {
    label: "Company Pension",
    question: "A thing of the past — very hard to find.",
  },
  {
    label: "Our Children: Source of Security?",
    question: "Can they really afford us?",
  },
];

export default function Slide26_BigQuestion() {
  return (
    <div className="antigravity-slide bg-white">
      <div className="antigravity-slide-inner">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h2 variants={slideInLeft} className="text-4xl font-bold mb-1" style={{ color: "#1A4D3E" }}>
              The BIG <GradientText>Question?</GradientText>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg mb-8" style={{ color: "#4A5565" }}>
              Do you have a <strong>Strategy</strong> you can rely on?
            </motion.p>

            <div className="space-y-4">
              {questions.map((q, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="antigravity-card"
                  style={{ borderLeft: "4px solid #C8A96E", padding: "16px 20px" }}
                >
                  <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#C8A96E" }}>
                    {q.label}
                  </div>
                  <p className="text-sm" style={{ color: "#4A5565" }}>
                    {q.question}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div variants={explodeIn} className="mt-6">
              <div className="px-5 py-3 rounded-xl" style={{ background: "#F5E6C8" }}>
                <p className="text-sm font-bold" style={{ color: "#1A4D3E" }}>
                  The worst tax rate in American history: <strong>94%</strong>. It happened before.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="rounded-xl overflow-hidden"
            style={{
              height: "420px",
              background: "linear-gradient(135deg, #1A3A50 0%, #2A4D66 50%, #C8A96E 100%)",
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
              American Flag on Building
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
