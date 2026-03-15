import { motion } from "framer-motion";

interface Bucket {
  label: string;
  rate: string;
  color: string;
  trend: "up" | "down";
}

const BUCKETS: Bucket[] = [
  { label: "ORDINARY INCOME", rate: "40%+", color: "#D64545", trend: "up" },
  { label: "CAPITAL GAINS", rate: "40.3%", color: "#E8870A", trend: "up" },
  { label: "TAX FREE", rate: "0%", color: "#1A4D3E", trend: "down" },
];

interface TaxBucketsProps {
  animate?: boolean;
}

export default function TaxBuckets({ animate = false }: TaxBucketsProps) {
  return (
    <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
      {BUCKETS.map((b, i) => {
        const isGreen = b.color === "#1A4D3E";
        return (
          <motion.div
            key={b.label}
            className="ag-card-lift"
            style={{
              background: isGreen ? "rgba(26, 77, 62, 0.8)" : "rgba(255, 255, 255, 0.45)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: isGreen ? "1px solid rgba(200, 169, 110, 0.2)" : "1px solid rgba(255, 255, 255, 0.5)",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              color: isGreen ? "white" : "var(--ev-text)",
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={animate ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <div
              className="text-xs font-bold px-3 py-1 mb-4"
              style={{
                background: `${b.color}dd`,
                color: "white",
                borderRadius: "var(--radius-full)",
                backdropFilter: "blur(4px)",
              }}
            >
              {b.trend === "up" ? "\u2191" : "\u2193"} Taxes
            </div>
            <h3 className="text-sm font-bold mb-2">{b.label}</h3>
            <div
              className="text-4xl font-bold mb-1 antigravity-stat"
            >
              {b.rate}
            </div>
            <div className="text-xs opacity-70">Tax Rate</div>
          </motion.div>
        );
      })}
    </div>
  );
}
