import { motion } from "framer-motion";

interface BubbleItem {
  label: string;
  value: string;
  size: number;
  color: string;
}

interface BubbleComparisonProps {
  items: BubbleItem[];
  animate?: boolean;
}

export default function BubbleComparison({ items, animate = false }: BubbleComparisonProps) {
  const sizes = { 1: 100, 2: 140, 3: 180 };

  return (
    <div className="flex items-end justify-center gap-8">
      {items.map((item, i) => {
        const diameter = sizes[item.size as keyof typeof sizes] || 120;
        return (
          <motion.div
            key={item.label}
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={animate ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, delay: i * 0.2, ease: "backOut" }}
          >
            <div
              className="flex items-center justify-center mb-3"
              style={{
                width: diameter,
                height: diameter,
                background: `${item.color}cc`,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: "var(--radius-full)",
                boxShadow: `0 8px 32px ${item.color}30`,
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <span
                className="font-bold antigravity-stat"
                style={{
                  fontSize: diameter / 4,
                  color: "white",
                }}
              >
                {item.value}
              </span>
            </div>
            <span className="text-xs font-medium text-center max-w-[120px]" style={{ color: "var(--ev-text-light)" }}>
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
