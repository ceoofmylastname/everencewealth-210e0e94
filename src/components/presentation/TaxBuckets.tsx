import { motion } from "framer-motion";

interface Bucket {
  label: string;
  rate: string;
  color: string;
  glassBg: string;
  trend: "up" | "down";
}

const BUCKETS: Bucket[] = [
  { label: "ORDINARY INCOME", rate: "40%+", color: "#D64545", glassBg: "rgba(255, 241, 241, 0.5)", trend: "up" },
  { label: "CAPITAL GAINS", rate: "40.3%", color: "#E8870A", glassBg: "rgba(255, 248, 235, 0.5)", trend: "up" },
  { label: "TAX FREE", rate: "0%", color: "#1A4D3E", glassBg: "rgba(26, 77, 62, 0.75)", trend: "down" },
];

interface TaxBucketsProps {
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
            background: b.glassBg,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: b.glassBg.includes("26, 77, 62")
              ? "1px solid rgba(255, 255, 255, 0.1)"
              : "1px solid rgba(255, 255, 255, 0.5)",
            color: b.glassBg.includes("26, 77, 62") ? "white" : "#1A4D3E",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.4)",
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
