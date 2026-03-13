// Framer Motion animation variants for the Antigravity Presentation System v2
import type { Variants } from "framer-motion";

/** SLAM — Playfair hero words. Fast, skewed, snaps hard. */
export const slam: Variants = {
  hidden: { opacity: 0, y: 50, skewY: 2, filter: "blur(6px)" },
  visible: {
    opacity: 1, y: 0, skewY: 0, filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** WIPE RIGHT — for gold rules, underlines, bars */
export const wipeRight: Variants = {
  hidden: { scaleX: 0, originX: "0%" },
  visible: {
    scaleX: 1, originX: "0%",
    transition: { duration: 0.65, ease: [0.87, 0, 0.13, 1] },
  },
};

/** DRIFT — for captions, subtitles. Barely moves. */
export const drift: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: "easeOut" as const } },
};

/** CARD RISE — for cards, panels, data blocks */
export const cardRise: Variants = {
  hidden: { opacity: 0, y: 36, rotate: -0.8 },
  visible: {
    opacity: 1, y: 0, rotate: 0,
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
  },
};

/** EXPLODE — for key answers, zero hero, confetti moments */
export const explode: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: [0, 1.18, 0.96, 1],
    transition: { duration: 0.7, times: [0, 0.55, 0.8, 1], ease: "easeOut" as const },
  },
};

/** DROP — for floating badges, icons from above */
export const drop: Variants = {
  hidden: { opacity: 0, y: -48, rotate: 4 },
  visible: {
    opacity: 1, y: 0, rotate: 0,
    transition: { type: "spring" as const, stiffness: 480, damping: 22, mass: 0.7 },
  },
};

/** SLIDE LEFT — content coming from right */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** SLIDE RIGHT — content coming from left */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

/** WHOMP — dark/dramatic stat reveals */
export const whomp: Variants = {
  hidden: { opacity: 0, scale: 1.08, filter: "blur(4px)" },
  visible: {
    opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// Keep legacy exports for compatibility
export const fadeUp = drift;
export const slideInLeft = slideRight;
export const scaleIn = explode;
export const dropIn = drop;
export const explodeIn = explode;

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};
