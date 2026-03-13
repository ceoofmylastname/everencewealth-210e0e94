import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface ClipRevealProps {
  children: ReactNode;
  isVisible: boolean;
  delay?: number;
}

export default function ClipReveal({ children, isVisible, delay = 0 }: ClipRevealProps) {
  return (
    <div style={{ overflow: "hidden", lineHeight: 1 }}>
      <motion.div
        initial={{ y: "110%" }}
        animate={isVisible ? { y: 0 } : { y: "110%" }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
          delay,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
