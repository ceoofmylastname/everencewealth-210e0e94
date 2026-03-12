import { motion } from "framer-motion";

interface Bucket {
  label: string;
  rate: string;
  color: string;
  bgColor: string;
  trend: "up" | "down";
}

const BUCKETS: Bucket[] = [
  { label: "ORDINARY INCOME", rate: "40%+", color: "#D64545", bgColor: "#FFF1F1", trend: "up" },
  { label: "CAPITAL GAINS", rate: "40.3%", color: "#E8870A", bgColor: "#FFF8EB", trend: "up" },
  { label: "TAX FREE", rate: "0%", color: "#1A4D3E", bgColor: "#1A4D3E", trend: "down" },
];

interface TaxBucketsProps {
  /** Animate entry */
  animate?: boolean;
}

export default function TaxBuckets({ animate = false }: TaxBucketsProps) {
  return (
    <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
      {BUCKETS.map((b, i) => (
        <motion.div
          key={b.label}
          className="rounded-2xl p-6 flex flex-col items-center text-center"
          style={{
            background: b.bgColor,
            color: b.bgColor === "#1A4D3E" ? "white" : "#1A4D3E",
            boxShadow: "0 8px 32px rgba(26,77,62,0.12)",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={animate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: i * 0.15 }}
        >
          <div
            className="text-xs font-bold px-3 py-1 rounded-full mb-4"
            style={{ background: b.color, color: "white" }}
          >
            {b.trend === "up" ? "↑" : "↓"} Taxes
          </div>
          <h3 className="text-sm font-bold mb-2">{b.label}</h3>
          <div
            className="text-4xl font-bold mb-1"
            style={{ fontFamily: "'Geist Mono', monospace" }}
          >
            {b.rate}
          </div>
          <div className="text-xs opacity-70">Tax Rate</div>
        </motion.div>
      ))}
    </div>
  );
}
