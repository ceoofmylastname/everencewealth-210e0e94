import { motion } from "framer-motion";

interface SemiGaugeProps {
  /** Value 0-100 for gauge fill percentage */
  value: number;
  /** Display label below the gauge */
  label: string;
  /** Color of the filled arc */
  color?: string;
  /** Whether to animate */
  animate?: boolean;
  /** Size in pixels */
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
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
        {/* Background track */}
        <path
          d={`M 8 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 8} ${size / 2}`}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Filled arc */}
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
        className="text-2xl font-bold -mt-4"
        style={{ color, fontFamily: "'Geist Mono', monospace" }}
      >
        {value}%
      </div>
      <div className="text-xs text-gray-500 mt-1 text-center">{label}</div>
    </div>
  );
}
