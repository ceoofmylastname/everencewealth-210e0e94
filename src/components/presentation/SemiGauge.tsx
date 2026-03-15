import { motion } from "framer-motion";

interface SemiGaugeProps {
  value: number;
  label: string;
  color?: string;
  animate?: boolean;
  size?: number;
}

export default function SemiGauge({
  value,
  label,
  color = "#C8A96E",
  animate = false,
  size = 120,
}: SemiGaugeProps) {
  const radius = size / 2 - 8;
  const circumference = Math.PI * radius;
  const fill = (value / 100) * circumference;

  return (
    <div
      className="flex flex-col items-center"
      style={{
        background: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius: "var(--radius-md)",
        padding: "16px 20px 12px",
        border: "1px solid rgba(255, 255, 255, 0.4)",
      }}
    >
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        <path
          d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <motion.path
          d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animate ? circumference - fill : circumference }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div
        className="text-2xl font-bold -mt-4 antigravity-stat"
        style={{ color }}
      >
        {value}%
      </div>
      <div className="text-xs mt-1 text-center" style={{ color: "var(--ev-text-light)" }}>{label}</div>
    </div>
  );
}
