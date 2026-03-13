import { motion, type TargetAndTransition } from "framer-motion";
import { useRevealQueue } from "./RevealContext";
import { sound } from "./sounds/SoundEngine";
import { useRef } from "react";
import type { ReactNode, CSSProperties } from "react";

type Direction =
  | "up"
  | "down"
  | "left"
  | "right"
  | "scale"
  | "none"
  | "slam"
  | "wipe"
  | "drift"
  | "cardRise"
  | "explode"
  | "drop"
  | "whomp";

const hiddenTargetAndTransitions: Record<Direction, TargetAndTransition> = {
  up: { opacity: 0, y: 40 },
  down: { opacity: 0, y: -40 },
  left: { opacity: 0, x: -60 },
  right: { opacity: 0, x: 60 },
  scale: { opacity: 0, scale: 0.8 },
  none: { opacity: 0 },
  slam: { opacity: 0, y: 50, skewY: 2, filter: "blur(6px)" },
  wipe: { scaleX: 0 },
  drift: { opacity: 0, y: 10 },
  cardRise: { opacity: 0, y: 36, rotate: -0.8 },
  explode: { opacity: 0, scale: 0 },
  drop: { opacity: 0, y: -48, rotate: 4 },
  whomp: { opacity: 0, scale: 1.08, filter: "blur(4px)" },
};

const visibleTargetAndTransitions: Record<Direction, TargetAndTransition> = {
  up: { opacity: 1, y: 0 },
  down: { opacity: 1, y: 0 },
  left: { opacity: 1, x: 0 },
  right: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  none: { opacity: 1 },
  slam: { opacity: 1, y: 0, skewY: 0, filter: "blur(0px)" },
  wipe: { scaleX: 1 },
  drift: { opacity: 1, y: 0 },
  cardRise: { opacity: 1, y: 0, rotate: 0 },
  explode: { opacity: 1, scale: 1 },
  drop: { opacity: 1, y: 0, rotate: 0 },
  whomp: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

const transitions: Partial<Record<Direction, object>> = {
  slam: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  wipe: { duration: 0.65, ease: [0.87, 0, 0.13, 1] },
  drift: { duration: 1.1, ease: "easeOut" },
  cardRise: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  explode: { duration: 0.7, ease: "easeOut" },
  drop: { type: "spring", stiffness: 480, damping: 22, mass: 0.7 },
  whomp: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};

const soundMap: Record<Direction, () => void> = {
  up: () => sound.chime(880),
  down: () => sound.chime(880),
  left: () => sound.swoosh(),
  right: () => sound.swoosh(),
  scale: () => sound.chime(880),
  none: () => {},
  slam: () => sound.swoosh(),
  wipe: () => sound.chime(440),
  drift: () => {},
  cardRise: () => sound.chime(880),
  explode: () => sound.explode(),
  drop: () => sound.chime(1047),
  whomp: () => sound.whomp(),
};

interface RevealElementProps {
  /** The reveal step index (1-based) at which this element appears */
  index: number;
  children: ReactNode;
  /** Animation direction */
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
  const { isRevealed, soundEnabled } = useRevealQueue();
  const revealed = isRevealed(index);
  const hasFiredSound = useRef(false);

  // Fire sound once when revealed
  if (revealed && !hasFiredSound.current && soundEnabled) {
    hasFiredSound.current = true;
    soundMap[direction]();
  }

  const transition = transitions[direction] || { duration, ease: [0.22, 1, 0.36, 1] };

  return (
    <motion.div
      className={className}
      style={{
        ...(direction === "wipe" ? { transformOrigin: "left" } : {}),
        ...style,
      }}
      initial={hiddenTargetAndTransitions[direction]}
      animate={revealed ? visibleTargetAndTransitions[direction] : hiddenTargetAndTransitions[direction]}
      transition={transition}
      onAnimationComplete={() => {
        if (revealed && onRevealed) onRevealed();
      }}
    >
      {children}
    </motion.div>
  );
}
