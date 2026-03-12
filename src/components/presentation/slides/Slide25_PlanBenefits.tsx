import { motion } from "framer-motion";
import { slideInLeft, fadeUp, flipIn, staggerContainer } from "../animations/variants";
import GoldUnderline from "../animations/GoldUnderline";

const benefits = [
  {
    title: "Critical Illness / Critical Injury Benefit",
    desc: "Millions suffer heart attack, stroke or cancer",
    bg: "linear-gradient(135deg, #4A7A6A 0%, #1A4D3E 100%)",
  },
  {
    title: "Chronic Illness Benefit",
    desc: "Long Term Care alternative — 90% don't own this",
    bg: "linear-gradient(135deg, #5A8A7A 0%, #2A5D4E 100%)",
  },
  {
    title: "Terminal Illness Benefit",
    desc: "12–24 months to live",
    bg: "linear-gradient(135deg, #6A9A8A 0%, #3A6D5E 100%)",
  },
  {
    title: "Die Too Soon / Income Replacement",
    desc: "Family protection in the event of premature death",
    bg: "linear-gradient(135deg, #7AAA9A 0%, #4A7D6E 100%)",
  },
];

export default function Slide25_PlanBenefits() {
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
            Plan <GoldUnderline>Benefits</GoldUnderline>
          </h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-base mb-8" style={{ color: "#4A5565" }}>
          Advantage inside the indexed plan
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((ben, i) => (
            <motion.div
              key={i}
              variants={flipIn}
              className="rounded-2xl overflow-hidden relative"
              style={{ height: "200px", background: ben.bg }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div
                  className="rounded-xl p-4"
                  style={{ background: "#1A4D3E", color: "white" }}
                >
                  <h3 className="text-base font-bold mb-1">{ben.title}</h3>
                  <p className="text-sm opacity-80">{ben.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
