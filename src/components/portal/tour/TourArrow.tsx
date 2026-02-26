import { motion } from "framer-motion";

const BRAND_GOLD = "#C9A84C";

interface TourArrowProps {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  step: number;
}

export function TourArrow({ fromX, fromY, toX, toY, step }: TourArrowProps) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const cx1 = fromX + dx * 0.5;
  const cy1 = fromY;
  const cx2 = fromX + dx * 0.5;
  const cy2 = toY;

  const d = `M ${fromX} ${fromY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toX} ${toY}`;

  // Arrowhead at destination
  const angle = Math.atan2(toY - cy2, toX - cx2);
  const arrowLen = 10;
  const a1x = toX - arrowLen * Math.cos(angle - 0.4);
  const a1y = toY - arrowLen * Math.sin(angle - 0.4);
  const a2x = toX - arrowLen * Math.cos(angle + 0.4);
  const a2y = toY - arrowLen * Math.sin(angle + 0.4);
  const arrowD = `M ${a1x} ${a1y} L ${toX} ${toY} L ${a2x} ${a2y}`;

  return (
    <svg
      className="fixed inset-0 z-[105] pointer-events-none"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id="arrow-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        key={`path-${step}`}
        d={d}
        fill="none"
        stroke={BRAND_GOLD}
        strokeWidth={2}
        strokeLinecap="round"
        filter="url(#arrow-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      />
      <motion.path
        key={`arrow-${step}`}
        d={arrowD}
        fill="none"
        stroke={BRAND_GOLD}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#arrow-glow)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.7 }}
      />
    </svg>
  );
}
