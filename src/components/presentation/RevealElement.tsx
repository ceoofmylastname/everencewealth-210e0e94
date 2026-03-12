import { motion, type Variant } from "framer-motion";
import { useRevealQueue } from "./RevealContext";
import type { ReactNode, CSSProperties } from "react";

type Direction = "up" | "down" | "left" | "right" | "scale" | "none";

const hiddenVariants: Record<Direction, Variant> = {
  up: { opacity: 0, y: 40 },
  down: { opacity: 0, y: -40 },
  left: { opacity: 0, x: -60 },
  right: { opacity: 0, x: 60 },
  scale: { opacity: 0, scale: 0.8 },
  none: { opacity: 0 },
};

const visibleVariants: Record<Direction, Variant> = {
  up: { opacity: 1, y: 0 },
  down: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  none: { opacity: 1 },
};

interface RevealElementProps {
  /** The reveal step index (1-based) at which this element appears */
  index: number;
  children: ReactNode;
  /** Animation direction — defaults to "up" */
  direction?: Direction;
  /** Extra spring/tween config */
  duration?: number;
  /** Optional className */
  className?: string;
  /** Optional inline style */
  style?: CSSProperties;
  /** Callback when this element's reveal animation completes */
  onRevealed?: () => void;
}

export default function RevealElement({
  index,
  children,
  direction = "up",
  duration = 0.6,
  className,
  style,
  onRevealed,
}: RevealElementProps) {
  const { isRevealed } = useRevealQueue();
  const revealed = isRevealed(index);

  return (
    <motion.div
      className={className}
      style={style}
      initial={hiddenVariants[direction]}
      animate={revealed ? visibleVariants[direction] : hiddenVariants[direction]}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (revealed && onRevealed) onRevealed();
      }}
    >
      {children}
    </motion.div>
  );
}
