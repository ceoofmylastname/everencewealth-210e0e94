// Framer Motion animation variants for the Antigravity Presentation System

export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "backOut" } },
};

export const flipIn = {
  hidden: { opacity: 0, rotateX: -90 },
  visible: { opacity: 1, rotateX: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const dropIn = {
  hidden: { opacity: 0, y: -40, scale: 1.1 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
};

export const explodeIn = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: [0, 1.2, 0.95, 1],
    transition: { duration: 0.7, times: [0, 0.5, 0.75, 1], ease: "easeInOut" },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

export const staggerFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.96,
  }),
};

export const slideTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  duration: 0.5,
};
